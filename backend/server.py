from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from typing import List, Optional
import os
import uuid
from datetime import datetime
import jwt
from passlib.context import CryptContext

# Models
class Plant(BaseModel):
    id: str
    name: str
    price: float
    description: str
    care_instructions: str
    sunlight_requirements: str
    category: str
    stock_quantity: int
    image_url: str
    weight: float = 2.0

class CartItem(BaseModel):
    plant_id: str
    quantity: int

class User(BaseModel):
    id: str
    email: str
    password_hash: str
    first_name: str
    last_name: str
    created_at: datetime

class UserRegister(BaseModel):
    email: str
    password: str
    first_name: str
    last_name: str

class UserLogin(BaseModel):
    email: str
    password: str

class ShippingInfo(BaseModel):
    address: str
    city: str
    state: str
    zip_code: str
    country: str = "US"

class OrderRequest(BaseModel):
    items: List[CartItem]
    shipping_info: ShippingInfo
    discount_code: Optional[str] = None
    user_id: Optional[str] = None
    
class DiscountCode(BaseModel):
    code: str
    type: str  # "percentage" or "fixed"
    value: float
    active: bool
    expires_at: datetime

# FastAPI app
app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = "your-secret-key-here-change-in-production"

# Database
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_URL)
db = client["nursery_ecommerce"]

# Sample plant data
SAMPLE_PLANTS = [
    {
        "id": "plant_001",
        "name": "Monstera Deliciosa",
        "price": 29.99,
        "description": "Beautiful tropical plant with large, glossy leaves and natural splits. Perfect for bright, indirect light.",
        "care_instructions": "Water when top inch of soil is dry. Provide bright, indirect light. Mist occasionally for humidity.",
        "sunlight_requirements": "Bright, indirect light",
        "category": "houseplant",
        "stock_quantity": 25,
        "image_url": "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHwxfHxwbGFudHN8ZW58MHx8fHwxNzUyMTcwMDcyfDA&ixlib=rb-4.1.0&q=85",
        "weight": 3.5
    },
    {
        "id": "plant_002", 
        "name": "Snake Plant",
        "price": 19.99,
        "description": "Low-maintenance succulent with upright, sword-like leaves. Great for beginners and low-light conditions.",
        "care_instructions": "Water every 2-3 weeks. Tolerates low light but prefers bright, indirect light.",
        "sunlight_requirements": "Low to bright, indirect light",
        "category": "houseplant",
        "stock_quantity": 40,
        "image_url": "https://images.unsplash.com/photo-1470058869958-2a77ade41c02?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHwyfHxwbGFudHN8ZW58MHx8fHwxNzUyMTcwMDcyfDA&ixlib=rb-4.1.0&q=85",
        "weight": 2.0
    },
    {
        "id": "plant_003",
        "name": "Fiddle Leaf Fig",
        "price": 49.99,
        "description": "Statement plant with large, violin-shaped leaves. A popular choice for modern interiors.",
        "care_instructions": "Water when top 2 inches of soil are dry. Needs bright, indirect light and consistent watering.",
        "sunlight_requirements": "Bright, indirect light",
        "category": "houseplant",
        "stock_quantity": 15,
        "image_url": "https://images.unsplash.com/photo-1601985705806-5b9a71f6004f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHwzfHxwbGFudHN8ZW58MHx8fHwxNzUyMTcwMDcyfDA&ixlib=rb-4.1.0&q=85",
        "weight": 4.0
    },
    {
        "id": "plant_004",
        "name": "Pothos",
        "price": 15.99,
        "description": "Trailing vine with heart-shaped leaves. Perfect for hanging baskets or climbing up poles.",
        "care_instructions": "Water when soil surface is dry. Thrives in various light conditions.",
        "sunlight_requirements": "Low to bright, indirect light",
        "category": "houseplant",
        "stock_quantity": 35,
        "image_url": "https://images.pexels.com/photos/807598/pexels-photo-807598.jpeg",
        "weight": 1.5
    },
    {
        "id": "plant_005",
        "name": "Succulent Collection",
        "price": 24.99,
        "description": "Beautiful collection of mixed succulents in decorative pots. Low maintenance and colorful.",
        "care_instructions": "Water sparingly, every 2-3 weeks. Provide bright light and good drainage.",
        "sunlight_requirements": "Bright, direct light",
        "category": "succulent",
        "stock_quantity": 20,
        "image_url": "https://images.pexels.com/photos/1470171/pexels-photo-1470171.jpeg",
        "weight": 2.5
    },
    {
        "id": "plant_006",
        "name": "Peace Lily",
        "price": 27.99,
        "description": "Elegant plant with white flowers and glossy green leaves. Great for low-light areas.",
        "care_instructions": "Keep soil moist but not soggy. Prefers low to medium light.",
        "sunlight_requirements": "Low to medium, indirect light",
        "category": "flowering",
        "stock_quantity": 18,
        "image_url": "https://images.pexels.com/photos/776656/pexels-photo-776656.jpeg",
        "weight": 3.0
    },
    {
        "id": "plant_007",
        "name": "Rubber Plant",
        "price": 34.99,
        "description": "Glossy, dark green leaves on a sturdy stem. A classic houseplant that grows into a beautiful tree.",
        "care_instructions": "Water when top inch of soil is dry. Wipe leaves regularly to maintain shine.",
        "sunlight_requirements": "Bright, indirect light",
        "category": "houseplant",
        "stock_quantity": 22,
        "image_url": "https://images.unsplash.com/photo-1592150621744-aca64f48394a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwxfHxob3VzZXBsYW50c3xlbnwwfHx8fDE3NTIxNzAwNzh8MA&ixlib=rb-4.1.0&q=85",
        "weight": 4.5
    },
    {
        "id": "plant_008",
        "name": "ZZ Plant",
        "price": 32.99,
        "description": "Extremely low-maintenance plant with waxy, dark green leaves. Perfect for offices and low-light areas.",
        "care_instructions": "Water every 2-4 weeks. Tolerates neglect and low light very well.",
        "sunlight_requirements": "Low to bright, indirect light",
        "category": "houseplant",
        "stock_quantity": 30,
        "image_url": "https://images.unsplash.com/photo-1583753075968-1236ccb83c66?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwyfHxob3VzZXBsYW50c3xlbnwwfHx8fDE3NTIxNzAwNzh8MA&ixlib=rb-4.1.0&q=85",
        "weight": 2.8
    }
]

# Sample discount codes
SAMPLE_DISCOUNT_CODES = [
    {
        "code": "SPRING20",
        "type": "percentage",
        "value": 20,
        "active": True,
        "expires_at": datetime(2025, 6, 1)
    },
    {
        "code": "SAVE10",
        "type": "fixed",
        "value": 10,
        "active": True,
        "expires_at": datetime(2025, 12, 31)
    }
]

# Initialize database
@app.on_event("startup")
async def startup_event():
    # Check if plants collection exists and initialize with sample data
    plants_count = await db.plants.count_documents({})
    if plants_count == 0:
        await db.plants.insert_many(SAMPLE_PLANTS)
        print("Sample plants added to database")
    
    # Check if discount codes exist and initialize
    discount_count = await db.discount_codes.count_documents({})
    if discount_count == 0:
        await db.discount_codes.insert_many(SAMPLE_DISCOUNT_CODES)
        print("Sample discount codes added to database")

# Utility functions
def create_access_token(data: dict):
    to_encode = data.copy()
    return jwt.encode(to_encode, SECRET_KEY, algorithm="HS256")

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=["HS256"])
        return payload
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

# API Routes

# Plants endpoints
@app.get("/api/plants")
async def get_plants(category: Optional[str] = None, search: Optional[str] = None):
    query = {}
    if category:
        query["category"] = category
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    
    plants_cursor = db.plants.find(query)
    plants = await plants_cursor.to_list(length=None)
    
    # Convert MongoDB documents to Pydantic models to handle ObjectId serialization
    serialized_plants = []
    for plant in plants:
        # Convert _id to string if it exists
        if "_id" in plant:
            plant["_id"] = str(plant["_id"])
        serialized_plants.append(plant)
    
    return serialized_plants

@app.get("/api/plants/{plant_id}")
async def get_plant(plant_id: str):
    plant = await db.plants.find_one({"id": plant_id})
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")
    
    # Convert _id to string if it exists
    if "_id" in plant:
        plant["_id"] = str(plant["_id"])
    
    return plant

@app.get("/api/categories")
async def get_categories():
    categories = await db.plants.distinct("category")
    return categories

# User authentication endpoints
@app.post("/api/register")
async def register(user_data: UserRegister):
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    user_id = str(uuid.uuid4())
    hashed_password = hash_password(user_data.password)
    
    user = {
        "id": user_id,
        "email": user_data.email,
        "password_hash": hashed_password,
        "first_name": user_data.first_name,
        "last_name": user_data.last_name,
        "created_at": datetime.utcnow()
    }
    
    await db.users.insert_one(user)
    
    # Create access token
    access_token = create_access_token({"user_id": user_id, "email": user_data.email})
    
    return {
        "access_token": access_token,
        "user": {
            "id": user_id,
            "email": user_data.email,
            "first_name": user_data.first_name,
            "last_name": user_data.last_name
        }
    }

@app.post("/api/login")
async def login(user_data: UserLogin):
    # Find user by email
    user = await db.users.find_one({"email": user_data.email})
    if not user or not verify_password(user_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Create access token
    access_token = create_access_token({"user_id": user["id"], "email": user["email"]})
    
    return {
        "access_token": access_token,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "first_name": user["first_name"],
            "last_name": user["last_name"]
        }
    }

# Cart and order endpoints
@app.post("/api/calculate-total")
async def calculate_total(order_data: OrderRequest):
    # Get plant details for cart items
    plant_ids = [item.plant_id for item in order_data.items]
    plants = await db.plants.find({"id": {"$in": plant_ids}}).to_list(length=None)
    
    # Calculate subtotal
    subtotal = 0
    for item in order_data.items:
        plant = next((p for p in plants if p["id"] == item.plant_id), None)
        if plant:
            subtotal += plant["price"] * item.quantity
    
    # Calculate tax (8% tax rate)
    tax_amount = subtotal * 0.08
    
    # Calculate shipping (free shipping over $50, otherwise $8.99)
    shipping_cost = 0 if subtotal > 50 else 8.99
    
    # Calculate discount
    discount_amount = 0
    if order_data.discount_code:
        discount = await db.discount_codes.find_one({
            "code": order_data.discount_code,
            "active": True
        })
        if discount:
            if discount["type"] == "percentage":
                discount_amount = subtotal * (discount["value"] / 100)
            elif discount["type"] == "fixed":
                discount_amount = min(discount["value"], subtotal)
    
    total = subtotal + tax_amount + shipping_cost - discount_amount
    
    return {
        "subtotal": round(subtotal, 2),
        "tax_amount": round(tax_amount, 2),
        "shipping_cost": round(shipping_cost, 2),
        "discount_amount": round(discount_amount, 2),
        "total": round(total, 2)
    }

@app.get("/api/validate-discount")
async def validate_discount(discount_code: str):
    discount = await db.discount_codes.find_one({
        "code": discount_code,
        "active": True
    })
    if not discount:
        raise HTTPException(status_code=404, detail="Invalid discount code")
    
    # Check if expired
    if discount["expires_at"] < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Discount code has expired")
    
    # Convert _id to string if it exists
    if "_id" in discount:
        discount["_id"] = str(discount["_id"])
    
    return {
        "valid": True,
        "type": discount["type"],
        "value": discount["value"],
        "description": f"{'Save ' + str(discount['value']) + '%' if discount['type'] == 'percentage' else 'Save $' + str(discount['value'])}"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)