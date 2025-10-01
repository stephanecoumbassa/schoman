#!/bin/bash

# Schoman Quick Setup Script
# This script helps set up the Schoman development environment

set -e  # Exit on error

echo "🎓 Schoman Quick Setup"
echo "====================="
echo ""

# Check Node.js version
echo "Checking Node.js version..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20.19+ or 22.12+"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js version must be 20 or higher. Current version: $(node -v)"
    exit 1
fi
echo "✅ Node.js $(node -v) detected"
echo ""

# Check MongoDB
echo "Checking MongoDB..."
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB is not installed or not in PATH"
    echo "   Please install MongoDB 6.0+ from https://www.mongodb.com/try/download/community"
    echo "   Or run: docker run -d -p 27017:27017 --name mongodb mongo:6"
else
    echo "✅ MongoDB detected"
fi
echo ""

# Setup Backend
echo "Setting up Backend..."
cd backend

if [ ! -f ".env" ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please update backend/.env with your settings"
fi

echo "Installing backend dependencies..."
npm install

echo "Building backend..."
npm run build

cd ..
echo "✅ Backend setup complete"
echo ""

# Setup Frontend
echo "Setting up Frontend..."
cd frontend

if [ ! -f ".env" ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
fi

echo "Installing frontend dependencies..."
npm install

echo "Building frontend..."
npm run build

cd ..
echo "✅ Frontend setup complete"
echo ""

echo "🎉 Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Make sure MongoDB is running (mongod or docker)"
echo "2. Update environment variables in backend/.env and frontend/.env"
echo "3. Start the backend: cd backend && npm run dev"
echo "4. Start the frontend: cd frontend && npm run dev"
echo "5. Access the app at http://localhost:5173"
echo ""
echo "For more information, see README.md"
