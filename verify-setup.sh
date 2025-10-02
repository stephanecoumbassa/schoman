#!/bin/bash

# Schoman Setup Verification Script
# This script verifies that all prerequisites are met

echo "🔍 Vérification de l'environnement Schoman..."
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Check Node.js
echo -n "Vérification de Node.js... "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ "$MAJOR_VERSION" -ge 18 ]; then
        echo -e "${GREEN}✓${NC} Node.js $NODE_VERSION installé"
    else
        echo -e "${YELLOW}⚠${NC} Node.js $NODE_VERSION (v18+ recommandé)"
        WARNINGS=$((WARNINGS+1))
    fi
else
    echo -e "${RED}✗${NC} Node.js non installé"
    ERRORS=$((ERRORS+1))
fi

# Check npm
echo -n "Vérification de npm... "
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓${NC} npm $NPM_VERSION installé"
else
    echo -e "${RED}✗${NC} npm non installé"
    ERRORS=$((ERRORS+1))
fi

# Check MongoDB
echo -n "Vérification de MongoDB... "
if command -v mongod &> /dev/null; then
    echo -e "${GREEN}✓${NC} MongoDB installé localement"
elif command -v docker &> /dev/null && docker ps -a | grep -q mongo; then
    echo -e "${GREEN}✓${NC} MongoDB disponible via Docker"
else
    echo -e "${YELLOW}⚠${NC} MongoDB non détecté localement (MongoDB Atlas peut être utilisé)"
    WARNINGS=$((WARNINGS+1))
fi

# Check backend dependencies
echo -n "Vérification des dépendances backend... "
if [ -d "backend/node_modules" ]; then
    echo -e "${GREEN}✓${NC} Dépendances backend installées"
else
    echo -e "${YELLOW}⚠${NC} Dépendances backend manquantes (exécutez: cd backend && npm install)"
    WARNINGS=$((WARNINGS+1))
fi

# Check frontend dependencies
echo -n "Vérification des dépendances frontend... "
if [ -d "frontend/node_modules" ]; then
    echo -e "${GREEN}✓${NC} Dépendances frontend installées"
else
    echo -e "${YELLOW}⚠${NC} Dépendances frontend manquantes (exécutez: cd frontend && npm install)"
    WARNINGS=$((WARNINGS+1))
fi

# Check backend .env
echo -n "Vérification de backend/.env... "
if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✓${NC} Fichier .env présent"
    
    # Check MONGODB_URI
    if grep -q "MONGODB_URI=" backend/.env; then
        MONGODB_URI=$(grep "MONGODB_URI=" backend/.env | cut -d'=' -f2)
        if [ "$MONGODB_URI" = "mongodb://localhost:27017/schoman" ]; then
            echo -e "   ${YELLOW}ℹ${NC} Configuration MongoDB locale détectée"
        else
            echo -e "   ${GREEN}ℹ${NC} Configuration MongoDB personnalisée détectée"
        fi
    fi
else
    echo -e "${RED}✗${NC} Fichier backend/.env manquant (exécutez: cp backend/.env.example backend/.env)"
    ERRORS=$((ERRORS+1))
fi

# Check frontend .env
echo -n "Vérification de frontend/.env... "
if [ -f "frontend/.env" ]; then
    echo -e "${GREEN}✓${NC} Fichier .env présent"
else
    echo -e "${YELLOW}⚠${NC} Fichier frontend/.env manquant (par défaut: http://localhost:3000/api)"
    WARNINGS=$((WARNINGS+1))
fi

# Check if TypeScript compiles
echo -n "Vérification de la compilation TypeScript backend... "
if [ -d "backend/node_modules" ]; then
    cd backend
    if npx tsc --noEmit 2>/dev/null; then
        echo -e "${GREEN}✓${NC} Backend compile sans erreur"
    else
        echo -e "${RED}✗${NC} Erreurs de compilation dans le backend"
        ERRORS=$((ERRORS+1))
    fi
    cd ..
else
    echo -e "${YELLOW}⊘${NC} Ignoré (dépendances manquantes)"
fi

echo -n "Vérification de la compilation TypeScript frontend... "
if [ -d "frontend/node_modules" ]; then
    cd frontend
    if npm run type-check 2>/dev/null; then
        echo -e "${GREEN}✓${NC} Frontend compile sans erreur"
    else
        echo -e "${RED}✗${NC} Erreurs de compilation dans le frontend"
        ERRORS=$((ERRORS+1))
    fi
    cd ..
else
    echo -e "${YELLOW}⊘${NC} Ignoré (dépendances manquantes)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Summary
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ Tout est prêt !${NC} Vous pouvez lancer l'application."
    echo ""
    echo "Prochaines étapes :"
    echo "1. Démarrez MongoDB (si local) : sudo systemctl start mongod"
    echo "2. Initialisez la base de données : cd backend && npm run seed"
    echo "3. Démarrez le backend : cd backend && npm run dev"
    echo "4. Démarrez le frontend : cd frontend && npm run dev"
    echo "5. Ouvrez http://localhost:5173 dans votre navigateur"
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ Configuration incomplète${NC} ($WARNINGS avertissement(s))"
    echo ""
    echo "Consultez SETUP_GUIDE.md pour des instructions détaillées."
else
    echo -e "${RED}❌ Problèmes détectés${NC} ($ERRORS erreur(s), $WARNINGS avertissement(s))"
    echo ""
    echo "Veuillez résoudre les erreurs ci-dessus."
    echo "Consultez SETUP_GUIDE.md pour de l'aide."
fi

echo ""
