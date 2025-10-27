# 📱 Schoman Frontend - Documentation Complète

Application Vue.js 3 avec TypeScript pour la gestion scolaire Schoman.

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Stack Technique](#stack-technique)
4. [Installation et Démarrage](#installation-et-démarrage)
5. [Structure du Projet](#structure-du-projet)
6. [Composants Principaux](#composants-principaux)
7. [Gestion d'État (Pinia)](#gestion-détat-pinia)
8. [Routing et Navigation](#routing-et-navigation)
9. [Services API](#services-api)
10. [Formulaires et Validation](#formulaires-et-validation)
11. [Internationalisation (i18n)](#internationalisation-i18n)
12. [PWA et Mode Hors-ligne](#pwa-et-mode-hors-ligne)
13. [Styles et Theming](#styles-et-theming)
14. [Tests](#tests)
15. [Build et Déploiement](#build-et-déploiement)
16. [Bonnes Pratiques](#bonnes-pratiques)
17. [Troubleshooting](#troubleshooting)

## 🎯 Vue d'ensemble

Le frontend Schoman est une application web moderne construite avec Vue.js 3 utilisant la Composition API, TypeScript pour la sécurité des types, et Tailwind CSS pour le styling. L'application offre une interface utilisateur intuitive pour la gestion complète d'une école.

### Fonctionnalités Principales

- ✅ **Authentification sécurisée** : Login, logout, gestion des sessions JWT
- ✅ **Dashboard interactif** : Statistiques en temps réel avec graphiques
- ✅ **Gestion des utilisateurs** : Admins, enseignants, parents, élèves
- ✅ **Gestion des élèves** : CRUD complet avec recherche et filtres
- ✅ **Gestion des classes** : Organisation par niveaux et années scolaires
- ✅ **Notes et bulletins** : Saisie, calcul de moyennes, visualisation
- ✅ **Suivi des présences** : Enregistrement quotidien, statistiques
- ✅ **Bibliothèque** : Gestion des livres et emprunts
- ✅ **Facturation** : Création factures, suivi paiements
- ✅ **Événements** : Gestion des événements scolaires
- ✅ **Dépenses** : Suivi et approbation des dépenses
- ✅ **Messagerie** : Communication interne entre utilisateurs
- ✅ **Comptabilité** : Transactions, budgets, rapports financiers
- ✅ **Notifications temps réel** : Via WebSockets
- ✅ **Mode hors-ligne** : PWA avec cache intelligent
- ✅ **Multilingue** : Support FR/EN

## 🏗️ Architecture

### Architecture Globale

```
┌─────────────────────────────────────────────────────────┐
│                    Vue.js Application                    │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐│
│  │  Views   │  │Components│  │  Stores  │  │Services ││
│  │ (Pages)  │◄─┤  (UI)    │◄─┤  (State) │◄─┤  (API)  ││
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘│
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Vue Router (Navigation)              │   │
│  └──────────────────────────────────────────────────┘   │
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Pinia (State Management)             │   │
│  └──────────────────────────────────────────────────┘   │
│                                                           │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │  REST API    │
                    │  (Backend)   │
                    └──────────────┘
```

### Pattern de Communication

```
User Interaction
      ↓
View Component
      ↓
Store Action (Pinia)
      ↓
API Service
      ↓
HTTP Request (Axios)
      ↓
Backend API
      ↓
Response
      ↓
Store State Update
      ↓
Reactive UI Update
```

## 🔧 Stack Technique

### Core Technologies

- **Vue.js 3.5+** - Framework progressif JavaScript
  - Composition API (script setup)
  - Reactivity System
  - Virtual DOM
- **TypeScript 5.9+** - Typage statique
- **Vite 7.1+** - Build tool ultra-rapide
- **Vue Router 4.5+** - Routing officiel Vue
- **Pinia 3.0+** - State management officiel

### UI & Styling

- **Tailwind CSS 4.1+** - Utility-first CSS framework
- **Shadcn-vue 2.2+** - Composants UI réutilisables
- **Radix-vue 1.9+** - Composants accessibles headless
- **Lucide Vue Next** - Icons modernes
- **Chart.js 4.5+** - Graphiques et visualisations

### Formulaires & Validation

- **Vee-Validate 4.15+** - Validation de formulaires
- **Zod 4.1+** - Schema validation TypeScript-first

### Communication & Temps Réel

- **Axios 1.12+** - HTTP client
- **Socket.io-client 4.8+** - WebSockets temps réel

### PWA & Offline

- **Vite PWA Plugin 1.0+** - Progressive Web App
- **Workbox** - Service worker et caching

### Internationalisation

- **Vue I18n 11.1+** - Multi-langue

### Testing

- **Vitest 3.2+** - Test runner rapide
- **Vue Test Utils 2.4+** - Utilitaires de test Vue
- **Happy DOM 20.0+** - DOM virtuel pour tests

### Dev Tools

- **ESLint 9.33+** - Linting JavaScript/TypeScript
- **Prettier 3.6+** - Code formatting
- **TypeScript Vue Plugin** - Support TypeScript dans .vue
- **Vue DevTools** - Debug Vue applications

## 🚀 Installation et Démarrage

### Prérequis

- Node.js >= 20.19.0 ou >= 22.12.0
- npm >= 10.0.0
- Backend Schoman en cours d'exécution

### Installation

```bash
# Cloner le repository (si pas déjà fait)
git clone https://github.com/stephanecoumbassa/schoman.git
cd schoman/frontend

# Installer les dépendances
npm install

# Créer le fichier .env
cp .env.example .env

# Éditer .env avec vos configurations
nano .env
```

### Configuration (.env)

```env
# API Backend URL
VITE_API_URL=http://localhost:3000/api

# WebSocket URL (optionnel, défaut: même que API)
VITE_WS_URL=http://localhost:3000

# Environnement
VITE_ENV=development

# Options PWA
VITE_PWA_ENABLED=true
```

### Commandes de Développement

```bash
# Démarrer le serveur de développement
npm run dev
# Accès: http://localhost:5173

# Build pour production
npm run build

# Preview du build de production
npm run preview

# Vérification des types TypeScript
npm run type-check

# Linting et auto-fix
npm run lint

# Formatage du code
npm run format

# Tests unitaires
npm run test

# Tests en mode watch
npm run test:watch

# Tests avec UI
npm run test:ui

# Couverture des tests
npm run test:coverage
```

## 📁 Structure du Projet

```
frontend/
├── public/                      # Assets statiques
│   ├── manifest.json           # PWA manifest
│   ├── icons/                  # Icônes PWA
│   └── screenshots/            # Screenshots pour PWA
│
├── src/
│   ├── assets/                 # Assets (images, fonts, etc.)
│   │   ├── images/
│   │   ├── fonts/
│   │   └── styles/
│   │       └── main.css        # Styles globaux
│   │
│   ├── components/             # Composants réutilisables
│   │   ├── ui/                # Composants UI de base (shadcn)
│   │   │   ├── button/
│   │   │   ├── card/
│   │   │   ├── dialog/
│   │   │   ├── form/
│   │   │   ├── input/
│   │   │   ├── select/
│   │   │   ├── table/
│   │   │   └── ...
│   │   │
│   │   ├── layout/            # Composants de layout
│   │   │   ├── Header.vue
│   │   │   ├── Sidebar.vue
│   │   │   ├── Footer.vue
│   │   │   └── MainLayout.vue
│   │   │
│   │   ├── common/            # Composants communs métier
│   │   │   ├── DataTable.vue
│   │   │   ├── SearchBar.vue
│   │   │   ├── Pagination.vue
│   │   │   ├── StatCard.vue
│   │   │   └── ...
│   │   │
│   │   └── features/          # Composants par fonctionnalité
│   │       ├── students/
│   │       ├── classes/
│   │       ├── grades/
│   │       └── ...
│   │
│   ├── views/                 # Pages/Vues
│   │   ├── auth/
│   │   │   ├── LoginView.vue
│   │   │   └── RegisterView.vue
│   │   │
│   │   ├── dashboard/
│   │   │   └── DashboardView.vue
│   │   │
│   │   ├── students/
│   │   │   ├── StudentListView.vue
│   │   │   ├── StudentDetailView.vue
│   │   │   └── StudentFormView.vue
│   │   │
│   │   ├── classes/
│   │   ├── grades/
│   │   ├── attendance/
│   │   ├── library/
│   │   ├── invoices/
│   │   ├── events/
│   │   ├── expenses/
│   │   ├── messages/
│   │   ├── accounting/
│   │   └── ...
│   │
│   ├── stores/                # Stores Pinia (état global)
│   │   ├── auth.ts           # Authentification
│   │   ├── students.ts       # Élèves
│   │   ├── classes.ts        # Classes
│   │   ├── grades.ts         # Notes
│   │   ├── attendance.ts     # Présences
│   │   ├── library.ts        # Bibliothèque
│   │   ├── invoices.ts       # Factures
│   │   ├── messages.ts       # Messages
│   │   ├── notifications.ts  # Notifications
│   │   └── ...
│   │
│   ├── services/              # Services API
│   │   ├── api.ts            # Configuration Axios
│   │   ├── auth.service.ts
│   │   ├── students.service.ts
│   │   ├── classes.service.ts
│   │   └── ...
│   │
│   ├── router/                # Configuration Vue Router
│   │   ├── index.ts          # Routes principales
│   │   └── guards.ts         # Navigation guards
│   │
│   ├── composables/           # Composables réutilisables
│   │   ├── useAuth.ts
│   │   ├── useApi.ts
│   │   ├── useNotification.ts
│   │   ├── usePagination.ts
│   │   └── ...
│   │
│   ├── types/                 # Types TypeScript
│   │   ├── index.ts
│   │   ├── auth.ts
│   │   ├── student.ts
│   │   ├── class.ts
│   │   └── ...
│   │
│   ├── utils/                 # Utilitaires
│   │   ├── format.ts         # Formatage dates, nombres
│   │   ├── validation.ts     # Validations
│   │   ├── constants.ts      # Constantes
│   │   └── helpers.ts        # Fonctions helper
│   │
│   ├── locales/              # Traductions i18n
│   │   ├── fr.json
│   │   └── en.json
│   │
│   ├── App.vue               # Composant racine
│   ├── main.ts               # Point d'entrée
│   └── sw.ts                 # Service Worker (PWA)
│
├── .env.example               # Exemple de config
├── .env                       # Config locale (gitignored)
├── .eslintrc.js              # Config ESLint
├── .prettierrc.json          # Config Prettier
├── index.html                # HTML template
├── package.json              # Dépendances npm
├── postcss.config.js         # Config PostCSS
├── tailwind.config.js        # Config Tailwind
├── tsconfig.json             # Config TypeScript
├── vite.config.ts            # Config Vite
└── README.md                 # Documentation
```

## 🧩 Composants Principaux

### Layout Components

#### MainLayout.vue
Composant de layout principal avec header, sidebar et contenu.

```vue
<template>
  <div class="min-h-screen bg-gray-50">
    <Header />
    <div class="flex">
      <Sidebar />
      <main class="flex-1 p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>
```

#### Header.vue
En-tête avec navigation, notifications et profil utilisateur.

```vue
<template>
  <header class="bg-white shadow-sm">
    <div class="flex items-center justify-between px-6 py-4">
      <Logo />
      <nav><!-- Navigation --></nav>
      <UserMenu />
    </div>
  </header>
</template>
```

#### Sidebar.vue
Menu latéral avec navigation principale.

```vue
<template>
  <aside class="w-64 bg-white shadow-sm">
    <nav class="p-4">
      <router-link
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center gap-2 p-2 hover:bg-gray-100"
      >
        <component :is="item.icon" />
        {{ item.label }}
      </router-link>
    </nav>
  </aside>
</template>
```

### Common Components

#### DataTable.vue
Table de données réutilisable avec tri, filtrage et pagination.

```vue
<template>
  <div class="overflow-x-auto">
    <table class="min-w-full divide-y divide-gray-200">
      <thead>
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            @click="sort(column.key)"
            class="cursor-pointer"
          >
            {{ column.label }}
            <SortIcon v-if="column.sortable" />
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in data" :key="row.id">
          <td v-for="column in columns" :key="column.key">
            <slot :name="`cell-${column.key}`" :row="row">
              {{ row[column.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
    <Pagination
      :current-page="currentPage"
      :total-pages="totalPages"
      @page-change="$emit('page-change', $event)"
    />
  </div>
</template>

<script setup lang="ts">
interface Column {
  key: string;
  label: string;
  sortable?: boolean;
}

interface Props {
  columns: Column[];
  data: any[];
  currentPage: number;
  totalPages: number;
}

defineProps<Props>();
defineEmits<{
  'page-change': [page: number];
  'sort': [key: string];
}>();
</script>
```

#### StatCard.vue
Carte de statistique pour le dashboard.

```vue
<template>
  <div class="bg-white rounded-lg shadow p-6">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm text-gray-600">{{ title }}</p>
        <p class="text-2xl font-bold text-gray-900">{{ value }}</p>
        <p v-if="change" :class="changeClass">
          {{ change }}
        </p>
      </div>
      <div :class="iconClass">
        <component :is="icon" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Component } from 'vue';

interface Props {
  title: string;
  value: string | number;
  icon: Component;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
}

const props = defineProps<Props>();

const changeClass = computed(() => {
  if (props.trend === 'up') return 'text-green-600';
  if (props.trend === 'down') return 'text-red-600';
  return 'text-gray-600';
});

const iconClass = computed(() => {
  return 'p-3 rounded-full bg-blue-100 text-blue-600';
});
</script>
```

## 🏪 Gestion d'État (Pinia)

### Structure d'un Store

```typescript
// stores/students.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Student } from '@/types';
import { studentsService } from '@/services/students.service';

export const useStudentsStore = defineStore('students', () => {
  // State
  const students = ref<Student[]>([]);
  const currentStudent = ref<Student | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  
  // Getters (computed)
  const activeStudents = computed(() => 
    students.value.filter(s => s.isActive)
  );
  
  const studentsCount = computed(() => students.value.length);
  
  // Actions
  async function fetchStudents(params?: any) {
    loading.value = true;
    error.value = null;
    try {
      const response = await studentsService.getAll(params);
      students.value = response.data.students;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }
  
  async function fetchStudent(id: string) {
    loading.value = true;
    try {
      const response = await studentsService.getById(id);
      currentStudent.value = response.data;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }
  
  async function createStudent(data: Partial<Student>) {
    loading.value = true;
    try {
      const response = await studentsService.create(data);
      students.value.push(response.data);
      return response.data;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }
  
  async function updateStudent(id: string, data: Partial<Student>) {
    loading.value = true;
    try {
      const response = await studentsService.update(id, data);
      const index = students.value.findIndex(s => s._id === id);
      if (index !== -1) {
        students.value[index] = response.data;
      }
      return response.data;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }
  
  async function deleteStudent(id: string) {
    loading.value = true;
    try {
      await studentsService.delete(id);
      students.value = students.value.filter(s => s._id !== id);
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }
  
  return {
    // State
    students,
    currentStudent,
    loading,
    error,
    // Getters
    activeStudents,
    studentsCount,
    // Actions
    fetchStudents,
    fetchStudent,
    createStudent,
    updateStudent,
    deleteStudent,
  };
});
```

### Utilisation dans un Composant

```vue
<script setup lang="ts">
import { onMounted } from 'vue';
import { useStudentsStore } from '@/stores/students';

const studentsStore = useStudentsStore();

onMounted(async () => {
  await studentsStore.fetchStudents();
});

async function handleDelete(id: string) {
  if (confirm('Êtes-vous sûr ?')) {
    await studentsStore.deleteStudent(id);
  }
}
</script>

<template>
  <div>
    <div v-if="studentsStore.loading">Chargement...</div>
    <div v-else-if="studentsStore.error">
      Erreur: {{ studentsStore.error }}
    </div>
    <div v-else>
      <p>Total: {{ studentsStore.studentsCount }}</p>
      <ul>
        <li v-for="student in studentsStore.students" :key="student._id">
          {{ student.name }}
          <button @click="handleDelete(student._id)">Supprimer</button>
        </li>
      </ul>
    </div>
  </div>
</template>
```

## 🚏 Routing et Navigation

### Configuration des Routes

```typescript
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import { authGuard } from './guards';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/components/layout/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/DashboardView.vue'),
      },
      {
        path: 'students',
        name: 'Students',
        component: () => import('@/views/students/StudentListView.vue'),
        meta: { role: ['admin', 'teacher'] }
      },
      {
        path: 'students/:id',
        name: 'StudentDetail',
        component: () => import('@/views/students/StudentDetailView.vue'),
      },
      // ... autres routes
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation Guards
router.beforeEach(authGuard);

export default router;
```

### Navigation Guards

```typescript
// router/guards.ts
import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

export async function authGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const authStore = useAuthStore();
  
  // Vérifier si la route nécessite l'authentification
  if (to.meta.requiresAuth !== false) {
    // Vérifier si l'utilisateur est connecté
    if (!authStore.isAuthenticated) {
      // Rediriger vers login
      return next({ name: 'Login', query: { redirect: to.fullPath } });
    }
    
    // Vérifier les rôles requis
    if (to.meta.role && !authStore.hasRole(to.meta.role as string[])) {
      // Accès refusé
      return next({ name: 'Forbidden' });
    }
  }
  
  // Autoriser la navigation
  next();
}
```

## 🌐 Services API

### Configuration Axios

```typescript
// services/api.ts
import axios, { type AxiosInstance } from 'axios';
import { useAuthStore } from '@/stores/auth';
import router from '@/router';

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor pour ajouter le token
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    const token = authStore.token;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      const authStore = useAuthStore();
      authStore.logout();
      router.push({ name: 'Login' });
    }
    
    return Promise.reject(error);
  }
);

export default api;
```

### Service Example

```typescript
// services/students.service.ts
import api from './api';
import type { Student } from '@/types';

export const studentsService = {
  async getAll(params?: any) {
    return api.get<{ students: Student[]; total: number }>('/students', { params });
  },
  
  async getById(id: string) {
    return api.get<Student>(`/students/${id}`);
  },
  
  async create(data: Partial<Student>) {
    return api.post<Student>('/students', data);
  },
  
  async update(id: string, data: Partial<Student>) {
    return api.put<Student>(`/students/${id}`, data);
  },
  
  async delete(id: string) {
    return api.delete(`/students/${id}`);
  },
  
  async search(query: string) {
    return api.get<Student[]>('/students/search', { params: { q: query } });
  },
};
```

## 📝 Formulaires et Validation

### Avec Vee-Validate et Zod

```vue
<script setup lang="ts">
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';

// Schéma de validation
const schema = z.object({
  firstName: z.string().min(2, 'Minimum 2 caractères'),
  lastName: z.string().min(2, 'Minimum 2 caractères'),
  email: z.string().email('Email invalide'),
  dateOfBirth: z.string().refine((val) => {
    const date = new Date(val);
    return date < new Date();
  }, 'Date de naissance invalide'),
  phone: z.string().regex(/^\+?[0-9]{10,}$/, 'Téléphone invalide'),
});

// Setup form avec validation
const { handleSubmit, errors, defineField } = useForm({
  validationSchema: toTypedSchema(schema),
});

// Définir les champs
const [firstName] = defineField('firstName');
const [lastName] = defineField('lastName');
const [email] = defineField('email');
const [dateOfBirth] = defineField('dateOfBirth');
const [phone] = defineField('phone');

// Soumettre le formulaire
const onSubmit = handleSubmit(async (values) => {
  try {
    await studentsService.create(values);
    // Success
  } catch (error) {
    // Error
  }
});
</script>

<template>
  <form @submit="onSubmit" class="space-y-4">
    <div>
      <label>Prénom</label>
      <input v-model="firstName" type="text" />
      <span v-if="errors.firstName" class="text-red-500">
        {{ errors.firstName }}
      </span>
    </div>
    
    <div>
      <label>Nom</label>
      <input v-model="lastName" type="text" />
      <span v-if="errors.lastName" class="text-red-500">
        {{ errors.lastName }}
      </span>
    </div>
    
    <div>
      <label>Email</label>
      <input v-model="email" type="email" />
      <span v-if="errors.email" class="text-red-500">
        {{ errors.email }}
      </span>
    </div>
    
    <button type="submit">Enregistrer</button>
  </form>
</template>
```

## 🌍 Internationalisation (i18n)

### Configuration

```typescript
// main.ts
import { createI18n } from 'vue-i18n';
import fr from './locales/fr.json';
import en from './locales/en.json';

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('locale') || 'fr',
  fallbackLocale: 'en',
  messages: {
    fr,
    en,
  },
});

app.use(i18n);
```

### Fichiers de Traduction

```json
// locales/fr.json
{
  "common": {
    "save": "Enregistrer",
    "cancel": "Annuler",
    "delete": "Supprimer",
    "edit": "Modifier",
    "search": "Rechercher"
  },
  "students": {
    "title": "Élèves",
    "add": "Ajouter un élève",
    "edit": "Modifier l'élève",
    "delete_confirm": "Êtes-vous sûr de vouloir supprimer cet élève ?"
  }
}
```

### Utilisation dans les Composants

```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t, locale } = useI18n();

function changeLanguage(lang: string) {
  locale.value = lang;
  localStorage.setItem('locale', lang);
}
</script>

<template>
  <div>
    <h1>{{ t('students.title') }}</h1>
    <button @click="changeLanguage('en')">English</button>
    <button @click="changeLanguage('fr')">Français</button>
  </div>
</template>
```

## 📱 PWA et Mode Hors-ligne

### Configuration Vite PWA

```typescript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'icons/*.png'],
      manifest: {
        name: 'Schoman',
        short_name: 'Schoman',
        description: 'Application de gestion scolaire',
        theme_color: '#3b82f6',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 300 // 5 minutes
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ]
});
```

## 🎨 Styles et Theming

### Tailwind Configuration

```javascript
// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        // ... autres couleurs
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
```

### Styles Globaux

```css
/* src/assets/styles/main.css */
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

/* Custom styles */
@layer components {
  .btn-primary {
    @apply bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700;
  }
  
  .card {
    @apply bg-white rounded-lg shadow p-6;
  }
}
```

## 🧪 Tests

### Test d'un Composant

```typescript
// tests/components/StatCard.test.ts
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import StatCard from '@/components/common/StatCard.vue';
import { Users } from 'lucide-vue-next';

describe('StatCard', () => {
  it('renders with correct props', () => {
    const wrapper = mount(StatCard, {
      props: {
        title: 'Total Students',
        value: 150,
        icon: Users,
        change: '+10%',
        trend: 'up',
      },
    });
    
    expect(wrapper.text()).toContain('Total Students');
    expect(wrapper.text()).toContain('150');
    expect(wrapper.text()).toContain('+10%');
  });
  
  it('applies correct trend class', () => {
    const wrapper = mount(StatCard, {
      props: {
        title: 'Test',
        value: 100,
        icon: Users,
        change: '+5%',
        trend: 'up',
      },
    });
    
    const changeElement = wrapper.find('.text-green-600');
    expect(changeElement.exists()).toBe(true);
  });
});
```

### Test d'un Store

```typescript
// tests/stores/students.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useStudentsStore } from '@/stores/students';
import { studentsService } from '@/services/students.service';

// Mock du service
vi.mock('@/services/students.service');

describe('Students Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });
  
  it('fetches students successfully', async () => {
    const mockStudents = [
      { _id: '1', firstName: 'John', lastName: 'Doe' },
      { _id: '2', firstName: 'Jane', lastName: 'Smith' },
    ];
    
    vi.mocked(studentsService.getAll).mockResolvedValue({
      data: { students: mockStudents, total: 2 }
    } as any);
    
    const store = useStudentsStore();
    await store.fetchStudents();
    
    expect(store.students).toEqual(mockStudents);
    expect(store.studentsCount).toBe(2);
    expect(store.loading).toBe(false);
  });
  
  it('handles fetch error', async () => {
    const error = new Error('Network error');
    vi.mocked(studentsService.getAll).mockRejectedValue(error);
    
    const store = useStudentsStore();
    
    await expect(store.fetchStudents()).rejects.toThrow('Network error');
    expect(store.error).toBe('Network error');
    expect(store.loading).toBe(false);
  });
});
```

## 🚀 Build et Déploiement

### Build de Production

```bash
# Build optimisé
npm run build

# Les fichiers sont générés dans dist/
ls dist/
```

### Variables d'Environnement par Environnement

```env
# .env.production
VITE_API_URL=https://api.schoman.com/api
VITE_WS_URL=https://api.schoman.com
VITE_ENV=production
```

### Déploiement Docker

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 📖 Bonnes Pratiques

### 1. Composition API avec `<script setup>`

```vue
<!-- ✅ Bon -->
<script setup lang="ts">
import { ref, computed } from 'vue';

const count = ref(0);
const double = computed(() => count.value * 2);
</script>

<!-- ❌ Éviter Options API pour nouveau code -->
<script lang="ts">
export default {
  data() {
    return { count: 0 };
  }
}
</script>
```

### 2. TypeScript Strict

```typescript
// ✅ Bon - Types explicites
interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

const students = ref<Student[]>([]);

// ❌ Éviter any
const data = ref<any>([]);
```

### 3. Composables pour Logique Réutilisable

```typescript
// composables/usePagination.ts
export function usePagination(initialPage = 1, initialPerPage = 10) {
  const currentPage = ref(initialPage);
  const perPage = ref(initialPerPage);
  
  const offset = computed(() => (currentPage.value - 1) * perPage.value);
  
  function nextPage() {
    currentPage.value++;
  }
  
  function prevPage() {
    if (currentPage.value > 1) {
      currentPage.value--;
    }
  }
  
  return {
    currentPage,
    perPage,
    offset,
    nextPage,
    prevPage,
  };
}
```

### 4. Gestion d'Erreurs

```typescript
// ✅ Bon
try {
  await studentsStore.fetchStudents();
} catch (error: any) {
  console.error('Failed to fetch students:', error);
  notification.error('Erreur lors du chargement des élèves');
}

// ❌ Éviter
await studentsStore.fetchStudents(); // Sans gestion d'erreur
```

### 5. Lazy Loading des Routes

```typescript
// ✅ Bon - Lazy loading
{
  path: '/students',
  component: () => import('@/views/students/StudentListView.vue'),
}

// ❌ Éviter - Import direct
import StudentListView from '@/views/students/StudentListView.vue';
{
  path: '/students',
  component: StudentListView,
}
```

## 🔧 Troubleshooting

### Problème: Erreur CORS

**Solution:**
```typescript
// Vérifier VITE_API_URL dans .env
VITE_API_URL=http://localhost:3000/api

// Vérifier que le backend autorise l'origine
// backend: cors({ origin: 'http://localhost:5173' })
```

### Problème: Types TypeScript

**Solution:**
```bash
# Régénérer les types
npm run type-check

# Vérifier tsconfig.json
```

### Problème: Hot Reload ne fonctionne pas

**Solution:**
```bash
# Nettoyer le cache
rm -rf node_modules/.vite
npm run dev
```

### Problème: Build Fail

**Solution:**
```bash
# Nettoyer et réinstaller
rm -rf node_modules dist
npm install
npm run build
```

## 📚 Ressources

- [Vue.js Documentation](https://vuejs.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Vite Documentation](https://vite.dev/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Vue Router Documentation](https://router.vuejs.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Vee-Validate Documentation](https://vee-validate.logaretm.com/)

## 🤝 Contribution

Consultez [CONTRIBUTING.md](../CONTRIBUTING.md) pour les guidelines de contribution.

## 📄 Licence

ISC - Voir [LICENSE](../LICENSE)

---

**Développé avec ❤️ pour Schoman**
