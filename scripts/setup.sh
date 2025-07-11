#!/bin/bash

# Green Haven Nursery - Setup Script
# This script helps you set up the project for local development

set -e

echo "🌿 Welcome to Green Haven Nursery Setup!"
echo "========================================"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "   Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# Create environment files if they don't exist
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating backend environment file..."
    cp backend/env.example backend/.env
    echo "   Please edit backend/.env with your configuration"
fi

if [ ! -f "frontend/.env" ]; then
    echo "📝 Creating frontend environment file..."
    cp frontend/env.example frontend/.env
    echo "   Please edit frontend/.env with your configuration"
fi

# Build and start the application
echo "🚀 Building and starting the application..."
docker-compose up --build -d

echo ""
echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
echo "🔍 Checking service status..."
if curl -f http://localhost:8001/ > /dev/null 2>&1; then
    echo "✅ Backend is running at http://localhost:8001"
else
    echo "❌ Backend is not responding"
fi

if curl -f http://localhost:3000/ > /dev/null 2>&1; then
    echo "✅ Frontend is running at http://localhost:3000"
else
    echo "❌ Frontend is not responding"
fi

echo ""
echo "🎉 Setup complete!"
echo "=================="
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8001"
echo "📊 API Documentation: http://localhost:8001/docs"
echo ""
echo "📋 Next steps:"
echo "1. Open http://localhost:3000 in your browser"
echo "2. Register a new account"
echo "3. Browse plants and test the features"
echo ""
echo "🛠️  Useful commands:"
echo "   View logs: docker-compose logs -f"
echo "   Stop services: docker-compose down"
echo "   Restart services: docker-compose restart"
echo ""
echo "📚 For more information, see README.md" 