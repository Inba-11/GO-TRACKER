#!/bin/bash

echo "🚀 Setting up Go Tracker Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB first."
    echo "   Local: mongod"
    echo "   Or use MongoDB Atlas connection string in .env"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env 2>/dev/null || echo "Please create .env file manually"
fi

# Initialize user
echo "👤 Initializing user data..."
npm run init-user

echo "✅ Setup completed!"
echo ""
echo "Next steps:"
echo "1. Start the server: npm run dev"
echo "2. Test the API: npm run test-api"
echo "3. Visit: http://localhost:5000"
echo ""
echo "API Endpoints:"
echo "- GET  /api/users/roll/711523BCB023"
echo "- POST /api/users/{id}/scrape"
echo "- GET  /health"