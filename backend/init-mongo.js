// MongoDB initialization script
// This script runs when the MongoDB container starts for the first time

db = db.getSiblingDB('nursery_ecommerce');

// Create collections with proper indexes
db.createCollection('plants');
db.createCollection('users');
db.createCollection('orders');
db.createCollection('reviews');
db.createCollection('wishlist');
db.createCollection('discount_codes');

// Create indexes for better performance
db.plants.createIndex({ "category": 1 });
db.plants.createIndex({ "price": 1 });
db.plants.createIndex({ "average_rating": -1 });
db.plants.createIndex({ "name": "text", "description": "text" });

db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "created_at": -1 });

db.orders.createIndex({ "user_id": 1 });
db.orders.createIndex({ "order_id": 1 }, { unique: true });
db.orders.createIndex({ "created_at": -1 });
db.orders.createIndex({ "order_status": 1 });

db.reviews.createIndex({ "plant_id": 1 });
db.reviews.createIndex({ "user_id": 1 });
db.reviews.createIndex({ "created_at": -1 });

db.wishlist.createIndex({ "user_id": 1, "plant_id": 1 }, { unique: true });

db.discount_codes.createIndex({ "code": 1 }, { unique: true });
db.discount_codes.createIndex({ "active": 1, "expires_at": 1 });

print('MongoDB initialization completed successfully!'); 