# Documentation de l'implémentation - Schoman

Ce document décrit l'architecture et l'implémentation complète de l'application Schoman.

## 🎯 Vue d'ensemble

Schoman est une application full-stack de gestion d'école comprenant :
- Un backend REST API (Node.js + Express + MongoDB)
- Un frontend web responsive (Vue.js 3 + TypeScript + Tailwind CSS)
- Un système d'authentification JWT avec gestion des rôles
- Des modules de gestion des élèves, classes, et utilisateurs

## 🏗️ Architecture

### Stack Technique

**Backend:**
- Runtime: Node.js avec TypeScript
- Framework: Express.js
- Base de données: MongoDB avec Mongoose ODM
- Authentification: JWT (JSON Web Tokens)
- Hashing: bcryptjs
- Validation: express-validator

**Frontend:**
- Framework: Vue.js 3 avec Composition API
- Langage: TypeScript
- Styling: Tailwind CSS v4
- Routing: Vue Router
- State Management: Pinia
- Build Tool: Vite

### Architecture Backend

```
backend/
├── src/
│   ├── models/              # Modèles Mongoose
│   │   ├── User.ts          # Utilisateurs (admin, teacher, student, parent)
│   │   ├── Student.ts       # Profils d'élèves
│   │   └── Class.ts         # Classes/Groupes
│   ├── controllers/         # Logique métier
│   │   ├── authController.ts      # Authentification
│   │   ├── studentController.ts   # Gestion des élèves
│   │   └── dashboardController.ts # Statistiques
│   ├── routes/             # Définition des routes
│   │   ├── authRoutes.ts
│   │   ├── studentRoutes.ts
│   │   └── dashboardRoutes.ts
│   ├── middleware/         # Middleware Express
│   │   └── auth.ts        # Authentification et autorisation
│   ├── scripts/           # Scripts utilitaires
│   │   └── seed.ts        # Données de démonstration
│   └── index.ts           # Point d'entrée
├── package.json
├── tsconfig.json
└── .env                   # Configuration (non versionné)
```

### Architecture Frontend

```
frontend/
├── src/
│   ├── views/              # Pages de l'application
│   │   ├── LoginView.vue         # Page de connexion
│   │   ├── DashboardView.vue     # Tableau de bord
│   │   └── StudentsView.vue      # Gestion des élèves
│   ├── stores/             # Stores Pinia
│   │   ├── auth.ts              # Authentification
│   │   └── counter.ts           # (Exemple par défaut)
│   ├── services/           # Services API
│   │   └── api.ts              # Client API REST
│   ├── router/            # Configuration des routes
│   │   └── index.ts
│   ├── components/        # Composants réutilisables
│   ├── assets/           # Ressources statiques
│   │   └── main.css      # Styles globaux
│   ├── App.vue           # Composant racine
│   └── main.ts           # Point d'entrée
├── package.json
├── tailwind.config.js
└── .env                  # Configuration (non versionné)
```

## 🔐 Système d'authentification

### Modèle User

```typescript
interface IUser {
  email: string;              // Email unique
  password: string;           // Hash bcrypt
  firstName: string;
  lastName: string;
  role: 'admin' | 'teacher' | 'student' | 'parent';
  phone?: string;
  address?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Flux d'authentification

1. **Inscription/Connexion:**
   - L'utilisateur soumet email + password
   - Le serveur vérifie les credentials
   - Un token JWT est généré avec les informations de l'utilisateur
   - Le token est retourné au client

2. **Authentification des requêtes:**
   - Le client envoie le token dans l'header `Authorization: Bearer <token>`
   - Le middleware `authenticate` vérifie le token
   - Les informations utilisateur sont attachées à `req.user`

3. **Autorisation:**
   - Le middleware `authorize` vérifie le rôle de l'utilisateur
   - Seuls les rôles autorisés peuvent accéder à certaines routes

### Rôles et permissions

| Rôle | Dashboard | Voir élèves | Créer/Modifier élèves | Supprimer élèves |
|------|-----------|-------------|----------------------|------------------|
| admin | ✅ | ✅ | ✅ | ✅ |
| teacher | ✅ | ✅ | ✅ | ❌ |
| student | ✅ | ✅ | ❌ | ❌ |
| parent | ✅ | ✅ | ❌ | ❌ |

## 📊 Modèle de données

### Student Model

```typescript
interface IStudent {
  userId: ObjectId;              // Référence vers User
  studentNumber: string;         // Numéro unique
  dateOfBirth: Date;
  placeOfBirth: string;
  gender: 'M' | 'F';
  class?: ObjectId;              // Référence vers Class
  level?: string;                // Niveau scolaire
  enrollmentDate: Date;
  parentContact: {
    name: string;
    phone: string;
    email?: string;
    relationship: string;
  };
  emergencyContact: {
    name: string;
    phone: string;
  };
  medicalInfo?: string;
  notes?: string;
  isActive: boolean;
}
```

### Class Model

```typescript
interface IClass {
  name: string;                  // Nom de la classe (ex: CE1-A)
  level: string;                 // Niveau (ex: CE1)
  academicYear: string;          // Année scolaire (ex: 2024-2025)
  maxCapacity: number;           // Capacité maximale
  currentEnrollment: number;     // Nombre d'élèves actuels
  mainTeacher?: ObjectId;        // Enseignant principal
  schedule?: string;             // Emploi du temps
  room?: string;                 // Salle
  isActive: boolean;
}
```

## 🔌 API REST

### Endpoints d'authentification

#### POST /api/auth/register
Crée un nouveau compte utilisateur.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "student"
}
```

**Response:**
```json
{
  "message": "Utilisateur créé avec succès",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "...",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "student"
  }
}
```

#### POST /api/auth/login
Authentifie un utilisateur.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### GET /api/auth/profile
Récupère le profil de l'utilisateur connecté (protégé).

### Endpoints élèves

#### GET /api/students
Liste les élèves avec pagination et filtres.

**Query parameters:**
- `page` (number): Numéro de page (défaut: 1)
- `limit` (number): Résultats par page (défaut: 10, max: 100)
- `search` (string): Recherche dans nom/email
- `level` (string): Filtrer par niveau
- `isActive` (boolean): Filtrer par statut

**Response:**
```json
{
  "students": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

#### POST /api/students
Crée un nouvel élève (admin/teacher uniquement).

#### GET /api/students/:id
Récupère les détails d'un élève.

#### PUT /api/students/:id
Met à jour un élève (admin/teacher uniquement).

#### DELETE /api/students/:id
Désactive un élève (admin uniquement).

### Endpoints dashboard

#### GET /api/dashboard/stats
Récupère les statistiques du tableau de bord.

**Response:**
```json
{
  "stats": {
    "totalUsers": 25,
    "totalStudents": 20,
    "totalTeachers": 3,
    "totalParents": 10,
    "activeStudents": 18,
    "totalClasses": 5
  },
  "recentStudents": [...],
  "enrollmentByLevel": [...]
}
```

## 🎨 Interface Frontend

### Pages principales

#### LoginView
- Formulaire de connexion
- Validation des champs
- Affichage des erreurs
- Comptes de démonstration visibles

#### DashboardView
- Cartes de statistiques
- Tableau des élèves récents
- Liens rapides vers les modules
- Bouton de déconnexion

#### StudentsView
- Tableau paginé des élèves
- Barre de recherche en temps réel
- Filtres par niveau et statut
- Actions contextuelles selon le rôle

### Store d'authentification (Pinia)

```typescript
const authStore = useAuthStore()

// État
authStore.token          // Token JWT
authStore.user           // Utilisateur connecté
authStore.isAuthenticated // Statut de connexion
authStore.userRole       // Rôle de l'utilisateur

// Actions
await authStore.login(email, password)
await authStore.register(userData)
await authStore.fetchProfile()
authStore.logout()
```

### Navigation Guards

Les routes protégées nécessitent une authentification :
```typescript
{
  path: '/dashboard',
  component: DashboardView,
  meta: { requiresAuth: true }
}
```

## 🌱 Script de seed

Le script `backend/src/scripts/seed.ts` initialise la base de données avec :
- 1 administrateur
- 1 enseignant
- 5 élèves
- 2 classes

**Utilisation:**
```bash
cd backend
npm run seed
```

## 🔒 Sécurité

### Mesures implémentées

1. **Authentification:**
   - Passwords hashés avec bcrypt (10 rounds)
   - Tokens JWT avec expiration (7 jours)
   - Validation des credentials

2. **Autorisation:**
   - Middleware de vérification des rôles
   - Routes protégées selon les permissions
   - Soft delete (désactivation vs suppression)

3. **Validation:**
   - Validation des données côté serveur
   - Vérification des types TypeScript
   - Sanitisation des entrées

4. **Bonnes pratiques:**
   - Variables d'environnement pour les secrets
   - .env non versionné
   - CORS configuré
   - Headers de sécurité

## 📦 Déploiement

### Variables d'environnement requises

**Backend (.env):**
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/schoman
JWT_SECRET=votre_secret_jwt_securise
NODE_ENV=production
```

**Frontend (.env):**
```
VITE_API_URL=https://api.votre-domaine.com/api
```

### Build de production

**Backend:**
```bash
npm run build
npm start
```

**Frontend:**
```bash
npm run build
# Les fichiers sont dans dist/
```

## 🚀 Évolutions futures

D'après le fichier `Project.md`, les modules suivants peuvent être ajoutés :

### À court terme
- ✅ Module Scolarité (partiellement implémenté)
- 📋 Gestion des notes et bulletins
- 📅 Emploi du temps
- 📊 Absences et retards

### À moyen terme
- 💰 Module Comptabilité
- 🧾 Module Facturation
- 📉 Module Dépenses
- 📚 Module Bibliothèque

### À long terme
- 📆 Module Événements
- 📬 Module Communication (messagerie)
- 🏫 Support multi-établissements
- 📱 Application mobile
- 📄 Export PDF/Excel
- 🌍 Multilingue

## 📝 Notes techniques

### Choix d'architecture

1. **Séparation Backend/Frontend:**
   - Permet le déploiement indépendant
   - Facilite la maintenance
   - Possibilité d'ajouter d'autres clients (mobile)

2. **TypeScript:**
   - Type safety
   - Meilleure documentation
   - Refactoring facilité
   - Autocomplétion IDE

3. **MongoDB:**
   - Flexible pour les évolutions
   - Bon pour les données hiérarchiques
   - Scaling horizontal

4. **Vue.js 3:**
   - Performance optimale
   - Composition API moderne
   - Écosystème riche
   - Courbe d'apprentissage douce

### Limitations actuelles

1. Pas de gestion des images/avatars
2. Pas de notifications en temps réel
3. Pas de gestion des pièces jointes
4. Interface d'ajout d'élève simplifiée
5. Pas de tests automatisés

## 📚 Références

- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Vue.js 3 Documentation](https://vuejs.org/)
- [MongoDB Schema Design](https://www.mongodb.com/developer/products/mongodb/schema-design-anti-pattern-summary/)
- [JWT Best Practices](https://jwt.io/introduction)
- [Tailwind CSS](https://tailwindcss.com/docs)
