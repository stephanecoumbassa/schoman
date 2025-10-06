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
- ✅ Module bibliothèque (livres et emprunts)
- ✅ Module facturation (factures, paiements, statistiques)
- ✅ **Module événements (réunions, célébrations, sorties)** 🆕
- ✅ **Module dépenses (catégories, approbation, paiements)** 🆕
- ✅ Tableau de bord avec statistiques
- ✅ Recherche et filtrage avancés
- ✅ Pagination des résultats

### Frontend (Interface Web)
- ✅ Page de connexion sécurisée
- ✅ Tableau de bord avec statistiques en temps réel
- ✅ Interface de gestion des élèves
- ✅ Interface de gestion des classes
- ✅ Interface de gestion des notes
- ✅ Interface de gestion des présences
- ✅ Interface de gestion de la bibliothèque
- ✅ Interface de gestion des factures
- ✅ **Interface de gestion des événements** 🆕
- ✅ **Interface de gestion des dépenses** 🆕
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
- Docker et Docker Compose (optionnel, pour le déploiement conteneurisé)

## 🛠️ Installation complète

### 🐳 Déploiement Docker (Le plus simple)

Le moyen le plus rapide pour démarrer l'application complète :

```bash
# Cloner le projet
git clone https://github.com/stephanecoumbassa/schoman.git
cd schoman

# Démarrer tous les services (MongoDB, Backend, Frontend)
docker-compose up -d

# Initialiser la base de données
docker-compose exec backend npm run seed

# Accéder à l'application sur http://localhost:5173
```

Pour plus d'informations sur le déploiement, consultez [DEPLOYMENT.md](./DEPLOYMENT.md).

### ⚡ Installation Automatique (Recommandé pour développement)

Utilisez le script d'installation automatique qui configure tout pour vous :

```bash
./setup.sh
```

Ce script installe automatiquement :
- ✓ Toutes les dépendances backend et frontend
- ✓ Crée les fichiers de configuration nécessaires
- ✓ Vérifie que le code compile sans erreur

### ⚡ Vérification de l'Installation

Après l'installation, vérifiez que votre environnement est prêt :

```bash
./verify-setup.sh
```

Ce script vérifie automatiquement :
- ✓ Node.js et npm sont installés
- ✓ Les dépendances sont installées
- ✓ Les fichiers de configuration existent
- ✓ Le code compile sans erreur

### 📝 Installation Pas à Pas

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

### Bibliothèque
- `GET /api/books` - Liste des livres (avec pagination, recherche, filtres)
- `POST /api/books` - Créer un livre (admin/enseignant)
- `GET /api/books/:id` - Détails d'un livre
- `PUT /api/books/:id` - Modifier un livre (admin/enseignant)
- `DELETE /api/books/:id` - Supprimer un livre (admin)
- `GET /api/books/stats` - Statistiques des livres

### Emprunts
- `GET /api/loans` - Liste des emprunts (avec filtres)
- `POST /api/loans` - Créer un emprunt (admin/enseignant)
- `GET /api/loans/:id` - Détails d'un emprunt
- `PUT /api/loans/:id/return` - Retourner un livre (admin/enseignant)
- `DELETE /api/loans/:id` - Supprimer un emprunt (admin)

### Factures
- `GET /api/invoices` - Liste des factures (avec pagination, recherche, filtres)
- `POST /api/invoices` - Créer une facture (admin/enseignant)
- `GET /api/invoices/:id` - Détails d'une facture
- `PUT /api/invoices/:id` - Modifier une facture (admin/enseignant)
- `POST /api/invoices/:id/payment` - Enregistrer un paiement (admin/enseignant)
- `DELETE /api/invoices/:id` - Supprimer une facture (admin)
- `GET /api/invoices/stats` - Statistiques financières

### Événements 🆕
- `GET /api/events` - Liste des événements (avec pagination, recherche, filtres)
- `POST /api/events` - Créer un événement (admin/enseignant)
- `GET /api/events/:id` - Détails d'un événement
- `PUT /api/events/:id` - Modifier un événement (admin/enseignant)
- `DELETE /api/events/:id` - Supprimer un événement (admin)
- `GET /api/events/stats` - Statistiques des événements

### Dépenses 🆕
- `GET /api/expenses` - Liste des dépenses (avec pagination, recherche, filtres) (admin/enseignant)
- `POST /api/expenses` - Créer une dépense (admin/enseignant)
- `GET /api/expenses/:id` - Détails d'une dépense (admin/enseignant)
- `PUT /api/expenses/:id` - Modifier une dépense (admin/enseignant)
- `POST /api/expenses/:id/approve` - Approuver une dépense (admin)
- `POST /api/expenses/:id/payment` - Enregistrer un paiement (admin)
- `DELETE /api/expenses/:id` - Supprimer une dépense (admin)
- `GET /api/expenses/stats` - Statistiques des dépenses (admin/enseignant)

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

## 🔄 CI/CD et Qualité du Code

Le projet inclut une pipeline CI/CD automatisée avec GitHub Actions qui :
- ✅ Vérifie la compilation TypeScript du backend et frontend
- ✅ Exécute les tests automatisés
- ✅ Construit les images Docker
- ✅ Teste l'intégration avec MongoDB

Voir [.github/workflows/ci.yml](.github/workflows/ci.yml) pour plus de détails.

## 📚 Documentation

- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Guide d'installation détaillé
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Guide de déploiement en production
- [IMPLEMENTATION.md](./IMPLEMENTATION.md) - Documentation technique de l'architecture
- [USAGE.md](./USAGE.md) - Guide d'utilisation de l'application

## 📝 Licence

ISC

## 👥 Auteur

Projet développé pour la gestion d'école Schoman
