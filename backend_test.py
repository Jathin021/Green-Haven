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
        self.base_url = "https://b395a8f9-a5f3-4ca7-90da-44a312b2815f.preview.emergentagent.com"
        self.token = None
        self.user_id = None
        self.test_user_email = f"test_user_{uuid.uuid4()}@example.com"
        self.test_password = "Test123!"
        self.test_plant_id = "plant_001"  # Monstera Deliciosa from sample data

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

    def test_08_error_handling(self):
        """Test error handling for various endpoints"""
        print("\n🔍 Testing error handling...")
        
        # Test non-existent plant
        response = requests.get(f"{self.base_url}/api/plants/nonexistent")
        self.assertEqual(response.status_code, 404, "Non-existent plant should return 404")
        
        # Test invalid login
        login_data = {
            "email": "nonexistent@example.com",
            "password": "wrongpassword"
        }
        response = requests.post(f"{self.base_url}/api/login", json=login_data)
        self.assertEqual(response.status_code, 401, "Invalid login should return 401")
        
        print("✅ Error handling works correctly")


if __name__ == "__main__":
    # Run the tests in order
    test_suite = unittest.TestSuite()
    test_suite.addTest(NurseryAPITester('test_01_get_plants'))
    test_suite.addTest(NurseryAPITester('test_02_get_plant_by_id'))
    test_suite.addTest(NurseryAPITester('test_03_get_categories'))
    test_suite.addTest(NurseryAPITester('test_04_register_user'))
    test_suite.addTest(NurseryAPITester('test_05_login_user'))
    test_suite.addTest(NurseryAPITester('test_06_calculate_total'))
    test_suite.addTest(NurseryAPITester('test_07_validate_discount'))
    test_suite.addTest(NurseryAPITester('test_08_error_handling'))
    
    runner = unittest.TextTestRunner(verbosity=2)
    runner.run(test_suite)