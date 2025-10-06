#!/bin/bash

# Schoman Validation Script
# Validates that the application is properly configured and running

set -e

echo "🔍 Schoman Validation Script"
echo "============================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check Node.js
echo "📦 Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✅ Node.js $NODE_VERSION installed${NC}"
else
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

# Check npm
echo "📦 Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✅ npm $NPM_VERSION installed${NC}"
else
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

# Check backend dependencies
echo ""
echo "🔍 Checking backend..."
if [ -d "backend/node_modules" ]; then
    echo -e "${GREEN}✅ Backend dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠️  Backend dependencies not installed${NC}"
    echo "   Run: cd backend && npm install"
fi

# Check backend .env
if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✅ Backend .env file exists${NC}"
else
    echo -e "${YELLOW}⚠️  Backend .env file missing${NC}"
    echo "   Run: cp backend/.env.example backend/.env"
fi

# Check backend build
if [ -d "backend/dist" ]; then
    echo -e "${GREEN}✅ Backend is built${NC}"
else
    echo -e "${YELLOW}⚠️  Backend not built${NC}"
    echo "   Run: cd backend && npm run build"
fi

# Check frontend dependencies
echo ""
echo "🔍 Checking frontend..."
if [ -d "frontend/node_modules" ]; then
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend dependencies not installed${NC}"
    echo "   Run: cd frontend && npm install"
fi

# Check frontend .env
if [ -f "frontend/.env" ]; then
    echo -e "${GREEN}✅ Frontend .env file exists${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend .env file missing${NC}"
    echo "   Run: cp frontend/.env.example frontend/.env"
fi

# Check Docker
echo ""
echo "🐳 Checking Docker (optional)..."
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | cut -d',' -f1)
    echo -e "${GREEN}✅ Docker $DOCKER_VERSION installed${NC}"
    
    if command -v docker-compose &> /dev/null; then
        COMPOSE_VERSION=$(docker-compose --version | cut -d' ' -f4 | cut -d',' -f1)
        echo -e "${GREEN}✅ Docker Compose $COMPOSE_VERSION installed${NC}"
    else
        echo -e "${YELLOW}⚠️  Docker Compose not installed${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Docker not installed (optional for deployment)${NC}"
fi

# Check MongoDB (if running locally)
echo ""
echo "🗄️  Checking MongoDB..."
if command -v mongosh &> /dev/null || command -v mongo &> /dev/null; then
    echo -e "${GREEN}✅ MongoDB client tools installed${NC}"
    
    # Try to connect to local MongoDB
    if mongosh --eval "db.runCommand({ ping: 1 })" mongodb://localhost:27017/test &> /dev/null 2>&1; then
        echo -e "${GREEN}✅ MongoDB is running on localhost:27017${NC}"
    elif mongo --eval "db.runCommand({ ping: 1 })" mongodb://localhost:27017/test &> /dev/null 2>&1; then
        echo -e "${GREEN}✅ MongoDB is running on localhost:27017${NC}"
    else
        echo -e "${YELLOW}⚠️  MongoDB not running on localhost (Atlas or remote connection expected)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  MongoDB client tools not installed${NC}"
    echo "   Using MongoDB Atlas or remote connection"
fi

# Check if backend is running
echo ""
echo "🚀 Checking if services are running..."
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is running on http://localhost:3000${NC}"
    
    # Get health status
    HEALTH=$(curl -s http://localhost:3000/health)
    echo -e "${BLUE}   Health check: $HEALTH${NC}"
else
    echo -e "${YELLOW}⚠️  Backend is not running${NC}"
    echo "   To start: cd backend && npm run dev"
fi

# Check if frontend is running
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is running on http://localhost:5173${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend is not running${NC}"
    echo "   To start: cd frontend && npm run dev"
fi

echo ""
echo "================================"
echo "📋 Validation Summary"
echo "================================"

# Count checks
TOTAL_CHECKS=0
PASSED_CHECKS=0

# This is a simplified summary - in a real script we'd track each check
echo -e "${BLUE}ℹ️  Check the output above for detailed status${NC}"
echo ""
echo "📚 Quick Start Commands:"
echo "   Setup:    ./setup.sh"
echo "   Backend:  cd backend && npm run dev"
echo "   Frontend: cd frontend && npm run dev"
echo "   Docker:   docker-compose up -d"
echo ""
