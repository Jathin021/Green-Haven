#!/bin/bash

# Green Haven Nursery - Reset Script
# Reset all data and start fresh

echo "🌿 Resetting Green Haven Nursery..."

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed"
    exit 1
fi

# Stop and remove all containers and volumes
echo "🛑 Stopping and removing all containers..."
docker-compose down -v

# Remove all images
echo "🗑️  Removing all images..."
docker-compose down --rmi all

# Clean up any dangling images
echo "🧹 Cleaning up dangling images..."
docker image prune -f

echo ""
echo "✅ Reset complete!"
echo "🚀 Run './scripts/setup.sh' to start fresh" 