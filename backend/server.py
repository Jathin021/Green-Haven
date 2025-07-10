from fastapi import FastAPI, HTTPException, Depends, Request, status
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
import paypalrestsdk
from paypalrestsdk import Payment, BillingPlan, BillingAgreement
import logging

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
    average_rating: float = 0.0
    total_reviews: int = 0

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
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    country: Optional[str] = "US"

class UserRegister(BaseModel):
    email: str
    password: str
    first_name: str
    last_name: str
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserProfile(BaseModel):
    first_name: str
    last_name: str
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    country: Optional[str] = "US"

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

class PayPalOrderItem(BaseModel):
    name: str
    quantity: int
    unit_amount: float
    sku: Optional[str] = None
    
class PayPalOrderRequest(BaseModel):
    items: List[PayPalOrderItem]
    total_amount: float
    currency: str = "USD"
    customer_email: Optional[str] = None
    shipping_info: Optional[ShippingInfo] = None
    discount_code: Optional[str] = None
    
class PayPalOrder(BaseModel):
    id: str
    order_id: str
    paypal_order_id: str
    customer_email: Optional[str]
    user_id: Optional[str]
    total_amount: float
    currency: str
    status: str
    items: List[PayPalOrderItem]
    shipping_info: Optional[ShippingInfo] = None
    created_at: datetime
    updated_at: datetime
    order_status: str = "pending"  # pending, processing, shipped, delivered, cancelled

class OrderStatusUpdate(BaseModel):
    order_id: str
    status: str  # pending, processing, shipped, delivered, cancelled
    tracking_number: Optional[str] = None
    notes: Optional[str] = None

class Review(BaseModel):
    id: str
    plant_id: str
    user_id: str
    user_name: str
    rating: int  # 1-5
    comment: str
    created_at: datetime
    helpful_count: int = 0

class ReviewCreate(BaseModel):
    plant_id: str
    rating: int
    comment: str

class WishlistItem(BaseModel):
    user_id: str
    plant_id: str
    created_at: datetime

# FastAPI app
app = FastAPI()

# Security
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.environ.get("SECRET_KEY", "your-secret-key-here-change-in-production")  # Set SECRET_KEY in production!

# CORS origins
ALLOWED_ORIGINS = os.environ.get("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_URL)
db = client["nursery_ecommerce"]

# PayPal configuration
paypalrestsdk.configure({
    "mode": os.environ.get("PAYPAL_MODE", "sandbox"),  # sandbox or live
    "client_id": os.environ.get("PAYPAL_CLIENT_ID"),
    "client_secret": os.environ.get("PAYPAL_SECRET")
})

# Logging
logging.basicConfig(level=logging.INFO)

# Sample plant data
SAMPLE_PLANTS = [
    {
        "id": "plant_001",
        "name": "Monstera Deliciosa",
        "price": 2.99,
        "description": "Beautiful tropical plant with large, glossy leaves and natural splits. Perfect for bright, indirect light.",
        "care_instructions": "Water when top inch of soil is dry. Provide bright, indirect light. Mist occasionally for humidity.",
        "sunlight_requirements": "Bright, indirect light",
        "category": "houseplant",
        "stock_quantity": 25,
        "image_url": "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHwxfHxwbGFudHN8ZW58MHx8fHwxNzUyMTcwMDcyfDA&ixlib=rb-4.1.0&q=85",
        "weight": 3.5,
        "average_rating": 4.5,
        "total_reviews": 12
    },
    {
        "id": "plant_002", 
        "name": "Snake Plant",
        "price": 1.99,
        "description": "Low-maintenance succulent with upright, sword-like leaves. Great for beginners and low-light conditions.",
        "care_instructions": "Water every 2-3 weeks. Tolerates low light but prefers bright, indirect light.",
        "sunlight_requirements": "Low to bright, indirect light",
        "category": "houseplant",
        "stock_quantity": 40,
        "image_url": "https://images.unsplash.com/photo-1470058869958-2a77ade41c02?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHwyfHxwbGFudHN8ZW58MHx8fHwxNzUyMTcwMDcyfDA&ixlib=rb-4.1.0&q=85",
        "weight": 2.0,
        "average_rating": 4.8,
        "total_reviews": 25
    },
    {
        "id": "plant_003",
        "name": "Fiddle Leaf Fig",
        "price": 2.49,
        "description": "Statement plant with large, violin-shaped leaves. A popular choice for modern interiors.",
        "care_instructions": "Water when top 2 inches of soil are dry. Needs bright, indirect light and consistent watering.",
        "sunlight_requirements": "Bright, indirect light",
        "category": "houseplant",
        "stock_quantity": 15,
        "image_url": "https://images.unsplash.com/photo-1601985705806-5b9a71f6004f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHwzfHxwbGFudHN8ZW58MHx8fHwxNzUyMTcwMDcyfDA&ixlib=rb-4.1.0&q=85",
        "weight": 4.0,
        "average_rating": 4.2,
        "total_reviews": 8
    },
    {
        "id": "plant_004",
        "name": "Pothos",
        "price": 2.29,
        "description": "Trailing vine with heart-shaped leaves. Perfect for hanging baskets or climbing up poles.",
        "care_instructions": "Water when soil surface is dry. Thrives in various light conditions.",
        "sunlight_requirements": "Low to bright, indirect light",
        "category": "houseplant",
        "stock_quantity": 35,
        "image_url": "https://images.pexels.com/photos/807598/pexels-photo-807598.jpeg",
        "weight": 1.5,
        "average_rating": 4.7,
        "total_reviews": 18
    },
    {
        "id": "plant_005",
        "name": "Succulent Collection",
        "price": 2.79,
        "description": "Beautiful collection of mixed succulents in decorative pots. Low maintenance and colorful.",
        "care_instructions": "Water sparingly, every 2-3 weeks. Provide bright light and good drainage.",
        "sunlight_requirements": "Bright, direct light",
        "category": "succulent",
        "stock_quantity": 20,
        "image_url": "https://images.pexels.com/photos/1470171/pexels-photo-1470171.jpeg",
        "weight": 2.5,
        "average_rating": 4.3,
        "total_reviews": 15
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
        "weight": 3.0,
        "average_rating": 4.6,
        "total_reviews": 22
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
        "weight": 4.5,
        "average_rating": 4.4,
        "total_reviews": 10
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
        "weight": 2.8,
        "average_rating": 4.9,
        "total_reviews": 31
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

# Sample reviews
SAMPLE_REVIEWS = [
    {
        "id": "review_001",
        "plant_id": "plant_001",
        "user_id": "user_001",
        "user_name": "John D.",
        "rating": 5,
        "comment": "Amazing plant! Very healthy and beautiful. Exactly as described.",
        "created_at": datetime(2024, 12, 1),
        "helpful_count": 5
    },
    {
        "id": "review_002",
        "plant_id": "plant_002",
        "user_id": "user_002",
        "user_name": "Sarah M.",
        "rating": 5,
        "comment": "Perfect for beginners! Very low maintenance and looks great.",
        "created_at": datetime(2024, 11, 15),
        "helpful_count": 8
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
    
    # Check if reviews exist and initialize
    reviews_count = await db.reviews.count_documents({})
    if reviews_count == 0:
        await db.reviews.insert_many(SAMPLE_REVIEWS)
        print("Sample reviews added to database")

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
async def get_plants(
    category: Optional[str] = None, 
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort_by: Optional[str] = None  # price_asc, price_desc, rating, name
):
    query = {}
    if category:
        query["category"] = category
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    if min_price is not None or max_price is not None:
        price_query = {}
        if min_price is not None:
            price_query["$gte"] = min_price
        if max_price is not None:
            price_query["$lte"] = max_price
        query["price"] = price_query
    
    # Sorting
    sort_options = {
        "price_asc": [("price", 1)],
        "price_desc": [("price", -1)],
        "rating": [("average_rating", -1)],
        "name": [("name", 1)],
        "newest": [("created_at", -1)]
    }
    sort_criteria = sort_options.get(sort_by, [("name", 1)])
    
    plants_cursor = db.plants.find(query).sort(sort_criteria)
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
        "phone": user_data.phone,
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
            "last_name": user_data.last_name,
            "phone": user_data.phone
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
            "last_name": user["last_name"],
            "phone": user.get("phone"),
            "address": user.get("address"),
            "city": user.get("city"),
            "state": user.get("state"),
            "zip_code": user.get("zip_code"),
            "country": user.get("country", "US")
        }
    }

# User profile endpoints
@app.get("/api/profile")
async def get_profile(current_user: dict = Depends(verify_token)):
    user = await db.users.find_one({"id": current_user["user_id"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "id": user["id"],
        "email": user["email"],
        "first_name": user["first_name"],
        "last_name": user["last_name"],
        "phone": user.get("phone"),
        "address": user.get("address"),
        "city": user.get("city"),
        "state": user.get("state"),
        "zip_code": user.get("zip_code"),
        "country": user.get("country", "US"),
        "created_at": user["created_at"]
    }

@app.put("/api/profile")
async def update_profile(profile_data: UserProfile, current_user: dict = Depends(verify_token)):
    await db.users.update_one(
        {"id": current_user["user_id"]},
        {"$set": profile_data.dict()}
    )
    return {"message": "Profile updated successfully"}

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

# PayPal Payment endpoints
@app.post("/api/paypal/create-order")
async def create_paypal_order(order_request: PayPalOrderRequest):
    try:
        # Generate unique order ID
        order_id = str(uuid.uuid4())
        
        # Create PayPal payment
        payment = Payment({
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": "http://localhost:3000/payment/success",
                "cancel_url": "http://localhost:3000/payment/cancel"
            },
            "transactions": [{
                "item_list": {
                    "items": [{
                        "name": item.name,
                        "sku": item.sku or f"item-{uuid.uuid4()}",
                        "price": f"{item.unit_amount:.2f}",
                        "currency": order_request.currency,
                        "quantity": item.quantity
                    } for item in order_request.items]
                },
                "amount": {
                    "total": f"{order_request.total_amount:.2f}",
                    "currency": order_request.currency
                },
                "description": f"Order {order_id} - Green Haven Nursery"
            }]
        })
        
        if payment.create():
            # Store order in database
            paypal_order = {
                "id": order_id,
                "order_id": order_id,
                "paypal_order_id": payment.id,
                "customer_email": order_request.customer_email,
                "user_id": order_request.customer_email,  # Will be improved with proper user ID
                "total_amount": order_request.total_amount,
                "currency": order_request.currency,
                "status": "CREATED",
                "order_status": "pending",
                "items": [item.dict() for item in order_request.items],
                "shipping_info": order_request.shipping_info.dict() if order_request.shipping_info else None,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            await db.orders.insert_one(paypal_order)
            
            # Get approval URL
            approval_url = None
            for link in payment.links:
                if link.rel == "approval_url":
                    approval_url = link.href
                    break
            
            return {
                "id": payment.id,
                "order_id": order_id,
                "status": "CREATED",
                "approval_url": approval_url,
                "links": [{"href": link.href, "rel": link.rel, "method": link.method} for link in payment.links]
            }
        else:
            raise HTTPException(status_code=400, detail=f"PayPal payment creation failed: {payment.error}")
            
    except Exception as e:
        logging.error(f"Error creating PayPal order: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating PayPal order: {str(e)}")

@app.post("/api/paypal/execute-payment")
async def execute_paypal_payment(payment_id: str, payer_id: str):
    try:
        # Get the payment
        payment = Payment.find(payment_id)
        
        if payment.execute({"payer_id": payer_id}):
            # Update order status in database
            await db.orders.update_one(
                {"paypal_order_id": payment_id},
                {
                    "$set": {
                        "status": "COMPLETED",
                        "order_status": "processing",
                        "updated_at": datetime.utcnow(),
                        "payer_id": payer_id,
                        "payment_details": payment.to_dict()
                    }
                }
            )
            
            # Get order details for processing
            order = await db.orders.find_one({"paypal_order_id": payment_id})
            if order:
                # Process order completion - update inventory
                await process_order_completion(order)
            
            return {
                "id": payment.id,
                "status": "COMPLETED",
                "order_id": order["order_id"] if order else None,
                "total_amount": payment.transactions[0].amount.total
            }
        else:
            raise HTTPException(status_code=400, detail=f"PayPal payment execution failed: {payment.error}")
            
    except Exception as e:
        logging.error(f"Error executing PayPal payment: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error executing PayPal payment: {str(e)}")

@app.get("/api/paypal/payment/{payment_id}")
async def get_paypal_payment(payment_id: str):
    try:
        payment = Payment.find(payment_id)
        return payment.to_dict()
    except Exception as e:
        logging.error(f"Error getting PayPal payment: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting PayPal payment: {str(e)}")

# Order Management endpoints
@app.get("/api/orders")
async def get_orders(current_user: dict = Depends(verify_token)):
    try:
        # Get orders for current user
        orders_cursor = db.orders.find({"user_id": current_user["user_id"]})
        orders = await orders_cursor.to_list(length=None)
        
        # Convert MongoDB documents to serializable format
        serialized_orders = []
        for order in orders:
            if "_id" in order:
                order["_id"] = str(order["_id"])
            serialized_orders.append(order)
        
        return serialized_orders
    except Exception as e:
        logging.error(f"Error getting orders: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting orders: {str(e)}")

@app.get("/api/orders/{order_id}")
async def get_order(order_id: str, current_user: dict = Depends(verify_token)):
    try:
        order = await db.orders.find_one({
            "order_id": order_id,
            "user_id": current_user["user_id"]
        })
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        # Convert _id to string if it exists
        if "_id" in order:
            order["_id"] = str(order["_id"])
        
        return order
    except Exception as e:
        logging.error(f"Error getting order: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting order: {str(e)}")

@app.put("/api/orders/{order_id}/status")
async def update_order_status(order_id: str, status_update: OrderStatusUpdate, current_user: dict = Depends(verify_token)):
    try:
        # Only allow certain status updates for regular users
        allowed_statuses = ["cancelled"]
        if status_update.status not in allowed_statuses:
            raise HTTPException(status_code=403, detail="Not authorized to update to this status")
        
        order = await db.orders.find_one({
            "order_id": order_id,
            "user_id": current_user["user_id"]
        })
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        # Only allow cancellation if order is still pending or processing
        if status_update.status == "cancelled" and order["order_status"] not in ["pending", "processing"]:
            raise HTTPException(status_code=400, detail="Order cannot be cancelled at this stage")
        
        await db.orders.update_one(
            {"order_id": order_id},
            {
                "$set": {
                    "order_status": status_update.status,
                    "updated_at": datetime.utcnow(),
                    "status_notes": status_update.notes
                }
            }
        )
        
        return {"message": "Order status updated successfully"}
    except Exception as e:
        logging.error(f"Error updating order status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error updating order status: {str(e)}")

# Review endpoints
@app.get("/api/plants/{plant_id}/reviews")
async def get_plant_reviews(plant_id: str, limit: int = 10, offset: int = 0):
    try:
        reviews_cursor = db.reviews.find({"plant_id": plant_id}).skip(offset).limit(limit).sort("created_at", -1)
        reviews = await reviews_cursor.to_list(length=None)
        
        serialized_reviews = []
        for review in reviews:
            if "_id" in review:
                review["_id"] = str(review["_id"])
            serialized_reviews.append(review)
        
        return serialized_reviews
    except Exception as e:
        logging.error(f"Error getting reviews: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting reviews: {str(e)}")

@app.post("/api/plants/{plant_id}/reviews")
async def create_review(plant_id: str, review_data: ReviewCreate, current_user: dict = Depends(verify_token)):
    try:
        # Check if user has already reviewed this plant
        existing_review = await db.reviews.find_one({
            "plant_id": plant_id,
            "user_id": current_user["user_id"]
        })
        if existing_review:
            raise HTTPException(status_code=400, detail="You have already reviewed this plant")
        
        # Get user info
        user = await db.users.find_one({"id": current_user["user_id"]})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Create review
        review_id = str(uuid.uuid4())
        review = {
            "id": review_id,
            "plant_id": plant_id,
            "user_id": current_user["user_id"],
            "user_name": f"{user['first_name']} {user['last_name'][0]}.",
            "rating": review_data.rating,
            "comment": review_data.comment,
            "created_at": datetime.utcnow(),
            "helpful_count": 0
        }
        
        await db.reviews.insert_one(review)
        
        # Update plant's average rating
        await update_plant_rating(plant_id)
        
        return {"message": "Review created successfully", "review_id": review_id}
    except Exception as e:
        logging.error(f"Error creating review: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating review: {str(e)}")

async def update_plant_rating(plant_id: str):
    """Update plant's average rating and review count"""
    try:
        # Get all reviews for this plant
        reviews = await db.reviews.find({"plant_id": plant_id}).to_list(length=None)
        
        if reviews:
            total_rating = sum(review["rating"] for review in reviews)
            average_rating = total_rating / len(reviews)
            
            await db.plants.update_one(
                {"id": plant_id},
                {
                    "$set": {
                        "average_rating": round(average_rating, 1),
                        "total_reviews": len(reviews)
                    }
                }
            )
    except Exception as e:
        logging.error(f"Error updating plant rating: {str(e)}")

# Wishlist endpoints
@app.get("/api/wishlist")
async def get_wishlist(current_user: dict = Depends(verify_token)):
    try:
        wishlist_cursor = db.wishlist.find({"user_id": current_user["user_id"]})
        wishlist_items = await wishlist_cursor.to_list(length=None)
        
        # Get plant details for wishlist items
        plant_ids = [item["plant_id"] for item in wishlist_items]
        plants = await db.plants.find({"id": {"$in": plant_ids}}).to_list(length=None)
        
        # Convert to serializable format
        serialized_plants = []
        for plant in plants:
            if "_id" in plant:
                plant["_id"] = str(plant["_id"])
            serialized_plants.append(plant)
        
        return serialized_plants
    except Exception as e:
        logging.error(f"Error getting wishlist: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting wishlist: {str(e)}")

@app.post("/api/wishlist/{plant_id}")
async def add_to_wishlist(plant_id: str, current_user: dict = Depends(verify_token)):
    try:
        # Check if already in wishlist
        existing_item = await db.wishlist.find_one({
            "user_id": current_user["user_id"],
            "plant_id": plant_id
        })
        if existing_item:
            raise HTTPException(status_code=400, detail="Plant already in wishlist")
        
        # Add to wishlist
        wishlist_item = {
            "user_id": current_user["user_id"],
            "plant_id": plant_id,
            "created_at": datetime.utcnow()
        }
        
        await db.wishlist.insert_one(wishlist_item)
        return {"message": "Plant added to wishlist"}
    except Exception as e:
        logging.error(f"Error adding to wishlist: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error adding to wishlist: {str(e)}")

@app.delete("/api/wishlist/{plant_id}")
async def remove_from_wishlist(plant_id: str, current_user: dict = Depends(verify_token)):
    try:
        result = await db.wishlist.delete_one({
            "user_id": current_user["user_id"],
            "plant_id": plant_id
        })
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Plant not found in wishlist")
        
        return {"message": "Plant removed from wishlist"}
    except Exception as e:
        logging.error(f"Error removing from wishlist: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error removing from wishlist: {str(e)}")

async def process_order_completion(order):
    """Process order completion - update inventory, send notifications, etc."""
    try:
        # Update plant inventory
        for item in order["items"]:
            plant_id = item.get("sku", "").replace("plant_", "")
            if plant_id:
                await db.plants.update_one(
                    {"id": plant_id},
                    {"$inc": {"stock_quantity": -item["quantity"]}}
                )
        
        # Here you could add:
        # - Send confirmation email
        # - Generate invoice
        # - Update order status to processing
        # - Send notifications
        
        logging.info(f"Order {order['order_id']} processed successfully")
        
    except Exception as e:
        logging.error(f"Error processing order completion: {str(e)}")
        # Don't raise exception here to avoid breaking the payment flow

@app.post("/api/admin/reset-plants")
async def reset_plants(request: Request):
    # Simple admin protection (use a header 'x-admin-token')
    admin_token = os.environ.get("ADMIN_RESET_TOKEN", "changeme")
    req_token = request.headers.get("x-admin-token")
    if req_token != admin_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    await db.plants.delete_many({})
    await db.plants.insert_many(SAMPLE_PLANTS)
    return {"message": "Plants collection reset and re-initialized with sample data."}

@app.get("/")
def root():
    return {"message": "Green Haven Nursery API is running!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)