# Guide de Démarrage Rapide - Schoman

Ce guide vous aidera à démarrer avec le projet Schoman en quelques minutes.

## 🚀 Démarrage Rapide

### 1. Prérequis
Assurez-vous d'avoir installé :
- Node.js version 20.19 ou supérieure
- npm (inclus avec Node.js)
- Git

### 2. Installation

```bash
# Cloner le projet (si pas déjà fait)
git clone https://github.com/stephanecoumbassa/schoman.git
cd schoman

# Installer les dépendances du backend
cd backend
npm install

# Installer les dépendances du frontend
cd ../frontend
npm install
```

### 3. Configuration du Backend

```bash
cd backend

# Copier le fichier d'exemple des variables d'environnement
cp .env.example .env

# Éditer le fichier .env selon vos besoins
# Par défaut, MongoDB n'est pas requis pour tester le serveur
```

Variables d'environnement par défaut :
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/schoman
JWT_SECRET=votre_jwt_secret_tres_securise_ici
NODE_ENV=development
```

### 4. Démarrer les Applications

#### Option 1 : Démarrage Manuel (2 terminaux)

**Terminal 1 - Backend :**
```bash
cd backend
npm run dev
```
Le serveur API démarre sur http://localhost:3000

**Terminal 2 - Frontend :**
```bash
cd frontend
npm run dev
```
L'application web démarre sur http://localhost:5173

#### Option 2 : Démarrage avec MongoDB (optionnel)

Si vous souhaitez utiliser MongoDB :
```bash
# Démarrer MongoDB localement (exemple avec Docker)
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Ou installer MongoDB localement depuis mongodb.com
```

### 5. Tester l'Installation

#### Backend
```bash
# Tester l'endpoint principal
curl http://localhost:3000/

# Tester le health check
curl http://localhost:3000/health
```

Réponse attendue :
```json
{
  "message": "Bienvenue sur l'API Schoman!",
  "status": "En fonctionnement",
  "timestamp": "2025-10-01T12:00:00.000Z"
}
```

#### Frontend
Ouvrez votre navigateur et accédez à http://localhost:5173/

Vous devriez voir la page d'accueil Vue.js avec :
- Le logo Vue
- Navigation (Home / About)
- Sections Documentation, Tooling, Ecosystem, etc.

### 6. Scripts Disponibles

#### Backend (`backend/`)
```bash
npm run dev      # Mode développement avec hot reload
npm run build    # Compiler TypeScript
npm start        # Démarrer en production
```

#### Frontend (`frontend/`)
```bash
npm run dev        # Mode développement avec Vite
npm run build      # Build de production
npm run preview    # Prévisualiser le build
npm run type-check # Vérifier les types TypeScript
npm run lint       # Linter le code
npm run format     # Formater le code
```

## 🛠️ Structure du Projet

```
schoman/
├── backend/              # API Node.js
│   ├── src/
│   │   └── index.ts     # Point d'entrée
│   ├── dist/            # Compiled output (généré)
│   ├── package.json
│   ├── tsconfig.json
│   ├── nodemon.json
│   └── .env.example
│
├── frontend/            # Application Vue.js
│   ├── src/
│   │   ├── main.ts      # Point d'entrée
│   │   ├── App.vue
│   │   ├── components/
│   │   ├── views/
│   │   ├── router/
│   │   └── stores/
│   ├── dist/            # Build de production (généré)
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── .gitignore
├── README.md
├── Project.md           # Vision et fonctionnalités prévues
└── GETTING_STARTED.md   # Ce fichier
```

## 🔍 Vérification de l'Installation

### Backend
- ✅ Le serveur démarre sans erreur
- ✅ `http://localhost:3000/` retourne un message JSON
- ✅ `http://localhost:3000/health` retourne le statut de l'API

### Frontend
- ✅ Vite démarre sans erreur
- ✅ La page s'affiche dans le navigateur
- ✅ La navigation fonctionne (Home / About)
- ✅ Aucune erreur dans la console du navigateur

## 📚 Prochaines Étapes

Maintenant que votre environnement est configuré :

1. **Explorez le code** : Parcourez `backend/src/` et `frontend/src/`
2. **Lisez Project.md** : Consultez la vision complète du projet
3. **Développez des fonctionnalités** : Commencez à implémenter les modules
4. **Testez** : Ajoutez des tests pour votre code
5. **Contribuez** : Partagez vos améliorations

## 🆘 Problèmes Courants

### Port déjà utilisé
```bash
# Si le port 3000 est déjà utilisé
# Modifiez PORT dans backend/.env

# Si le port 5173 est déjà utilisé
# Vite choisira automatiquement un port différent
```

### MongoDB non disponible
Le backend fonctionne même sans MongoDB. L'endpoint `/health` indiquera simplement que la base de données est déconnectée.

### Erreurs de TypeScript
```bash
# Nettoyer et réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install
```

### Erreurs de build
```bash
# Backend
cd backend
rm -rf dist node_modules
npm install
npm run build

# Frontend
cd frontend
rm -rf dist node_modules
npm install
npm run build
```

## 💡 Conseils

- Utilisez **VS Code** avec les extensions recommandées (voir `.vscode/extensions.json`)
- Activez **ESLint** et **Prettier** dans votre éditeur
- Consultez les logs dans le terminal pour déboguer
- Utilisez **Vue DevTools** dans le navigateur pour inspecter l'application Vue

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez que toutes les dépendances sont installées
2. Assurez-vous d'utiliser Node.js 20.19+
3. Consultez les logs d'erreur dans le terminal
4. Ouvrez une issue sur GitHub avec les détails

---

Bon développement ! 🎉
