# 🌿 Green Haven Nursery - Complete E-commerce Platform

A full-stack e-commerce application for a plant nursery, built with React, FastAPI, and MongoDB. Features a complete shopping experience with user authentication, payment processing, order management, and more.

## ✨ Features

### 🌱 Plant Catalog
- Browse plants by category (houseplants, succulents, flowering plants)
- Advanced search and filtering (price range, ratings, name)
- Detailed plant information with care instructions
- High-quality plant images
- Real-time stock tracking

### 🛒 Shopping Experience
- Add plants to cart with quantity management
- Wishlist functionality for logged-in users
- Real-time cart calculations
- Discount code support
- Secure checkout process

### 💳 Payment Integration
- PayPal payment processing
- Order confirmation and tracking
- Secure payment handling
- Support for both sandbox and live environments

### 👤 User Management
- User registration and authentication
- JWT-based session management
- User profile management
- Order history and tracking
- Address and shipping information

### ⭐ Reviews & Ratings
- Customer reviews with star ratings
- Review moderation system
- Automatic plant rating calculations
- Helpful review voting system

### 📦 Order Management
- Complete order lifecycle tracking
- Order status updates (pending, processing, shipped, delivered, cancelled)
- Order history for users
- Detailed order information

### 🔍 Advanced Features
- Responsive design for all devices
- Real-time search and filtering
- Category-based browsing
- Price and rating sorting
- Wishlist management

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/Green-Haven.git
cd Green-Haven
```

### 2. Run the Setup Script
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### 3. Configure Environment Variables
Edit the environment files with your configuration:
- `backend/.env` - Backend configuration
- `frontend/.env` - Frontend configuration

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8001
- **API Documentation**: http://localhost:8001/docs

## 🛠️ Manual Setup

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
cp env.example .env
# Edit .env with your configuration
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### Frontend Setup
```bash
cd frontend
yarn install
cp env.example .env
# Edit .env with your configuration
yarn start
```

### Database Setup
- Install MongoDB locally or use MongoDB Atlas
- Update the `MONGO_URL` in your backend `.env` file

## 📁 Project Structure

```
Green-Haven/
├── backend/                 # FastAPI backend
│   ├── server.py           # Main application file
│   ├── requirements.txt    # Python dependencies
│   ├── Dockerfile         # Backend container
│   └── init-mongo.js      # Database initialization
├── frontend/               # React frontend
│   ├── src/
│   │   ├── App.js         # Main application component
│   │   ├── App.css        # Styles
│   │   └── PayPalCheckout.js # Payment component
│   ├── package.json       # Node.js dependencies
│   └── Dockerfile         # Frontend container
├── scripts/               # Utility scripts
│   ├── setup.sh          # Initial setup
│   ├── start.sh          # Start services
│   ├── stop.sh           # Stop services
│   └── reset.sh          # Reset everything
├── docker-compose.yml     # Multi-container setup
└── README.md             # This file
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
SECRET_KEY=your-super-secret-key
MONGO_URL=mongodb://localhost:27017
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_SECRET=your_paypal_secret
PAYPAL_MODE=sandbox
ALLOWED_ORIGINS=http://localhost:3000
ADMIN_RESET_TOKEN=your_admin_token
```

#### Frontend (.env)
```env
REACT_APP_BACKEND_URL=http://localhost:8001
REACT_APP_PAYPAL_CLIENT_ID=your_paypal_client_id
```

### PayPal Setup
1. Create a PayPal Developer account
2. Create a new app to get your Client ID and Secret
3. Update the environment variables with your credentials
4. Use "sandbox" mode for testing, "live" for production

## 🧪 Testing

### Backend Tests
```bash
cd backend
python -m pytest
```

### Frontend Tests
```bash
cd frontend
yarn test
```

## 📊 API Documentation

Once the backend is running, visit http://localhost:8001/docs for interactive API documentation.

### Key Endpoints
- `GET /api/plants` - Get all plants with filtering
- `POST /api/register` - User registration
- `POST /api/login` - User authentication
- `GET /api/orders` - Get user orders
- `POST /api/paypal/create-order` - Create PayPal order
- `GET /api/plants/{id}/reviews` - Get plant reviews

## 🚀 Deployment

### Production Deployment Notes

#### Backend (FastAPI)
- Set environment variables in your production environment:
  - `SECRET_KEY` (required, strong random string)
  - `MONGO_URL` (your MongoDB connection string)
  - `PAYPAL_CLIENT_ID` and `PAYPAL_SECRET` (PayPal API credentials)
  - `PAYPAL_MODE` ("live" for production, "sandbox" for testing)
  - `ALLOWED_ORIGINS` (comma-separated list of allowed frontend origins)
- Run with a production server (e.g., `uvicorn backend.server:app --host 0.0.0.0 --port 8001 --workers 4`)
- Use HTTPS in production

#### Frontend (React)
- Set environment variables in your deployment platform:
  - `REACT_APP_BACKEND_URL` (URL of your backend API)
  - `REACT_APP_PAYPAL_CLIENT_ID` (PayPal client ID)
- Build for production: `yarn build` or `npm run build`
- Serve the `build/` directory with a static file server

#### Render Deployment
The project includes a `render.yaml` file for easy deployment on Render.com.

## 🛠️ Development

### Available Scripts
- `./scripts/setup.sh` - Initial project setup
- `./scripts/start.sh` - Start all services
- `./scripts/stop.sh` - Stop all services
- `./scripts/reset.sh` - Reset all data and start fresh

### Code Style
- Backend: Follow PEP 8 standards
- Frontend: Use ESLint and Prettier
- Use meaningful commit messages

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Jathin** - [GitHub](https://github.com/pjathin021) - [Email](mailto:your@email.com)

## 🙏 Acknowledgments

- Plant images from [Unsplash](https://unsplash.com)
- Icons and UI inspiration from modern e-commerce platforms
- PayPal for payment processing integration

---

**🌿 Happy Planting!** 🌱
