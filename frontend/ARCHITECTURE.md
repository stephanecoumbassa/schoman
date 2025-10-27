# 🏗️ Schoman Frontend - Architecture Détaillée

Ce document décrit l'architecture frontend de l'application Schoman, les patterns utilisés, et les meilleures pratiques pour le développement.

## 📑 Table des Matières

1. [Vue d'ensemble de l'architecture](#vue-densemble-de-larchitecture)
2. [Structure des dossiers](#structure-des-dossiers)
3. [Patterns et Conventions](#patterns-et-conventions)
4. [Gestion d'État (Pinia)](#gestion-détat-pinia)
5. [Routing et Navigation](#routing-et-navigation)
6. [Communication API](#communication-api)
7. [Composants UI](#composants-ui)
8. [Formulaires et Validation](#formulaires-et-validation)
9. [Gestion des Erreurs](#gestion-des-erreurs)
10. [Performance et Optimisation](#performance-et-optimisation)
11. [Tests](#tests)
12. [Sécurité](#sécurité)

---

## 🎯 Vue d'ensemble de l'architecture

### Architecture Globale

```
┌─────────────────────────────────────────────────────────────┐
│                      Vue 3 Application                       │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    Router (Vue Router)                 │  │
│  │  - Route Guards                                        │  │
│  │  - Lazy Loading                                        │  │
│  │  - Navigation Management                               │  │
│  └───────────────────────────────────────────────────────┘  │
│                           ↓                                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   Views (Pages)                        │  │
│  │  - Dashboard, Students, Classes, Grades, etc.          │  │
│  └───────────────────────────────────────────────────────┘  │
│                           ↓                                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    Components                          │  │
│  │  - Reusable UI Components                              │  │
│  │  - Feature-specific Components                         │  │
│  └───────────────────────────────────────────────────────┘  │
│                           ↓                                   │
│  ┌────────────────────┬──────────────────┬────────────────┐ │
│  │   State (Pinia)    │   Services       │  Composables   │ │
│  │   - Global Store   │   - API Calls    │  - Reusable    │ │
│  │   - State Mgmt     │   - Data Fetching│    Logic       │ │
│  └────────────────────┴──────────────────┴────────────────┘ │
│                           ↓                                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    API Layer (Axios)                   │  │
│  │  - HTTP Client                                         │  │
│  │  - Interceptors                                        │  │
│  │  - Error Handling                                      │  │
│  └───────────────────────────────────────────────────────┘  │
│                           ↓                                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    Backend API                         │  │
│  │  - REST Endpoints                                      │  │
│  │  - WebSocket (Socket.io)                               │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Stack Technologique

- **Framework**: Vue.js 3.5+ (Composition API)
- **TypeScript**: 5.9+ (Typage strict)
- **Build Tool**: Vite 7.1+
- **State Management**: Pinia 3.0+
- **Routing**: Vue Router 4.5+
- **UI Components**: Shadcn-vue, Radix-vue
- **Styling**: Tailwind CSS 4.1+
- **Forms**: Vee-Validate 4.15+ + Zod
- **HTTP Client**: Axios 1.12+
- **WebSockets**: Socket.io-client 4.8+
- **i18n**: Vue I18n 11.1+
- **PWA**: Vite PWA Plugin
- **Testing**: Vitest 3.2+

---

## 📁 Structure des dossiers

```
frontend/
├── public/                      # Assets statiques
│   ├── manifest.json           # PWA manifest
│   ├── icons/                  # Icônes PWA (192x192, 512x512)
│   └── screenshots/            # Captures d'écran PWA
│
├── src/
│   ├── assets/                 # Assets compilés
│   │   ├── styles/
│   │   │   └── main.css       # Styles globaux Tailwind
│   │   ├── images/            # Images du projet
│   │   └── fonts/             # Polices personnalisées
│   │
│   ├── components/            # Composants réutilisables
│   │   ├── ui/               # Composants UI de base (shadcn-vue)
│   │   │   ├── button/       # Boutons
│   │   │   ├── card/         # Cartes
│   │   │   ├── dialog/       # Modales
│   │   │   ├── input/        # Champs de saisie
│   │   │   ├── table/        # Tables
│   │   │   └── ...           # Autres composants UI
│   │   │
│   │   ├── layout/           # Composants de mise en page
│   │   │   ├── Header.vue    # En-tête
│   │   │   ├── Sidebar.vue   # Barre latérale
│   │   │   ├── Footer.vue    # Pied de page
│   │   │   └── Layout.vue    # Conteneur principal
│   │   │
│   │   ├── common/           # Composants communs
│   │   │   ├── DataTable.vue # Table de données générique
│   │   │   ├── SearchBar.vue # Barre de recherche
│   │   │   ├── Pagination.vue# Pagination
│   │   │   ├── LoadingSpinner.vue # Indicateur de chargement
│   │   │   └── ErrorMessage.vue   # Message d'erreur
│   │   │
│   │   └── features/         # Composants par fonctionnalité
│   │       ├── students/     # Composants élèves
│   │       ├── classes/      # Composants classes
│   │       ├── grades/       # Composants notes
│   │       └── ...
│   │
│   ├── views/                # Pages de l'application
│   │   ├── auth/            # Authentification
│   │   │   ├── LoginView.vue
│   │   │   ├── RegisterView.vue
│   │   │   └── ForgotPasswordView.vue
│   │   │
│   │   ├── dashboard/       # Dashboard
│   │   │   └── DashboardView.vue
│   │   │
│   │   ├── students/        # Gestion élèves
│   │   │   ├── StudentsView.vue
│   │   │   ├── StudentDetailsView.vue
│   │   │   ├── CreateStudentView.vue
│   │   │   └── EditStudentView.vue
│   │   │
│   │   ├── classes/         # Gestion classes
│   │   ├── grades/          # Gestion notes
│   │   ├── attendance/      # Gestion présences
│   │   ├── library/         # Bibliothèque
│   │   ├── invoices/        # Facturation
│   │   └── ...
│   │
│   ├── stores/              # Stores Pinia (état global)
│   │   ├── auth.ts         # Authentification
│   │   ├── user.ts         # Utilisateur courant
│   │   ├── students.ts     # Élèves
│   │   ├── classes.ts      # Classes
│   │   ├── grades.ts       # Notes
│   │   ├── notifications.ts # Notifications
│   │   └── ...
│   │
│   ├── services/            # Services API
│   │   ├── api.ts          # Configuration Axios centrale
│   │   ├── auth.service.ts # Service authentification
│   │   ├── students.service.ts # Service élèves
│   │   ├── classes.service.ts  # Service classes
│   │   └── ...
│   │
│   ├── router/              # Configuration routing
│   │   ├── index.ts        # Configuration principale
│   │   ├── routes.ts       # Définition des routes
│   │   └── guards.ts       # Navigation guards
│   │
│   ├── composables/         # Composables réutilisables
│   │   ├── useAuth.ts      # Auth utilities
│   │   ├── useApi.ts       # API utilities
│   │   ├── usePagination.ts # Pagination
│   │   ├── useSearch.ts    # Recherche
│   │   ├── useNotification.ts # Notifications
│   │   └── useWebSocket.ts # WebSocket
│   │
│   ├── types/               # Types TypeScript
│   │   ├── index.ts        # Types principaux
│   │   ├── api.types.ts    # Types API
│   │   ├── models.types.ts # Types modèles
│   │   └── ...
│   │
│   ├── utils/               # Fonctions utilitaires
│   │   ├── format.ts       # Formatage (dates, nombres, etc.)
│   │   ├── validation.ts   # Validations personnalisées
│   │   ├── constants.ts    # Constantes
│   │   ├── helpers.ts      # Fonctions helper
│   │   └── ...
│   │
│   ├── locales/             # Traductions i18n
│   │   ├── fr.json         # Français
│   │   └── en.json         # Anglais
│   │
│   ├── App.vue              # Composant racine
│   ├── main.ts              # Point d'entrée
│   └── sw.ts                # Service Worker (PWA)
│
├── tests/                   # Tests
│   ├── unit/               # Tests unitaires
│   ├── integration/        # Tests d'intégration
│   └── e2e/                # Tests end-to-end
│
├── .env.example             # Template variables d'environnement
├── index.html               # HTML template
├── package.json             # Dépendances
├── tailwind.config.js       # Configuration Tailwind
├── tsconfig.json            # Configuration TypeScript
├── vite.config.ts           # Configuration Vite
└── vitest.config.ts         # Configuration Vitest
```

---

## 🎨 Patterns et Conventions

### 1. Composition API avec `<script setup>`

**Pattern recommandé pour tous les nouveaux composants:**

```vue
<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useStudentsStore } from '@/stores/students';
import type { Student } from '@/types';

// Props avec typage
interface Props {
  studentId?: string;
  readonly?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  readonly: false,
});

// Emits avec typage
const emit = defineEmits<{
  save: [student: Student];
  cancel: [];
}>();

// State réactif
const loading = ref(false);
const error = ref<string | null>(null);
const student = ref<Student | null>(null);

// Store
const studentsStore = useStudentsStore();
const router = useRouter();

// Computed properties
const fullName = computed(() => 
  student.value 
    ? `${student.value.firstName} ${student.value.lastName}` 
    : ''
);

const isValid = computed(() => 
  student.value?.firstName && student.value?.lastName
);

// Methods
async function loadStudent() {
  if (!props.studentId) return;
  
  loading.value = true;
  error.value = null;
  
  try {
    student.value = await studentsStore.fetchStudentById(props.studentId);
  } catch (err: any) {
    error.value = err.message || 'Erreur de chargement';
  } finally {
    loading.value = false;
  }
}

function handleSave() {
  if (!student.value || !isValid.value) return;
  emit('save', student.value);
}

function handleCancel() {
  emit('cancel');
}

// Watchers
watch(() => props.studentId, (newId) => {
  if (newId) loadStudent();
}, { immediate: true });

// Lifecycle hooks
onMounted(() => {
  console.log('Component mounted');
});
</script>

<template>
  <div class="student-card">
    <div v-if="loading">Chargement...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="student">
      <h2>{{ fullName }}</h2>
      <!-- Contenu -->
      
      <div class="actions" v-if="!readonly">
        <button @click="handleSave" :disabled="!isValid">
          Enregistrer
        </button>
        <button @click="handleCancel">Annuler</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.student-card {
  @apply bg-white rounded-lg shadow-md p-6;
}

.error {
  @apply text-red-600 bg-red-50 p-4 rounded;
}

.actions {
  @apply flex gap-4 mt-6;
}
</style>
```

### 2. Naming Conventions

```typescript
// Composants: PascalCase
StudentCard.vue
CreateStudentForm.vue
DataTable.vue

// Composables: camelCase avec préfixe 'use'
useAuth.ts
usePagination.ts
useNotification.ts

// Stores: camelCase avec suffixe 'Store' dans le nom de variable
// Fichier: students.ts
export const useStudentsStore = defineStore('students', () => {
  // ...
});

// Services: camelCase avec suffixe '.service'
// Fichier: students.service.ts
export const studentsService = {
  getAll: () => {},
  getById: (id: string) => {},
};

// Types/Interfaces: PascalCase
interface Student {}
type ApiResponse<T> = {}

// Constants: UPPER_SNAKE_CASE
const API_BASE_URL = 'http://localhost:3000';
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Functions: camelCase
function fetchStudents() {}
function handleSubmit() {}
```

### 3. Component Organization Pattern

**Ordre recommandé dans `<script setup>`:**

```typescript
// 1. Imports
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

// 2. Types/Interfaces
interface Props {
  // ...
}

// 3. Props
const props = defineProps<Props>();

// 4. Emits
const emit = defineEmits<{
  // ...
}>();

// 5. Composables/Stores
const router = useRouter();
const store = useStudentsStore();

// 6. State (ref/reactive)
const loading = ref(false);
const data = ref([]);

// 7. Computed
const filteredData = computed(() => {});

// 8. Methods
function handleClick() {}
async function fetchData() {}

// 9. Watchers
watch(() => props.value, () => {});

// 10. Lifecycle hooks
onMounted(() => {});
onUnmounted(() => {});
```

---

## 📦 Gestion d'État (Pinia)

### Structure d'un Store

```typescript
// stores/students.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { studentsService } from '@/services/students.service';
import type { Student, StudentFilters } from '@/types';

export const useStudentsStore = defineStore('students', () => {
  // ========== STATE ==========
  const students = ref<Student[]>([]);
  const currentStudent = ref<Student | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const filters = ref<StudentFilters>({
    search: '',
    classId: null,
    status: 'active',
  });
  const pagination = ref({
    page: 1,
    perPage: 20,
    total: 0,
    totalPages: 0,
  });

  // ========== GETTERS ==========
  const activeStudents = computed(() => 
    students.value.filter(s => s.status === 'active')
  );

  const studentsCount = computed(() => students.value.length);

  const hasStudents = computed(() => students.value.length > 0);

  const filteredStudents = computed(() => {
    let result = students.value;

    if (filters.value.search) {
      const search = filters.value.search.toLowerCase();
      result = result.filter(s => 
        s.firstName.toLowerCase().includes(search) ||
        s.lastName.toLowerCase().includes(search) ||
        s.studentNumber.includes(search)
      );
    }

    if (filters.value.classId) {
      result = result.filter(s => s.classId === filters.value.classId);
    }

    if (filters.value.status) {
      result = result.filter(s => s.status === filters.value.status);
    }

    return result;
  });

  // ========== ACTIONS ==========
  async function fetchStudents(params?: StudentFilters) {
    loading.value = true;
    error.value = null;

    try {
      const response = await studentsService.getAll({
        ...filters.value,
        ...params,
        page: pagination.value.page,
        perPage: pagination.value.perPage,
      });

      students.value = response.data.students;
      pagination.value.total = response.data.total;
      pagination.value.totalPages = response.data.totalPages;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur de chargement';
      console.error('Error fetching students:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchStudentById(id: string) {
    loading.value = true;
    error.value = null;

    try {
      const response = await studentsService.getById(id);
      currentStudent.value = response.data.student;
      return response.data.student;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Élève introuvable';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function createStudent(data: Partial<Student>) {
    loading.value = true;
    error.value = null;

    try {
      const response = await studentsService.create(data);
      const newStudent = response.data.student;
      students.value.unshift(newStudent);
      return newStudent;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur de création';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateStudent(id: string, data: Partial<Student>) {
    loading.value = true;
    error.value = null;

    try {
      const response = await studentsService.update(id, data);
      const updatedStudent = response.data.student;
      
      const index = students.value.findIndex(s => s._id === id);
      if (index !== -1) {
        students.value[index] = updatedStudent;
      }
      
      if (currentStudent.value?._id === id) {
        currentStudent.value = updatedStudent;
      }

      return updatedStudent;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur de mise à jour';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteStudent(id: string) {
    loading.value = true;
    error.value = null;

    try {
      await studentsService.delete(id);
      students.value = students.value.filter(s => s._id !== id);
      
      if (currentStudent.value?._id === id) {
        currentStudent.value = null;
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur de suppression';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  function setFilters(newFilters: Partial<StudentFilters>) {
    filters.value = { ...filters.value, ...newFilters };
  }

  function resetFilters() {
    filters.value = {
      search: '',
      classId: null,
      status: 'active',
    };
  }

  function setPage(page: number) {
    pagination.value.page = page;
    fetchStudents();
  }

  function clearError() {
    error.value = null;
  }

  function $reset() {
    students.value = [];
    currentStudent.value = null;
    loading.value = false;
    error.value = null;
    resetFilters();
    pagination.value = {
      page: 1,
      perPage: 20,
      total: 0,
      totalPages: 0,
    };
  }

  // ========== RETURN ==========
  return {
    // State
    students,
    currentStudent,
    loading,
    error,
    filters,
    pagination,
    
    // Getters
    activeStudents,
    studentsCount,
    hasStudents,
    filteredStudents,
    
    // Actions
    fetchStudents,
    fetchStudentById,
    createStudent,
    updateStudent,
    deleteStudent,
    setFilters,
    resetFilters,
    setPage,
    clearError,
    $reset,
  };
});
```

### Utilisation d'un Store dans un Composant

```vue
<script setup lang="ts">
import { onMounted } from 'vue';
import { useStudentsStore } from '@/stores/students';
import { storeToRefs } from 'pinia';

const studentsStore = useStudentsStore();

// Utiliser storeToRefs pour maintenir la réactivité
const { 
  students, 
  loading, 
  error,
  activeStudents,
  studentsCount 
} = storeToRefs(studentsStore);

// Les actions ne nécessitent pas storeToRefs
const {
  fetchStudents,
  createStudent,
  deleteStudent,
} = studentsStore;

onMounted(async () => {
  await fetchStudents();
});
</script>

<template>
  <div>
    <p>Total: {{ studentsCount }}</p>
    
    <div v-if="loading">Chargement...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else>
      <div v-for="student in activeStudents" :key="student._id">
        {{ student.firstName }} {{ student.lastName }}
      </div>
    </div>
  </div>
</template>
```

---

## 🛣️ Routing et Navigation

### Configuration des Routes

```typescript
// router/routes.ts
import type { RouteRecordRaw } from 'vue-router';

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { 
      requiresAuth: false,
      layout: 'auth', // Layout spécifique pour l'auth
    },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/dashboard/DashboardView.vue'),
    meta: { 
      requiresAuth: true,
      roles: ['admin', 'teacher', 'parent'],
      title: 'Dashboard',
    },
  },
  {
    path: '/students',
    name: 'Students',
    component: () => import('@/views/students/StudentsView.vue'),
    meta: { 
      requiresAuth: true,
      roles: ['admin', 'teacher'],
      title: 'Élèves',
    },
    children: [
      {
        path: ':id',
        name: 'StudentDetails',
        component: () => import('@/views/students/StudentDetailsView.vue'),
        meta: { 
          requiresAuth: true,
          roles: ['admin', 'teacher'],
          title: 'Détails élève',
        },
      },
    ],
  },
  // ... autres routes
];
```

### Navigation Guards

```typescript
// router/guards.ts
import { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

/**
 * Guard d'authentification
 */
export function authGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const authStore = useAuthStore();
  const requiresAuth = to.meta.requiresAuth !== false; // Par défaut true

  if (requiresAuth && !authStore.isAuthenticated) {
    // Rediriger vers login en sauvegardant la route souhaitée
    next({
      name: 'Login',
      query: { redirect: to.fullPath },
    });
  } else if (!requiresAuth && authStore.isAuthenticated) {
    // Si déjà connecté et tente d'accéder à login/register
    next({ name: 'Dashboard' });
  } else {
    next();
  }
}

/**
 * Guard d'autorisation par rôle
 */
export function roleGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const authStore = useAuthStore();
  const allowedRoles = to.meta.roles as string[] | undefined;

  if (!allowedRoles || allowedRoles.length === 0) {
    next();
    return;
  }

  if (!authStore.user || !allowedRoles.includes(authStore.user.role)) {
    // Accès refusé
    next({
      name: 'Forbidden',
      params: { message: 'Accès non autorisé' },
    });
  } else {
    next();
  }
}

/**
 * Guard pour mettre à jour le titre de la page
 */
export function titleGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const title = to.meta.title as string | undefined;
  if (title) {
    document.title = `${title} - Schoman`;
  }
  next();
}
```

### Configuration Router

```typescript
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import { routes } from './routes';
import { authGuard, roleGuard, titleGuard } from './guards';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else if (to.hash) {
      return { el: to.hash, behavior: 'smooth' };
    } else {
      return { top: 0 };
    }
  },
});

// Appliquer les guards dans l'ordre
router.beforeEach(authGuard);
router.beforeEach(roleGuard);
router.beforeEach(titleGuard);

// Guard global après navigation
router.afterEach((to, from) => {
  // Analytics, logging, etc.
  console.log(`Navigated from ${from.path} to ${to.path}`);
});

export default router;
```

---

## 🌐 Communication API

### Configuration Axios

```typescript
// services/api.ts
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notifications';
import router from '@/router';

// Configuration de base
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const authStore = useAuthStore();
    
    // Ajouter le token JWT
    if (authStore.token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${authStore.token}`;
    }

    // Logging en développement
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data);
    }

    return config;
  },
  (error: AxiosError) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Logging en développement
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }

    return response;
  },
  async (error: AxiosError) => {
    const notificationStore = useNotificationStore();

    if (error.response) {
      const { status, data } = error.response;

      // Gestion des erreurs par code HTTP
      switch (status) {
        case 401:
          // Token expiré ou invalide
          const authStore = useAuthStore();
          authStore.logout();
          router.push({ name: 'Login', query: { expired: 'true' } });
          notificationStore.error('Session expirée. Veuillez vous reconnecter.');
          break;

        case 403:
          // Accès interdit
          notificationStore.error('Accès non autorisé');
          router.push({ name: 'Forbidden' });
          break;

        case 404:
          // Ressource non trouvée
          notificationStore.error('Ressource introuvable');
          break;

        case 422:
          // Erreur de validation
          const validationErrors = (data as any)?.errors;
          if (validationErrors) {
            Object.values(validationErrors).forEach((msg: any) => {
              notificationStore.error(msg);
            });
          }
          break;

        case 500:
          // Erreur serveur
          notificationStore.error('Erreur serveur. Veuillez réessayer plus tard.');
          break;

        default:
          // Autres erreurs
          const message = (data as any)?.message || 'Une erreur est survenue';
          notificationStore.error(message);
      }
    } else if (error.request) {
      // Erreur réseau
      notificationStore.error('Erreur de connexion. Vérifiez votre connexion internet.');
    } else {
      // Autre erreur
      notificationStore.error('Une erreur inattendue est survenue');
    }

    console.error('[API Response Error]', error);
    return Promise.reject(error);
  }
);

export default apiClient;

// Helper types pour les réponses API
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}
```

### Service API Pattern

```typescript
// services/students.service.ts
import api, { ApiResponse, PaginatedResponse } from './api';
import type { Student, StudentFilters } from '@/types';

export const studentsService = {
  /**
   * Get all students with filters
   */
  async getAll(params?: StudentFilters): Promise<ApiResponse<PaginatedResponse<Student>>> {
    const response = await api.get('/students', { params });
    return response.data;
  },

  /**
   * Get student by ID
   */
  async getById(id: string): Promise<ApiResponse<{ student: Student }>> {
    const response = await api.get(`/students/${id}`);
    return response.data;
  },

  /**
   * Create new student
   */
  async create(data: Partial<Student>): Promise<ApiResponse<{ student: Student }>> {
    const response = await api.post('/students', data);
    return response.data;
  },

  /**
   * Update student
   */
  async update(id: string, data: Partial<Student>): Promise<ApiResponse<{ student: Student }>> {
    const response = await api.put(`/students/${id}`, data);
    return response.data;
  },

  /**
   * Delete student
   */
  async delete(id: string): Promise<ApiResponse<{ message: string }>> {
    const response = await api.delete(`/students/${id}`);
    return response.data;
  },

  /**
   * Upload student avatar
   */
  async uploadAvatar(id: string, file: File): Promise<ApiResponse<{ avatarUrl: string }>> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await api.post(`/students/${id}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Export students to Excel
   */
  async exportToExcel(filters?: StudentFilters): Promise<Blob> {
    const response = await api.get('/students/export', {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  },
};
```

---

## 🎨 Composants UI

### Composant UI Générique (Button)

```vue
<!-- components/ui/button/Button.vue -->
<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  icon?: string;
  iconPosition?: 'left' | 'right';
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  type: 'button',
  iconPosition: 'left',
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const buttonClasses = computed(() => {
  const base = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'bg-transparent hover:bg-gray-100 focus:ring-gray-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const disabled = props.disabled || props.loading ? 'opacity-50 cursor-not-allowed' : '';

  return `${base} ${variants[props.variant]} ${sizes[props.size]} ${disabled}`;
});

function handleClick(event: MouseEvent) {
  if (!props.disabled && !props.loading) {
    emit('click', event);
  }
}
</script>

<template>
  <button
    :type="type"
    :class="buttonClasses"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <span v-if="loading" class="mr-2">
      <!-- Loading spinner -->
      <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    </span>

    <slot name="icon-left" v-if="icon && iconPosition === 'left' && !loading">
      <!-- Icon left -->
    </slot>

    <slot />

    <slot name="icon-right" v-if="icon && iconPosition === 'right' && !loading">
      <!-- Icon right -->
    </slot>
  </button>
</template>
```

### Utilisation du Composant Button

```vue
<template>
  <div class="space-y-4">
    <!-- Variants -->
    <Button variant="primary" @click="handleSave">
      Enregistrer
    </Button>

    <Button variant="danger" @click="handleDelete">
      Supprimer
    </Button>

    <!-- Avec loading -->
    <Button variant="primary" :loading="loading" @click="handleSubmit">
      Soumettre
    </Button>

    <!-- Disabled -->
    <Button variant="secondary" :disabled="!isValid">
      Valider
    </Button>

    <!-- Avec slot personnalisé -->
    <Button variant="ghost">
      <template #icon-left>
        <PlusIcon class="h-4 w-4 mr-2" />
      </template>
      Ajouter un élève
    </Button>
  </div>
</template>
```

---

## 📝 Formulaires et Validation

### Formulaire avec Vee-Validate et Zod

```vue
<script setup lang="ts">
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';
import { useStudentsStore } from '@/stores/students';
import { useRouter } from 'vue-router';
import { useNotificationStore } from '@/stores/notifications';

// Schéma de validation Zod
const studentSchema = z.object({
  firstName: z.string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(50, 'Le prénom ne peut pas dépasser 50 caractères'),
  
  lastName: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères'),
  
  email: z.string()
    .email('Email invalide')
    .optional()
    .or(z.literal('')),
  
  dateOfBirth: z.date({
    required_error: 'La date de naissance est requise',
  }).max(new Date(), 'La date de naissance ne peut pas être dans le futur'),
  
  classId: z.string()
    .min(1, 'Veuillez sélectionner une classe'),
  
  gender: z.enum(['male', 'female', 'other'], {
    required_error: 'Le genre est requis',
  }),
  
  phone: z.string()
    .regex(/^(\+?\d{1,3}[- ]?)?\d{10}$/, 'Numéro de téléphone invalide')
    .optional()
    .or(z.literal('')),
});

type StudentForm = z.infer<typeof studentSchema>;

// Configuration du formulaire
const { 
  handleSubmit, 
  errors, 
  values,
  defineField,
  setFieldValue,
  resetForm,
  isSubmitting,
} = useForm({
  validationSchema: toTypedSchema(studentSchema),
  initialValues: {
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: undefined,
    classId: '',
    gender: 'male',
    phone: '',
  },
});

// Définir les champs
const [firstName, firstNameAttrs] = defineField('firstName');
const [lastName, lastNameAttrs] = defineField('lastName');
const [email, emailAttrs] = defineField('email');
const [dateOfBirth, dateOfBirthAttrs] = defineField('dateOfBirth');
const [classId, classIdAttrs] = defineField('classId');
const [gender, genderAttrs] = defineField('gender');
const [phone, phoneAttrs] = defineField('phone');

const studentsStore = useStudentsStore();
const router = useRouter();
const notificationStore = useNotificationStore();

// Soumettre le formulaire
const onSubmit = handleSubmit(async (values) => {
  try {
    await studentsStore.createStudent(values);
    notificationStore.success('Élève créé avec succès');
    router.push({ name: 'Students' });
  } catch (error: any) {
    notificationStore.error(error.message || 'Erreur lors de la création');
  }
});

// Réinitialiser le formulaire
function handleReset() {
  resetForm();
}
</script>

<template>
  <form @submit="onSubmit" class="space-y-6">
    <!-- First Name -->
    <div>
      <label for="firstName" class="block text-sm font-medium text-gray-700">
        Prénom *
      </label>
      <input
        id="firstName"
        v-model="firstName"
        v-bind="firstNameAttrs"
        type="text"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        :class="{ 'border-red-500': errors.firstName }"
      />
      <p v-if="errors.firstName" class="mt-1 text-sm text-red-600">
        {{ errors.firstName }}
      </p>
    </div>

    <!-- Last Name -->
    <div>
      <label for="lastName" class="block text-sm font-medium text-gray-700">
        Nom *
      </label>
      <input
        id="lastName"
        v-model="lastName"
        v-bind="lastNameAttrs"
        type="text"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        :class="{ 'border-red-500': errors.lastName }"
      />
      <p v-if="errors.lastName" class="mt-1 text-sm text-red-600">
        {{ errors.lastName }}
      </p>
    </div>

    <!-- Email -->
    <div>
      <label for="email" class="block text-sm font-medium text-gray-700">
        Email
      </label>
      <input
        id="email"
        v-model="email"
        v-bind="emailAttrs"
        type="email"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        :class="{ 'border-red-500': errors.email }"
      />
      <p v-if="errors.email" class="mt-1 text-sm text-red-600">
        {{ errors.email }}
      </p>
    </div>

    <!-- Date of Birth -->
    <div>
      <label for="dateOfBirth" class="block text-sm font-medium text-gray-700">
        Date de naissance *
      </label>
      <input
        id="dateOfBirth"
        v-model="dateOfBirth"
        v-bind="dateOfBirthAttrs"
        type="date"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        :class="{ 'border-red-500': errors.dateOfBirth }"
      />
      <p v-if="errors.dateOfBirth" class="mt-1 text-sm text-red-600">
        {{ errors.dateOfBirth }}
      </p>
    </div>

    <!-- Gender -->
    <div>
      <label class="block text-sm font-medium text-gray-700">Genre *</label>
      <div class="mt-2 space-x-4">
        <label class="inline-flex items-center">
          <input
            v-model="gender"
            v-bind="genderAttrs"
            type="radio"
            value="male"
            class="text-blue-600"
          />
          <span class="ml-2">Masculin</span>
        </label>
        <label class="inline-flex items-center">
          <input
            v-model="gender"
            v-bind="genderAttrs"
            type="radio"
            value="female"
            class="text-blue-600"
          />
          <span class="ml-2">Féminin</span>
        </label>
        <label class="inline-flex items-center">
          <input
            v-model="gender"
            v-bind="genderAttrs"
            type="radio"
            value="other"
            class="text-blue-600"
          />
          <span class="ml-2">Autre</span>
        </label>
      </div>
      <p v-if="errors.gender" class="mt-1 text-sm text-red-600">
        {{ errors.gender }}
      </p>
    </div>

    <!-- Actions -->
    <div class="flex justify-end space-x-4">
      <button
        type="button"
        @click="handleReset"
        class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
      >
        Réinitialiser
      </button>
      <button
        type="submit"
        :disabled="isSubmitting"
        class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
      >
        {{ isSubmitting ? 'Enregistrement...' : 'Enregistrer' }}
      </button>
    </div>
  </form>
</template>
```

---

## ⚡ Performance et Optimisation

### 1. Lazy Loading des Routes

```typescript
// Bon - Lazy loading
const routes = [
  {
    path: '/students',
    component: () => import('@/views/students/StudentsView.vue'),
  },
];

// Mauvais - Import direct
import StudentsView from '@/views/students/StudentsView.vue';
const routes = [
  {
    path: '/students',
    component: StudentsView,
  },
];
```

### 2. Composants Asynchrones

```vue
<script setup lang="ts">
import { defineAsyncComponent } from 'vue';

// Lazy load d'un composant lourd
const HeavyComponent = defineAsyncComponent(() => 
  import('@/components/HeavyComponent.vue')
);
</script>

<template>
  <Suspense>
    <template #default>
      <HeavyComponent />
    </template>
    <template #fallback>
      <div>Chargement...</div>
    </template>
  </Suspense>
</template>
```

### 3. Optimisation des Computed

```typescript
// Bon - computed pour valeurs dérivées
const fullName = computed(() => 
  `${student.value.firstName} ${student.value.lastName}`
);

// Mauvais - recalcul à chaque rendu
<template>
  <div>{{ student.firstName + ' ' + student.lastName }}</div>
</template>
```

### 4. Virtual Scrolling pour Grandes Listes

```vue
<script setup lang="ts">
import { useVirtualList } from '@vueuse/core';

const { list, containerProps, wrapperProps } = useVirtualList(
  largeList,
  { itemHeight: 50 }
);
</script>

<template>
  <div v-bind="containerProps" style="height: 400px">
    <div v-bind="wrapperProps">
      <div v-for="item in list" :key="item.index" style="height: 50px">
        {{ item.data }}
      </div>
    </div>
  </div>
</template>
```

---

## 🧪 Tests

### Test d'un Composant

```typescript
// tests/unit/components/StudentCard.test.ts
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import StudentCard from '@/components/students/StudentCard.vue';

describe('StudentCard', () => {
  it('renders student name', () => {
    const student = {
      _id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@test.com',
    };

    const wrapper = mount(StudentCard, {
      props: { student },
    });

    expect(wrapper.text()).toContain('John Doe');
  });

  it('emits delete event', async () => {
    const wrapper = mount(StudentCard, {
      props: {
        student: { _id: '1', firstName: 'John', lastName: 'Doe' },
      },
    });

    await wrapper.find('.delete-btn').trigger('click');
    expect(wrapper.emitted('delete')).toBeTruthy();
  });
});
```

### Test d'un Store

```typescript
// tests/unit/stores/students.test.ts
import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useStudentsStore } from '@/stores/students';
import { studentsService } from '@/services/students.service';

vi.mock('@/services/students.service');

describe('Students Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('fetches students', async () => {
    const mockStudents = [
      { _id: '1', firstName: 'John', lastName: 'Doe' },
    ];

    vi.mocked(studentsService.getAll).mockResolvedValue({
      data: { items: mockStudents, total: 1 },
    } as any);

    const store = useStudentsStore();
    await store.fetchStudents();

    expect(store.students).toEqual(mockStudents);
  });
});
```

---

## 🔒 Sécurité

### 1. Validation Côté Client

Toujours valider les données côté client ET côté serveur.

```typescript
// Utiliser Zod pour la validation
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
```

### 2. Sanitization des Entrées

```typescript
// Éviter XSS
import DOMPurify from 'dompurify';

const sanitizedHTML = DOMPurify.sanitize(userInput);
```

### 3. Protection CSRF

```typescript
// Inclure le token CSRF dans les headers
apiClient.defaults.headers.common['X-CSRF-Token'] = csrfToken;
```

### 4. Gestion Sécurisée du Token

```typescript
// Ne jamais stocker de données sensibles en localStorage
// Utiliser httpOnly cookies quand possible
// Stocker le token en sessionStorage ou mémoire
const authStore = useAuthStore();
authStore.setToken(token); // Géré par le store
```

---

## 📚 Ressources

- [Vue.js Documentation](https://vuejs.org/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Vue Router Documentation](https://router.vuejs.org/)
- [Vite Documentation](https://vitejs.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Vee-Validate Documentation](https://vee-validate.logaretm.com/)
- [Zod Documentation](https://zod.dev/)

---

**Document créé:** 27 Octobre 2025  
**Version:** 1.0  
**Auteur:** Équipe Schoman
