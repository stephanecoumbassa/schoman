# Architecture - Schoman

## 🏗️ Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (Vue.js)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Login   │  │Dashboard │  │ Students │  │ Classes  │   │
│  │   View   │  │   View   │  │   View   │  │   View   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              API Service (api.ts)                   │   │
│  │  - Auth, Students, Classes, Grades, Attendance     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │          State Management (Pinia Store)             │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │ HTTP/REST
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Express.js)                     │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                 API Routes                          │   │
│  │  /api/auth  /api/students  /api/classes           │   │
│  │  /api/grades  /api/attendance  /api/dashboard     │   │
│  └─────────────────────────────────────────────────────┘   │
│                            │                               │
│                            ▼                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Middleware Layer                       │   │
│  │  - Authentication (JWT)                            │   │
│  │  - Authorization (Role-based)                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                            │                               │
│                            ▼                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                Controllers                          │   │
│  │  authController, studentController, classController│   │
│  │  gradeController, attendanceController             │   │
│  └─────────────────────────────────────────────────────┘   │
│                            │                               │
│                            ▼                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │             Models (Mongoose)                       │   │
│  │  User, Student, Class, Grade, Attendance           │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │ MongoDB Driver
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                 DATABASE (MongoDB Atlas)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  users   │  │ students │  │ classes  │  │  grades  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│  ┌──────────┐                                             │
│  │attendance│                                             │
│  └──────────┘                                             │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Structure des Dossiers

```
schoman/
├── frontend/
│   ├── src/
│   │   ├── views/          # Pages de l'application
│   │   │   ├── LoginView.vue
│   │   │   ├── DashboardView.vue
│   │   │   ├── StudentsView.vue
│   │   │   └── ClassesView.vue
│   │   ├── components/     # Composants réutilisables
│   │   ├── services/       # API client
│   │   │   └── api.ts
│   │   ├── stores/         # State management
│   │   │   └── auth.ts
│   │   └── router/         # Navigation
│   │       └── index.ts
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── models/         # Schémas MongoDB
│   │   │   ├── User.ts
│   │   │   ├── Student.ts
│   │   │   ├── Class.ts
│   │   │   ├── Grade.ts
│   │   │   └── Attendance.ts
│   │   ├── controllers/    # Logique métier
│   │   │   ├── authController.ts
│   │   │   ├── studentController.ts
│   │   │   ├── classController.ts
│   │   │   ├── gradeController.ts
│   │   │   └── attendanceController.ts
│   │   ├── routes/         # Définitions des routes
│   │   │   ├── authRoutes.ts
│   │   │   ├── studentRoutes.ts
│   │   │   ├── classRoutes.ts
│   │   │   ├── gradeRoutes.ts
│   │   │   └── attendanceRoutes.ts
│   │   ├── middleware/     # Middleware Express
│   │   │   └── auth.ts
│   │   └── index.ts        # Point d'entrée
│   ├── .env                # Configuration (MongoDB, JWT)
│   └── package.json
│
└── Documentation/
    ├── README.md           # Guide principal
    ├── SUMMARY.md          # Résumé des fonctionnalités
    ├── USAGE.md            # Guide d'utilisation
    ├── IMPLEMENTATION.md   # Détails techniques
    ├── ARCHITECTURE.md     # Ce fichier
    └── CHANGELOG.md        # Historique des versions
```

## 🔄 Flux de Données

### Authentification
```
User (Browser) → Login Form
    ↓
Frontend (Vue) → POST /api/auth/login
    ↓
Backend (Express) → authController.login()
    ↓
MongoDB → Verify credentials
    ↓
Backend → Generate JWT token
    ↓
Frontend ← Store token in localStorage
    ↓
User ← Redirect to Dashboard
```

### Opération CRUD (Exemple: Créer un élève)
```
User → Click "Créer un élève"
    ↓
Frontend → POST /api/students (with JWT token)
    ↓
Backend → authenticate middleware (verify token)
    ↓
Backend → authorize middleware (check role)
    ↓
Backend → studentController.createStudent()
    ↓
MongoDB → Insert new student document
    ↓
Backend ← Return created student
    ↓
Frontend ← Update UI
    ↓
User ← See new student in list
```

## 🔐 Sécurité

### Niveaux de Protection

1. **Frontend**
   - Router guards (redirect si non authentifié)
   - UI conditionnelle basée sur le rôle

2. **Backend - Middleware**
   - `authenticate`: Vérifie le token JWT
   - `authorize`: Vérifie les permissions par rôle

3. **Database**
   - Validation des schémas Mongoose
   - Indexes pour les performances
   - Champs obligatoires et types stricts

### Rôles et Permissions

| Rôle     | Auth | Students | Classes | Grades | Attendance |
|----------|------|----------|---------|--------|------------|
| Admin    | ✅   | CRUD     | CRUD    | CRUD   | CRUD       |
| Teacher  | ✅   | CR+U     | CR+U    | CRUD   | CRUD       |
| Student  | ✅   | Read     | Read    | Read   | Read       |
| Parent   | ✅   | Read     | Read    | Read   | Read       |

## 🚀 Performance

### Optimisations Implémentées

1. **Backend**
   - Pagination côté serveur (limit/skip)
   - Indexes MongoDB sur les champs fréquemment recherchés
   - Population sélective des références
   - Queries optimisées avec projections

2. **Frontend**
   - Lazy loading des routes
   - Debouncing sur les recherches
   - Cache des données statiques
   - Build optimisé avec Vite

3. **Database**
   - Indexes composites sur (student, date), (class, date)
   - Schémas optimisés avec seulement les champs nécessaires

## 🔌 API Endpoints Summary

### Authentification (3 endpoints)
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/profile

### Élèves (5 endpoints)
- GET /api/students
- POST /api/students
- GET /api/students/:id
- PUT /api/students/:id
- DELETE /api/students/:id

### Classes (6 endpoints)
- GET /api/classes
- POST /api/classes
- GET /api/classes/:id
- GET /api/classes/:id/statistics
- PUT /api/classes/:id
- DELETE /api/classes/:id

### Notes (6 endpoints)
- GET /api/grades
- POST /api/grades
- GET /api/grades/:id
- GET /api/grades/student/:studentId/summary
- PUT /api/grades/:id
- DELETE /api/grades/:id

### Présences (7 endpoints)
- GET /api/attendance
- POST /api/attendance
- GET /api/attendance/:id
- GET /api/attendance/student/:studentId/stats
- GET /api/attendance/class/:classId/date
- PUT /api/attendance/:id
- DELETE /api/attendance/:id

### Dashboard & Système (3 endpoints)
- GET /api/dashboard/stats
- GET /
- GET /health

**Total: 30+ endpoints**

## 🛠️ Technologies

### Frontend
- **Vue.js 3**: Framework progressif
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first CSS
- **Pinia**: State management
- **Vue Router**: Navigation
- **Vite**: Build tool

### Backend
- **Node.js**: Runtime JavaScript
- **Express.js**: Framework web
- **TypeScript**: Type safety
- **Mongoose**: ODM MongoDB
- **JWT**: Authentification
- **bcryptjs**: Hachage mots de passe

### Database
- **MongoDB Atlas**: Cloud database
- **Collections**: 5 (users, students, classes, grades, attendance)
- **Indexes**: Optimisation des queries

### DevOps
- **npm**: Package manager
- **nodemon**: Auto-reload backend
- **ESLint**: Linting
- **Git**: Version control
