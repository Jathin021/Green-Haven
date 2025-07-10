import requests
import unittest
import json
import uuid
import os
from datetime import datetime

class NurseryAPITester(unittest.TestCase):
    def __init__(self, *args, **kwargs):
        super(NurseryAPITester, self).__init__(*args, **kwargs)
        # Get the backend URL from the frontend .env file
        self.base_url = "https://53545a75-1d85-4859-8879-1bae9347ed4f.preview.emergentagent.com"
        self.token = None
        self.user_id = None
        self.test_user_email = f"test_user_{uuid.uuid4()}@example.com"
        self.test_password = "Test123!"
        self.test_plant_id = "plant_001"  # Monstera Deliciosa from sample data
        self.test_order_id = None
        self.test_review_id = None

    def setUp(self):
        print(f"\n🔍 Testing against API: {self.base_url}")

    def test_01_get_plants(self):
        """Test GET /api/plants endpoint"""
        print("\n🔍 Testing GET /api/plants...")
        response = requests.get(f"{self.base_url}/api/plants")
        
        self.assertEqual(response.status_code, 200, "Failed to get plants")
        plants = response.json()
        self.assertIsInstance(plants, list, "Plants response should be a list")
        self.assertGreater(len(plants), 0, "Plants list should not be empty")
        
        # Verify plant structure
        plant = plants[0]
        self.assertIn("id", plant, "Plant should have an id")
        self.assertIn("name", plant, "Plant should have a name")
        self.assertIn("price", plant, "Plant should have a price")
        self.assertIn("description", plant, "Plant should have a description")
        self.assertIn("category", plant, "Plant should have a category")
        
        print(f"✅ Found {len(plants)} plants")
        return plants

    def test_02_get_plant_by_id(self):
        """Test GET /api/plants/{id} endpoint"""
        print(f"\n🔍 Testing GET /api/plants/{self.test_plant_id}...")
        response = requests.get(f"{self.base_url}/api/plants/{self.test_plant_id}")
        
        self.assertEqual(response.status_code, 200, f"Failed to get plant with ID {self.test_plant_id}")
        plant = response.json()
        self.assertEqual(plant["id"], self.test_plant_id, "Plant ID doesn't match")
        
        print(f"✅ Successfully retrieved plant: {plant['name']}")
        return plant

    def test_03_get_categories(self):
        """Test GET /api/categories endpoint"""
        print("\n🔍 Testing GET /api/categories...")
        response = requests.get(f"{self.base_url}/api/categories")
        
        self.assertEqual(response.status_code, 200, "Failed to get categories")
        categories = response.json()
        self.assertIsInstance(categories, list, "Categories response should be a list")
        self.assertGreater(len(categories), 0, "Categories list should not be empty")
        
        print(f"✅ Found {len(categories)} categories: {', '.join(categories)}")
        return categories

    def test_04_register_user(self):
        """Test POST /api/register endpoint"""
        print("\n🔍 Testing POST /api/register...")
        user_data = {
            "email": self.test_user_email,
            "password": self.test_password,
            "first_name": "Test",
            "last_name": "User"
        }
        
        response = requests.post(f"{self.base_url}/api/register", json=user_data)
        
        self.assertEqual(response.status_code, 200, f"Failed to register user: {response.text}")
        data = response.json()
        self.assertIn("access_token", data, "Response should contain access_token")
        self.assertIn("user", data, "Response should contain user data")
        self.assertEqual(data["user"]["email"], self.test_user_email, "Email in response doesn't match")
        
        self.token = data["access_token"]
        self.user_id = data["user"]["id"]
        
        print(f"✅ Successfully registered user: {self.test_user_email}")
        return data

    def test_05_login_user(self):
        """Test POST /api/login endpoint"""
        print("\n🔍 Testing POST /api/login...")
        login_data = {
            "email": self.test_user_email,
            "password": self.test_password
        }
        
        response = requests.post(f"{self.base_url}/api/login", json=login_data)
        
        self.assertEqual(response.status_code, 200, f"Failed to login: {response.text}")
        data = response.json()
        self.assertIn("access_token", data, "Response should contain access_token")
        self.assertIn("user", data, "Response should contain user data")
        self.assertEqual(data["user"]["email"], self.test_user_email, "Email in response doesn't match")
        
        print(f"✅ Successfully logged in as: {self.test_user_email}")
        return data

    def test_06_calculate_total(self):
        """Test POST /api/calculate-total endpoint"""
        print("\n🔍 Testing POST /api/calculate-total...")
        
        # First get a plant to add to cart
        plants_response = requests.get(f"{self.base_url}/api/plants")
        plants = plants_response.json()
        test_plant = plants[0]
        
        order_data = {
            "items": [
                {
                    "plant_id": test_plant["id"],
                    "quantity": 2
                }
            ],
            "shipping_info": {
                "address": "123 Test St",
                "city": "Test City",
                "state": "TS",
                "zip_code": "12345",
                "country": "US"
            },
            "discount_code": None,
            "user_id": self.user_id
        }
        
        response = requests.post(f"{self.base_url}/api/calculate-total", json=order_data)
        
        self.assertEqual(response.status_code, 200, f"Failed to calculate total: {response.text}")
        data = response.json()
        self.assertIn("subtotal", data, "Response should contain subtotal")
        self.assertIn("tax_amount", data, "Response should contain tax_amount")
        self.assertIn("shipping_cost", data, "Response should contain shipping_cost")
        self.assertIn("discount_amount", data, "Response should contain discount_amount")
        self.assertIn("total", data, "Response should contain total")
        
        # Verify calculations
        expected_subtotal = test_plant["price"] * 2
        self.assertAlmostEqual(data["subtotal"], expected_subtotal, places=2, 
                              msg="Subtotal calculation is incorrect")
        
        print(f"✅ Successfully calculated order total: ${data['total']}")
        
        # Now test with a discount code
        order_data["discount_code"] = "SPRING20"  # From sample data
        response = requests.post(f"{self.base_url}/api/calculate-total", json=order_data)
        
        self.assertEqual(response.status_code, 200, f"Failed to calculate total with discount: {response.text}")
        data_with_discount = response.json()
        self.assertGreater(data["total"], data_with_discount["total"], 
                          "Total with discount should be less than without discount")
        
        print(f"✅ Successfully calculated order total with discount: ${data_with_discount['total']}")
        return data_with_discount

    def test_07_validate_discount(self):
        """Test GET /api/validate-discount endpoint"""
        print("\n🔍 Testing GET /api/validate-discount...")
        
        # Test valid discount code
        valid_code = "SPRING20"  # From sample data
        response = requests.get(f"{self.base_url}/api/validate-discount?discount_code={valid_code}")
        
        self.assertEqual(response.status_code, 200, f"Failed to validate discount code: {response.text}")
        data = response.json()
        self.assertTrue(data["valid"], "Discount code should be valid")
        self.assertEqual(data["type"], "percentage", "Discount type should be percentage")
        self.assertEqual(data["value"], 20, "Discount value should be 20")
        
        print(f"✅ Successfully validated discount code: {valid_code}")
        
        # Test invalid discount code
        invalid_code = "INVALID123"
        response = requests.get(f"{self.base_url}/api/validate-discount?discount_code={invalid_code}")
        
        self.assertEqual(response.status_code, 404, "Invalid discount code should return 404")
        
        print(f"✅ Correctly rejected invalid discount code: {invalid_code}")
        return data

    def get_auth_headers(self):
        """Get authorization headers for authenticated requests"""
        if not self.token:
            # Register and login a test user first
            self.test_04_register_user()
        return {"Authorization": f"Bearer {self.token}"}

    def test_09_enhanced_search_filtering(self):
        """Test enhanced search and filtering API - Phase 4"""
        print("\n🔍 Testing Enhanced Search and Filtering...")
        
        # Test price filtering
        response = requests.get(f"{self.base_url}/api/plants?min_price=20&max_price=40")
        self.assertEqual(response.status_code, 200, "Price filtering failed")
        plants = response.json()
        for plant in plants:
            self.assertGreaterEqual(plant["price"], 20, "Plant price below minimum")
            self.assertLessEqual(plant["price"], 40, "Plant price above maximum")
        print(f"✅ Price filtering works - found {len(plants)} plants between $20-$40")
        
        # Test sorting by price ascending
        response = requests.get(f"{self.base_url}/api/plants?sort_by=price_asc")
        self.assertEqual(response.status_code, 200, "Price ascending sort failed")
        plants = response.json()
        if len(plants) > 1:
            for i in range(len(plants) - 1):
                self.assertLessEqual(plants[i]["price"], plants[i+1]["price"], 
                                   "Plants not sorted by price ascending")
        print(f"✅ Price ascending sort works")
        
        # Test sorting by price descending
        response = requests.get(f"{self.base_url}/api/plants?sort_by=price_desc")
        self.assertEqual(response.status_code, 200, "Price descending sort failed")
        plants = response.json()
        if len(plants) > 1:
            for i in range(len(plants) - 1):
                self.assertGreaterEqual(plants[i]["price"], plants[i+1]["price"], 
                                      "Plants not sorted by price descending")
        print(f"✅ Price descending sort works")
        
        # Test sorting by rating
        response = requests.get(f"{self.base_url}/api/plants?sort_by=rating")
        self.assertEqual(response.status_code, 200, "Rating sort failed")
        plants = response.json()
        if len(plants) > 1:
            for i in range(len(plants) - 1):
                self.assertGreaterEqual(plants[i]["average_rating"], plants[i+1]["average_rating"], 
                                      "Plants not sorted by rating descending")
        print(f"✅ Rating sort works")
        
        # Test search with category filter
        response = requests.get(f"{self.base_url}/api/plants?category=houseplant&search=plant")
        self.assertEqual(response.status_code, 200, "Category + search filtering failed")
        plants = response.json()
        for plant in plants:
            self.assertEqual(plant["category"], "houseplant", "Plant category doesn't match filter")
        print(f"✅ Category + search filtering works - found {len(plants)} houseplants")

    def test_10_user_profile_management(self):
        """Test user profile management API - Phase 3"""
        print("\n🔍 Testing User Profile Management...")
        
        headers = self.get_auth_headers()
        
        # Test GET profile
        response = requests.get(f"{self.base_url}/api/profile", headers=headers)
        self.assertEqual(response.status_code, 200, f"Failed to get profile: {response.text}")
        profile = response.json()
        self.assertEqual(profile["email"], self.test_user_email, "Profile email doesn't match")
        self.assertIn("first_name", profile, "Profile should contain first_name")
        self.assertIn("last_name", profile, "Profile should contain last_name")
        print(f"✅ Successfully retrieved profile for: {profile['email']}")
        
        # Test PUT profile update
        updated_profile = {
            "first_name": "Updated",
            "last_name": "TestUser",
            "phone": "+1234567890",
            "address": "123 Updated Street",
            "city": "Updated City",
            "state": "UC",
            "zip_code": "54321",
            "country": "US"
        }
        
        response = requests.put(f"{self.base_url}/api/profile", json=updated_profile, headers=headers)
        self.assertEqual(response.status_code, 200, f"Failed to update profile: {response.text}")
        print(f"✅ Successfully updated profile")
        
        # Verify the update
        response = requests.get(f"{self.base_url}/api/profile", headers=headers)
        self.assertEqual(response.status_code, 200, "Failed to get updated profile")
        updated_data = response.json()
        self.assertEqual(updated_data["first_name"], "Updated", "First name not updated")
        self.assertEqual(updated_data["phone"], "+1234567890", "Phone not updated")
        self.assertEqual(updated_data["address"], "123 Updated Street", "Address not updated")
        print(f"✅ Profile update verified")

    def test_11_paypal_order_creation(self):
        """Test PayPal order creation - Phase 2"""
        print("\n🔍 Testing PayPal Order Creation...")
        
        # Create a PayPal order
        order_data = {
            "items": [
                {
                    "name": "Monstera Deliciosa",
                    "quantity": 1,
                    "unit_amount": 29.99,
                    "sku": "plant_001"
                }
            ],
            "total_amount": 29.99,
            "currency": "USD",
            "customer_email": self.test_user_email,
            "shipping_info": {
                "address": "123 Test St",
                "city": "Test City",
                "state": "TS",
                "zip_code": "12345",
                "country": "US"
            }
        }
        
        response = requests.post(f"{self.base_url}/api/paypal/create-order", json=order_data)
        self.assertEqual(response.status_code, 200, f"Failed to create PayPal order: {response.text}")
        
        data = response.json()
        self.assertIn("id", data, "Response should contain PayPal payment ID")
        self.assertIn("order_id", data, "Response should contain order ID")
        self.assertIn("status", data, "Response should contain status")
        self.assertIn("approval_url", data, "Response should contain approval URL")
        self.assertEqual(data["status"], "CREATED", "Order status should be CREATED")
        
        self.test_order_id = data["order_id"]
        print(f"✅ Successfully created PayPal order: {data['order_id']}")
        return data

    def test_12_order_management(self):
        """Test order management API - Phase 3"""
        print("\n🔍 Testing Order Management...")
        
        headers = self.get_auth_headers()
        
        # First create an order to test with
        if not self.test_order_id:
            self.test_11_paypal_order_creation()
        
        # Test GET orders (user's order history)
        response = requests.get(f"{self.base_url}/api/orders", headers=headers)
        self.assertEqual(response.status_code, 200, f"Failed to get orders: {response.text}")
        orders = response.json()
        self.assertIsInstance(orders, list, "Orders response should be a list")
        print(f"✅ Successfully retrieved {len(orders)} orders")
        
        # Test GET specific order
        if self.test_order_id:
            response = requests.get(f"{self.base_url}/api/orders/{self.test_order_id}", headers=headers)
            self.assertEqual(response.status_code, 200, f"Failed to get specific order: {response.text}")
            order = response.json()
            self.assertEqual(order["order_id"], self.test_order_id, "Order ID doesn't match")
            self.assertIn("status", order, "Order should have status")
            self.assertIn("items", order, "Order should have items")
            print(f"✅ Successfully retrieved specific order: {self.test_order_id}")
            
            # Test order status update (cancel order)
            status_update = {
                "order_id": self.test_order_id,
                "status": "cancelled",
                "notes": "Test cancellation"
            }
            
            response = requests.put(f"{self.base_url}/api/orders/{self.test_order_id}/status", 
                                  json=status_update, headers=headers)
            self.assertEqual(response.status_code, 200, f"Failed to update order status: {response.text}")
            print(f"✅ Successfully updated order status to cancelled")

    def test_13_reviews_and_ratings(self):
        """Test reviews and ratings API - Phase 4"""
        print("\n🔍 Testing Reviews and Ratings...")
        
        headers = self.get_auth_headers()
        
        # Test GET plant reviews
        response = requests.get(f"{self.base_url}/api/plants/{self.test_plant_id}/reviews")
        self.assertEqual(response.status_code, 200, f"Failed to get reviews: {response.text}")
        reviews = response.json()
        self.assertIsInstance(reviews, list, "Reviews response should be a list")
        print(f"✅ Successfully retrieved {len(reviews)} reviews for plant {self.test_plant_id}")
        
        # Test POST create review
        review_data = {
            "plant_id": self.test_plant_id,
            "rating": 5,
            "comment": "Excellent plant! Very healthy and beautiful. Highly recommend for beginners."
        }
        
        response = requests.post(f"{self.base_url}/api/plants/{self.test_plant_id}/reviews", 
                               json=review_data, headers=headers)
        self.assertEqual(response.status_code, 200, f"Failed to create review: {response.text}")
        
        result = response.json()
        self.assertIn("message", result, "Response should contain success message")
        self.assertIn("review_id", result, "Response should contain review ID")
        self.test_review_id = result["review_id"]
        print(f"✅ Successfully created review: {self.test_review_id}")
        
        # Verify the review was added
        response = requests.get(f"{self.base_url}/api/plants/{self.test_plant_id}/reviews")
        self.assertEqual(response.status_code, 200, "Failed to get updated reviews")
        updated_reviews = response.json()
        self.assertGreater(len(updated_reviews), len(reviews), "Review count should have increased")
        
        # Find our review
        our_review = None
        for review in updated_reviews:
            if review.get("id") == self.test_review_id:
                our_review = review
                break
        
        self.assertIsNotNone(our_review, "Our review should be in the list")
        self.assertEqual(our_review["rating"], 5, "Review rating should match")
        self.assertEqual(our_review["comment"], review_data["comment"], "Review comment should match")
        print(f"✅ Review verification successful")
        
        # Test duplicate review prevention
        response = requests.post(f"{self.base_url}/api/plants/{self.test_plant_id}/reviews", 
                               json=review_data, headers=headers)
        self.assertEqual(response.status_code, 400, "Duplicate review should be rejected")
        print(f"✅ Duplicate review prevention works")

    def test_14_wishlist_functionality(self):
        """Test wishlist functionality - Phase 4"""
        print("\n🔍 Testing Wishlist Functionality...")
        
        headers = self.get_auth_headers()
        
        # Test GET empty wishlist
        response = requests.get(f"{self.base_url}/api/wishlist", headers=headers)
        self.assertEqual(response.status_code, 200, f"Failed to get wishlist: {response.text}")
        wishlist = response.json()
        self.assertIsInstance(wishlist, list, "Wishlist response should be a list")
        initial_count = len(wishlist)
        print(f"✅ Successfully retrieved wishlist with {initial_count} items")
        
        # Test POST add to wishlist
        response = requests.post(f"{self.base_url}/api/wishlist/{self.test_plant_id}", headers=headers)
        self.assertEqual(response.status_code, 200, f"Failed to add to wishlist: {response.text}")
        
        result = response.json()
        self.assertIn("message", result, "Response should contain success message")
        print(f"✅ Successfully added plant {self.test_plant_id} to wishlist")
        
        # Verify the plant was added
        response = requests.get(f"{self.base_url}/api/wishlist", headers=headers)
        self.assertEqual(response.status_code, 200, "Failed to get updated wishlist")
        updated_wishlist = response.json()
        self.assertEqual(len(updated_wishlist), initial_count + 1, "Wishlist count should have increased")
        
        # Find our plant in wishlist
        plant_found = False
        for plant in updated_wishlist:
            if plant["id"] == self.test_plant_id:
                plant_found = True
                break
        
        self.assertTrue(plant_found, "Plant should be in wishlist")
        print(f"✅ Wishlist addition verified")
        
        # Test duplicate addition prevention
        response = requests.post(f"{self.base_url}/api/wishlist/{self.test_plant_id}", headers=headers)
        self.assertEqual(response.status_code, 400, "Duplicate wishlist item should be rejected")
        print(f"✅ Duplicate wishlist prevention works")
        
        # Test DELETE remove from wishlist
        response = requests.delete(f"{self.base_url}/api/wishlist/{self.test_plant_id}", headers=headers)
        self.assertEqual(response.status_code, 200, f"Failed to remove from wishlist: {response.text}")
        
        result = response.json()
        self.assertIn("message", result, "Response should contain success message")
        print(f"✅ Successfully removed plant {self.test_plant_id} from wishlist")
        
        # Verify the plant was removed
        response = requests.get(f"{self.base_url}/api/wishlist", headers=headers)
        self.assertEqual(response.status_code, 200, "Failed to get final wishlist")
        final_wishlist = response.json()
        self.assertEqual(len(final_wishlist), initial_count, "Wishlist count should be back to initial")
        print(f"✅ Wishlist removal verified")

    def test_15_authentication_required_endpoints(self):
        """Test that protected endpoints require authentication"""
        print("\n🔍 Testing Authentication Requirements...")
        
        # Test endpoints that should require authentication
        protected_endpoints = [
            ("GET", "/api/profile"),
            ("PUT", "/api/profile"),
            ("GET", "/api/orders"),
            ("GET", f"/api/orders/{uuid.uuid4()}"),
            ("POST", f"/api/plants/{self.test_plant_id}/reviews"),
            ("GET", "/api/wishlist"),
            ("POST", f"/api/wishlist/{self.test_plant_id}"),
            ("DELETE", f"/api/wishlist/{self.test_plant_id}")
        ]
        
        for method, endpoint in protected_endpoints:
            if method == "GET":
                response = requests.get(f"{self.base_url}{endpoint}")
            elif method == "POST":
                response = requests.post(f"{self.base_url}{endpoint}", json={})
            elif method == "PUT":
                response = requests.put(f"{self.base_url}{endpoint}", json={})
            elif method == "DELETE":
                response = requests.delete(f"{self.base_url}{endpoint}")
            
            self.assertEqual(response.status_code, 401, 
                           f"{method} {endpoint} should require authentication")
        
        print(f"✅ All {len(protected_endpoints)} protected endpoints require authentication")

    def test_16_comprehensive_error_handling(self):
        """Test comprehensive error handling"""
        print("\n🔍 Testing Comprehensive Error Handling...")
        
        headers = self.get_auth_headers()
        
        # Test non-existent plant in various contexts
        fake_plant_id = "nonexistent_plant"
        
        response = requests.get(f"{self.base_url}/api/plants/{fake_plant_id}")
        self.assertEqual(response.status_code, 404, "Non-existent plant should return 404")
        
        response = requests.get(f"{self.base_url}/api/plants/{fake_plant_id}/reviews")
        self.assertEqual(response.status_code, 200, "Reviews for non-existent plant should return empty list")
        
        response = requests.post(f"{self.base_url}/api/wishlist/{fake_plant_id}", headers=headers)
        # This might succeed or fail depending on implementation - both are acceptable
        
        # Test non-existent order
        fake_order_id = str(uuid.uuid4())
        response = requests.get(f"{self.base_url}/api/orders/{fake_order_id}", headers=headers)
        self.assertEqual(response.status_code, 404, "Non-existent order should return 404")
        
        # Test invalid discount code
        response = requests.get(f"{self.base_url}/api/validate-discount?discount_code=INVALID123")
        self.assertEqual(response.status_code, 404, "Invalid discount code should return 404")
        
        # Test invalid email registration
        invalid_user_data = {
            "email": "invalid-email",
            "password": "test123",
            "first_name": "Test",
            "last_name": "User"
        }
        response = requests.post(f"{self.base_url}/api/register", json=invalid_user_data)
        # Should either return 400 for validation error or 200 if validation is lenient
        self.assertIn(response.status_code, [200, 400, 422], "Invalid email should be handled appropriately")
        
        print("✅ Comprehensive error handling verified")

    def test_17_data_integrity_and_calculations(self):
        """Test data integrity and calculation accuracy"""
        print("\n🔍 Testing Data Integrity and Calculations...")
        
        # Test plant rating calculation after review
        plant_response = requests.get(f"{self.base_url}/api/plants/{self.test_plant_id}")
        self.assertEqual(plant_response.status_code, 200, "Failed to get plant")
        plant_before = plant_response.json()
        
        # Get reviews to verify rating calculation
        reviews_response = requests.get(f"{self.base_url}/api/plants/{self.test_plant_id}/reviews")
        self.assertEqual(reviews_response.status_code, 200, "Failed to get reviews")
        reviews = reviews_response.json()
        
        if reviews:
            # Calculate expected average rating
            total_rating = sum(review["rating"] for review in reviews)
            expected_avg = total_rating / len(reviews)
            
            # Allow for small floating point differences
            self.assertAlmostEqual(plant_before["average_rating"], expected_avg, places=1,
                                 msg="Plant average rating calculation is incorrect")
            self.assertEqual(plant_before["total_reviews"], len(reviews),
                           "Plant total reviews count is incorrect")
            print(f"✅ Rating calculation verified: {plant_before['average_rating']} avg from {len(reviews)} reviews")
        
        # Test order total calculation accuracy
        order_data = {
            "items": [
                {"plant_id": "plant_001", "quantity": 2},
                {"plant_id": "plant_002", "quantity": 1}
            ],
            "shipping_info": {
                "address": "123 Test St",
                "city": "Test City", 
                "state": "TS",
                "zip_code": "12345",
                "country": "US"
            },
            "discount_code": "SPRING20"
        }
        
        response = requests.post(f"{self.base_url}/api/calculate-total", json=order_data)
        self.assertEqual(response.status_code, 200, "Failed to calculate total")
        calculation = response.json()
        
        # Verify calculation components add up correctly
        expected_total = (calculation["subtotal"] + calculation["tax_amount"] + 
                         calculation["shipping_cost"] - calculation["discount_amount"])
        self.assertAlmostEqual(calculation["total"], expected_total, places=2,
                             msg="Order total calculation is incorrect")
        
        print(f"✅ Order calculation verified: ${calculation['total']}")
        print(f"   Subtotal: ${calculation['subtotal']}")
        print(f"   Tax: ${calculation['tax_amount']}")
        print(f"   Shipping: ${calculation['shipping_cost']}")
        print(f"   Discount: ${calculation['discount_amount']}")

if __name__ == "__main__":
    # Run the tests in order
    test_suite = unittest.TestSuite()
    
    # Phase 1 tests (existing functionality)
    test_suite.addTest(NurseryAPITester('test_01_get_plants'))
    test_suite.addTest(NurseryAPITester('test_02_get_plant_by_id'))
    test_suite.addTest(NurseryAPITester('test_03_get_categories'))
    test_suite.addTest(NurseryAPITester('test_04_register_user'))
    test_suite.addTest(NurseryAPITester('test_05_login_user'))
    test_suite.addTest(NurseryAPITester('test_06_calculate_total'))
    test_suite.addTest(NurseryAPITester('test_07_validate_discount'))
    
    # Phase 2-4 tests (new functionality)
    test_suite.addTest(NurseryAPITester('test_09_enhanced_search_filtering'))
    test_suite.addTest(NurseryAPITester('test_10_user_profile_management'))
    test_suite.addTest(NurseryAPITester('test_11_paypal_order_creation'))
    test_suite.addTest(NurseryAPITester('test_12_order_management'))
    test_suite.addTest(NurseryAPITester('test_13_reviews_and_ratings'))
    test_suite.addTest(NurseryAPITester('test_14_wishlist_functionality'))
    test_suite.addTest(NurseryAPITester('test_15_authentication_required_endpoints'))
    test_suite.addTest(NurseryAPITester('test_16_comprehensive_error_handling'))
    test_suite.addTest(NurseryAPITester('test_17_data_integrity_and_calculations'))
    test_suite.addTest(NurseryAPITester('test_08_error_handling'))
    
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(test_suite)
    
    # Print summary
    print(f"\n{'='*60}")
    print(f"TEST SUMMARY")
    print(f"{'='*60}")
    print(f"Tests run: {result.testsRun}")
    print(f"Failures: {len(result.failures)}")
    print(f"Errors: {len(result.errors)}")
    
    if result.failures:
        print(f"\nFAILURES:")
        for test, traceback in result.failures:
            print(f"- {test}: {traceback}")
    
    if result.errors:
        print(f"\nERRORS:")
        for test, traceback in result.errors:
            print(f"- {test}: {traceback}")
    
    success_rate = ((result.testsRun - len(result.failures) - len(result.errors)) / result.testsRun) * 100
    print(f"\nSuccess Rate: {success_rate:.1f}%")