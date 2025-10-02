#!/bin/bash

# Schoman Quick Installation Script
# This script installs all dependencies for backend and frontend

echo "🚀 Installation automatique de Schoman"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js n'est pas installé${NC}"
    echo "Veuillez installer Node.js v18+ depuis https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✓${NC} Node.js $(node --version) détecté"
echo ""

# Install backend dependencies
echo -e "${BLUE}📦 Installation des dépendances backend...${NC}"
cd backend
if npm install; then
    echo -e "${GREEN}✓${NC} Dépendances backend installées avec succès"
else
    echo -e "${RED}✗${NC} Erreur lors de l'installation des dépendances backend"
    exit 1
fi
echo ""

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}ℹ${NC} Création du fichier .env pour le backend..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${GREEN}✓${NC} Fichier .env créé à partir de .env.example"
    else
        cat > .env << 'EOF'
# Variables d'environnement pour le backend Schoman

# Port du serveur
PORT=3000

# URL de la base de données MongoDB
MONGODB_URI=mongodb://localhost:27017/schoman

# JWT Secret (générez une clé sécurisée en production)
JWT_SECRET=votre_jwt_secret_tres_securise_ici

# Environnement
NODE_ENV=development
EOF
        echo -e "${GREEN}✓${NC} Fichier .env créé avec les valeurs par défaut"
    fi
    echo -e "${YELLOW}⚠${NC} N'oubliez pas de configurer MongoDB dans backend/.env"
fi

cd ..
echo ""

# Install frontend dependencies
echo -e "${BLUE}📦 Installation des dépendances frontend...${NC}"
cd frontend
if npm install; then
    echo -e "${GREEN}✓${NC} Dépendances frontend installées avec succès"
else
    echo -e "${RED}✗${NC} Erreur lors de l'installation des dépendances frontend"
    exit 1
fi
echo ""

# Create frontend .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}ℹ${NC} Création du fichier .env pour le frontend..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${GREEN}✓${NC} Fichier .env créé à partir de .env.example"
    fi
fi

cd ..
echo ""

# Build verification
echo -e "${BLUE}🔨 Vérification de la compilation...${NC}"

cd backend
if npx tsc --noEmit 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Backend compile sans erreur"
else
    echo -e "${RED}✗${NC} Erreurs de compilation dans le backend"
fi

cd ../frontend
if npm run type-check 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Frontend compile sans erreur"
else
    echo -e "${RED}✗${NC} Erreurs de compilation dans le frontend"
fi

cd ..
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Installation terminée !${NC}"
echo ""
echo "Prochaines étapes :"
echo ""
echo "1. ${YELLOW}Configurez MongoDB${NC}"
echo "   - Modifiez backend/.env avec votre URL MongoDB"
echo "   - Options: MongoDB Atlas, Local, ou Docker"
echo ""
echo "2. ${YELLOW}Initialisez la base de données${NC}"
echo "   cd backend && npm run seed"
echo ""
echo "3. ${YELLOW}Démarrez le backend${NC} (dans un terminal)"
echo "   cd backend && npm run dev"
echo ""
echo "4. ${YELLOW}Démarrez le frontend${NC} (dans un autre terminal)"
echo "   cd frontend && npm run dev"
echo ""
echo "5. ${YELLOW}Accédez à l'application${NC}"
echo "   http://localhost:5173"
echo ""
echo "📚 Pour plus d'informations, consultez SETUP_GUIDE.md"
echo ""
