#!/bin/bash

# Docker Compose startup script for Cyberpunk RED Character Sheet

set -e

echo "🚀 Starting Cyberpunk RED Character Sheet..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚙️  Creating .env file from example..."
    cp .env.example .env
    echo "⚠️  Please edit .env and set a secure SECRET_KEY before starting!"
    exit 1
fi

# Build and start services
docker-compose up -d

echo ""
echo "✅ Services started successfully!"
echo ""
echo "📱 Frontend: http://localhost:80"
echo "🔧 Backend API: http://localhost:8000"
echo "📚 Swagger Docs: http://localhost:8000/docs"
echo ""
echo "📝 View logs: docker-compose logs -f"
echo "🛑 Stop services: docker-compose down"
echo ""
