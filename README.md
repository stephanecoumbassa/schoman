# Schoman - Application Full Stack

Application complète de gestion d'école avec authentification, gestion des élèves, classes, notes et présences.

> **🚀 Installation Rapide:** Consultez [SETUP_GUIDE.md](./SETUP_GUIDE.md) pour un guide complet d'installation pas à pas.

> **Note:** L'application est configurée pour utiliser MongoDB Atlas (cloud) par défaut. Aucune installation locale de MongoDB n'est requise.

## 🎯 Fonctionnalités Implémentées

### Backend (API REST)
- ✅ Authentification JWT avec rôles (admin, enseignant, élève, parent)
- ✅ Gestion des utilisateurs
- ✅ CRUD complet pour les élèves
- ✅ Gestion des classes (CRUD complet)
- ✅ Gestion des notes/bulletins (création, modification, moyennes)
- ✅ Suivi des présences/absences (enregistrement et statistiques)
- ✅ Tableau de bord avec statistiques
- ✅ Recherche et filtrage avancés
- ✅ Pagination des résultats

### Frontend (Interface Web)
- ✅ Page de connexion sécurisée
- ✅ Tableau de bord avec statistiques en temps réel
- ✅ Interface de gestion des élèves
- ✅ Interface de gestion des classes
- ✅ Recherche et filtres avancés
- ✅ Design responsive avec Tailwind CSS
- ✅ Navigation protégée par rôles

## 🖥️ Frontend (Vue.js + Tailwind CSS)

Le frontend se trouve dans le dossier `frontend/` et utilise :
- **Vue.js 3** avec TypeScript
- **Tailwind CSS** pour le styling
- **Vue Router** pour la navigation
- **Pinia** pour la gestion d'état

### Démarrage du frontend
```bash
cd frontend
npm install
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

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

# Assurez-vous que MongoDB est en cours d'exécution
# Puis démarrez le serveur
npm run dev
```

L'API sera accessible sur `http://localhost:3000`

## 📋 Prérequis

- Node.js (version 18 ou supérieure)
- MongoDB (local ou distant)
- Git

## 🛠️ Installation complète

1. **Clonez le projet**
```bash
git clone https://github.com/stephanecoumbassa/schoman.git
cd schoman
```

2. **Configurez la base de données MongoDB**

   Vous avez deux options:

   **Option A: MongoDB Atlas (Cloud - Recommandé)**
   - La configuration est déjà prête avec MongoDB Atlas
   - Le fichier `.env` dans le dossier `backend/` contient la connexion

   **Option B: MongoDB Local**
   - Installez MongoDB localement : [mongodb.com](https://www.mongodb.com/docs/manual/installation/)
   - Ou utilisez Docker: `docker run -d -p 27017:27017 mongo`
   - Modifiez le `.env` pour utiliser: `MONGODB_URI=mongodb://localhost:27017/schoman`

3. **Configurez le backend**
```bash
cd backend
npm install

# Créez le fichier .env en copiant l'exemple
cp .env.example .env

# Modifiez le .env si nécessaire avec vos propres configurations
```

4. **Initialisez la base de données avec des données de test**
```bash
npm run seed
```

5. **Démarrez le backend**
```bash
npm run dev
```

6. **Dans un nouveau terminal, configurez le frontend**
```bash
cd ../frontend
npm install
```

7. **Démarrez le frontend**
```bash
npm run dev
```

8. **Accédez à l'application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## 👤 Comptes de démonstration

Après avoir exécuté `npm run seed` dans le dossier backend, vous aurez accès à ces comptes :

- **Administrateur**
  - Email: `admin@schoman.com`
  - Mot de passe: `admin123`
  - Accès: Toutes les fonctionnalités

- **Enseignant**
  - Email: `teacher@schoman.com`
  - Mot de passe: `teacher123`
  - Accès: Gestion des élèves (lecture/écriture)

- **Élève**
  - Email: `student@schoman.com`
  - Mot de passe: `student123`
  - Accès: Consultation uniquement

## 📁 Structure du projet

```
schoman/
├── frontend/              # Application Vue.js
│   ├── src/
│   │   ├── components/    # Composants réutilisables
│   │   ├── views/         # Pages de l'application
│   │   ├── stores/        # Gestion d'état Pinia
│   │   ├── services/      # Services API
│   │   ├── router/        # Configuration des routes
│   │   └── assets/        # Fichiers statiques
│   ├── package.json
│   └── ...
├── backend/               # API Node.js
│   ├── src/
│   │   ├── models/        # Modèles Mongoose
│   │   ├── controllers/   # Contrôleurs
│   │   ├── routes/        # Routes API
│   │   ├── middleware/    # Middleware (auth, etc.)
│   │   ├── scripts/       # Scripts utilitaires
│   │   └── index.ts       # Point d'entrée
│   ├── package.json
│   ├── .env               # Variables d'environnement
│   └── ...
├── Project.md             # Spécifications complètes
└── README.md
```

## 🔧 Scripts disponibles

### Backend
- `npm run dev` - Mode développement avec nodemon
- `npm run build` - Compilation TypeScript
- `npm start` - Démarrage en production
- `npm run seed` - Initialiser la base de données avec des données de test

### Frontend
- `npm run dev` - Mode développement
- `npm run build` - Build de production
- `npm run preview` - Prévisualisation du build
- `npm run type-check` - Vérification des types TypeScript
- `npm run lint` - Linter le code

## 🌐 Endpoints API

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/profile` - Profil utilisateur (protégé)

### Élèves
- `GET /api/students` - Liste des élèves (avec pagination, recherche, filtres)
- `POST /api/students` - Créer un élève (admin/enseignant)
- `GET /api/students/:id` - Détails d'un élève
- `PUT /api/students/:id` - Modifier un élève (admin/enseignant)
- `DELETE /api/students/:id` - Désactiver un élève (admin)

### Classes
- `GET /api/classes` - Liste des classes (avec pagination, recherche, filtres)
- `POST /api/classes` - Créer une classe (admin/enseignant)
- `GET /api/classes/:id` - Détails d'une classe avec élèves
- `GET /api/classes/:id/statistics` - Statistiques de la classe
- `PUT /api/classes/:id` - Modifier une classe (admin/enseignant)
- `DELETE /api/classes/:id` - Désactiver une classe (admin)

### Notes
- `GET /api/grades` - Liste des notes (avec filtres par élève, classe, matière)
- `POST /api/grades` - Créer une note (admin/enseignant)
- `GET /api/grades/:id` - Détails d'une note
- `GET /api/grades/student/:studentId/summary` - Bulletin de l'élève avec moyennes
- `PUT /api/grades/:id` - Modifier une note (admin/enseignant)
- `DELETE /api/grades/:id` - Supprimer une note (admin/enseignant)

### Présences
- `GET /api/attendance` - Liste des présences (avec filtres)
- `POST /api/attendance` - Enregistrer une présence (admin/enseignant)
- `GET /api/attendance/:id` - Détails d'une présence
- `GET /api/attendance/student/:studentId/stats` - Statistiques de présence d'un élève
- `GET /api/attendance/class/:classId/date` - Présences d'une classe pour une date
- `PUT /api/attendance/:id` - Modifier une présence (admin/enseignant)
- `DELETE /api/attendance/:id` - Supprimer une présence (admin/enseignant)

### Dashboard
- `GET /api/dashboard/stats` - Statistiques du tableau de bord

### Système
- `GET /` - Message de bienvenue
- `GET /health` - État de l'API et de la base de données

## 🔐 Sécurité

- Mots de passe hashés avec bcrypt
- Authentification JWT
- Routes protégées par middleware
- Validation des données d'entrée
- Autorisation basée sur les rôles

## 📝 Licence

ISC

## 👥 Auteur

Projet développé pour la gestion d'école Schoman
