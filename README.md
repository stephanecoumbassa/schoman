# Schoman - Application Full Stack

Ce projet contient deux applications constituant un système complet de gestion scolaire.

## 📋 Fonctionnalités

### Modules Implémentés
- ✅ **Authentification** : Système de connexion sécurisé avec JWT
- ✅ **Gestion des Utilisateurs** : Système de rôles (admin, enseignant, étudiant, parent)
- ✅ **Gestion des Étudiants** : CRUD complet pour les étudiants
- ✅ **Dashboard** : Tableau de bord avec statistiques
- 🚧 **Gestion des Enseignants** : En cours de développement
- 🚧 **Gestion des Classes** : En cours de développement
- 🚧 **Module Comptabilité** : En cours de développement
- 🚧 **Module Facturation** : En cours de développement

## 🖥️ Frontend (Vue.js + Tailwind CSS)

Le frontend se trouve dans le dossier `frontend/` et utilise :
- **Vue.js 3** avec TypeScript
- **Tailwind CSS** pour le styling
- **Vue Router** pour la navigation
- **Pinia** pour la gestion d'état
- **Vite** pour le build

### Démarrage du frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

### Pages disponibles
- `/login` - Page de connexion
- `/dashboard` - Tableau de bord principal
- `/students` - Gestion des étudiants

## 🚀 Backend (Node.js + TypeScript + MongoDB)

Le backend se trouve dans le dossier `backend/` et utilise :
- **Node.js** avec TypeScript
- **Express.js** pour l'API REST
- **MongoDB** avec Mongoose
- **JWT** pour l'authentification
- **bcryptjs** pour le hachage des mots de passe

### Démarrage du backend
```bash
cd backend
npm install
cp .env.example .env
# Modifiez le fichier .env avec vos paramètres
npm run dev
```

L'API sera accessible sur `http://localhost:3000`

### Endpoints API disponibles

#### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/profile` - Profil utilisateur (authentifié)

#### Étudiants
- `GET /api/students` - Liste des étudiants (authentifié)
- `GET /api/students/:id` - Détails d'un étudiant (authentifié)
- `POST /api/students` - Créer un étudiant (admin/enseignant)
- `PUT /api/students/:id` - Modifier un étudiant (admin/enseignant)
- `DELETE /api/students/:id` - Supprimer un étudiant (admin)

#### Santé
- `GET /health` - Vérification de l'état de l'API et de la base de données

## 📋 Prérequis

- Node.js (version 18 ou supérieure)
- MongoDB (local ou distant)
- Git

## 🛠️ Installation complète

### 1. Clonez le projet
```bash
git clone <repository-url>
cd schoman
```

### 2. Installez les dépendances

**Backend :**
```bash
cd backend
npm install
```

**Frontend :**
```bash
cd frontend
npm install
```

### 3. Configurez les variables d'environnement

**Backend (.env) :**
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/schoman
JWT_SECRET=votre_jwt_secret_tres_securise_ici
NODE_ENV=development
```

**Frontend (.env) :**
```env
VITE_API_URL=http://localhost:3000/api
```

### 4. Démarrez MongoDB
Assurez-vous que MongoDB est en cours d'exécution :
```bash
# Sur macOS avec Homebrew
brew services start mongodb-community

# Sur Linux
sudo systemctl start mongod

# Ou utilisez Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 5. Lancez les applications

**Terminal 1 - Backend :**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend :**
```bash
cd frontend
npm run dev
```

## 📁 Structure du projet

```
schoman/
├── frontend/          # Application Vue.js
│   ├── src/
│   │   ├── components/
│   │   ├── views/
│   │   │   ├── auth/          # Pages d'authentification
│   │   │   ├── dashboard/     # Tableau de bord
│   │   │   └── students/      # Gestion des étudiants
│   │   ├── stores/            # Pinia stores
│   │   ├── services/          # Services API
│   │   └── router/            # Configuration des routes
│   ├── public/
│   └── package.json
├── backend/           # API Node.js
│   ├── src/
│   │   ├── models/            # Modèles Mongoose
│   │   ├── controllers/       # Contrôleurs
│   │   ├── routes/            # Routes API
│   │   ├── middleware/        # Middleware (auth, etc.)
│   │   ├── utils/             # Utilitaires (JWT, etc.)
│   │   └── index.ts           # Point d'entrée
│   ├── package.json
│   └── .env.example
└── README.md
```

## 🔧 Scripts disponibles

### Frontend
- `npm run dev` - Mode développement
- `npm run build` - Build de production
- `npm run preview` - Prévisualisation du build
- `npm run lint` - Vérification du code

### Backend
- `npm run dev` - Mode développement avec nodemon
- `npm run build` - Compilation TypeScript
- `npm start` - Démarrage en production

## 👤 Créer un compte administrateur

Pour créer votre premier compte administrateur, utilisez l'endpoint `/api/auth/register` avec le rôle "admin" :

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@schoman.com",
    "password": "admin123",
    "firstName": "Admin",
    "lastName": "Schoman",
    "role": "admin"
  }'
```

Ou utilisez un outil comme Postman/Insomnia.

## 🎨 Technologies Utilisées

**Frontend:**
- Vue.js 3
- TypeScript
- Tailwind CSS
- Pinia
- Vue Router
- Vite

**Backend:**
- Node.js
- TypeScript
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs

## 🔒 Sécurité

- Les mots de passe sont hachés avec bcryptjs
- Authentification par JWT
- Protection des routes par rôle
- Validation des données
- CORS configuré

## 📄 Licence

Ce projet est sous licence MIT.

