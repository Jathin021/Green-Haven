#!/bin/bash

# Green Haven Nursery - Stop Script
# Stop all services

echo "🌿 Stopping Green Haven Nursery..."

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed"
    exit 1
fi

# Stop the services
echo "🛑 Stopping services..."
docker-compose down

echo "✅ All services stopped" 