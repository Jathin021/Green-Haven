#!/bin/bash

# Green Haven Nursery - Start Script
# Quick start for the application

echo "🌿 Starting Green Haven Nursery..."

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed"
    exit 1
fi

# Start the services
echo "🚀 Starting services..."
docker-compose up -d

echo ""
echo "⏳ Services are starting up..."
echo "📱 Frontend will be available at: http://localhost:3000"
echo "🔧 Backend API will be available at: http://localhost:8001"
echo ""
echo "📊 View logs with: docker-compose logs -f" 