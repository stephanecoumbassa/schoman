#!/bin/bash

# Schoman Setup Script
# This script sets up the development environment

set -e

echo "🎓 Schoman Setup Script"
echo "======================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
echo "📦 Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ first.${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version must be 18 or higher. Current version: $(node -v)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v) detected${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm $(npm -v) detected${NC}"

# Install backend dependencies
echo ""
echo "📚 Installing backend dependencies..."
cd backend
if [ ! -d "node_modules" ]; then
    npm install
    echo -e "${GREEN}✅ Backend dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠️  Backend dependencies already installed${NC}"
fi

# Create backend .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo ""
    echo "⚙️  Creating backend .env file..."
    cp .env.example .env
    echo -e "${GREEN}✅ Backend .env file created${NC}"
    echo -e "${YELLOW}⚠️  Please update MongoDB connection string in backend/.env${NC}"
else
    echo -e "${YELLOW}⚠️  Backend .env file already exists${NC}"
fi

cd ..

# Install frontend dependencies
echo ""
echo "🎨 Installing frontend dependencies..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend dependencies already installed${NC}"
fi

# Create frontend .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo ""
    echo "⚙️  Creating frontend .env file..."
    cp .env.example .env
    echo -e "${GREEN}✅ Frontend .env file created${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend .env file already exists${NC}"
fi

cd ..

# Build backend to verify
echo ""
echo "🔨 Building backend..."
cd backend
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend build successful${NC}"
else
    echo -e "${RED}❌ Backend build failed${NC}"
    cd ..
    exit 1
fi
cd ..

# Build frontend to verify
echo ""
echo "🔨 Building frontend..."
cd frontend
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend build successful${NC}"
else
    echo -e "${RED}❌ Frontend build failed${NC}"
    cd ..
    exit 1
fi
cd ..

echo ""
echo -e "${GREEN}🎉 Setup completed successfully!${NC}"
echo ""
echo "📋 Next steps:"
echo "1. Configure MongoDB connection in backend/.env"
echo "2. Start MongoDB (local or Atlas)"
echo "3. Seed the database: cd backend && npm run seed"
echo "4. Start backend: cd backend && npm run dev"
echo "5. Start frontend (new terminal): cd frontend && npm run dev"
echo "6. Open http://localhost:5173 in your browser"
echo ""
echo "📚 Default credentials:"
echo "   Admin: admin@schoman.com / admin123"
echo "   Teacher: teacher@schoman.com / teacher123"
echo "   Student: student@schoman.com / student123"
echo ""
