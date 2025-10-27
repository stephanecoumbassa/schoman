# 📱 Schoman Frontend

Application Vue.js 3 moderne avec TypeScript pour la gestion scolaire complète.

> **📚 Documentation détaillée:** Consultez [README_DETAILED.md](./README_DETAILED.md) pour une documentation complète de l'architecture, des composants et des patterns utilisés.

## 🎯 Vue d'ensemble

Application web complète de gestion scolaire construite avec Vue.js 3, TypeScript, Tailwind CSS et Pinia. Interface utilisateur moderne, responsive et intuitive pour gérer tous les aspects d'une école.

### ✨ Fonctionnalités Principales

- ✅ **Authentification JWT** avec gestion de sessions sécurisée
- ✅ **Dashboard interactif** avec statistiques temps réel et graphiques
- ✅ **Gestion complète des utilisateurs** : Admins, enseignants, parents, élèves
- ✅ **Module Élèves** : CRUD complet, recherche avancée, filtres
- ✅ **Module Classes** : Organisation par niveaux et années scolaires
- ✅ **Notes et Bulletins** : Saisie, calcul de moyennes, visualisation
- ✅ **Suivi des Présences** : Enregistrement quotidien, statistiques détaillées
- ✅ **Bibliothèque** : Gestion des livres et emprunts
- ✅ **Facturation** : Création factures, suivi paiements, relances
- ✅ **Événements** : Gestion complète des événements scolaires
- ✅ **Dépenses** : Suivi et workflow d'approbation
- ✅ **Messagerie interne** : Communication entre utilisateurs
- ✅ **Comptabilité** : Transactions, budgets, rapports financiers
- ✅ **Notifications temps réel** : Via WebSockets (Socket.io)
- ✅ **PWA** : Mode hors-ligne et installation sur mobile/desktop
- ✅ **Multilingue** : Support FR/EN avec vue-i18n

## 🔧 Stack Technique

### Core
- **Vue.js 3.5+** - Framework progressif avec Composition API
- **TypeScript 5.9+** - Typage statique robuste
- **Vite 7.1+** - Build tool ultra-rapide
- **Pinia 3.0+** - State management officiel Vue
- **Vue Router 4.5+** - Routing avec navigation guards

### UI & Styling
- **Tailwind CSS 4.1+** - Utility-first CSS
- **Shadcn-vue 2.2+** - Composants UI réutilisables
- **Radix-vue 1.9+** - Composants accessibles headless
- **Lucide Vue Next** - Icons SVG modernes
- **Chart.js 4.5+** - Visualisations de données

### Formulaires & Validation
- **Vee-Validate 4.15+** - Validation de formulaires
- **Zod 4.1+** - Schema validation TypeScript-first

### Communication
- **Axios 1.12+** - HTTP client avec interceptors
- **Socket.io-client 4.8+** - WebSockets temps réel

### Autres
- **Vue I18n 11.1+** - Internationalisation
- **Vite PWA Plugin** - Progressive Web App
- **Vitest 3.2+** - Testing framework
- **Vue Test Utils 2.4+** - Test utilities

## 🚀 Installation et Démarrage

### Prérequis

- Node.js >= 20.19.0 ou >= 22.12.0
- npm >= 10.0.0
- Backend Schoman en cours d'exécution (port 3000)

### Installation Rapide

```bash
# Dans le dossier frontend
npm install

# Créer le fichier .env
cp .env.example .env

# Configurer l'URL de l'API backend dans .env
echo "VITE_API_URL=http://localhost:3000/api" > .env

# Démarrer le serveur de développement
npm run dev
```

L'application sera accessible sur **http://localhost:5173**

### Configuration (.env)

```env
# URL de l'API Backend
VITE_API_URL=http://localhost:3000/api

# URL WebSocket (optionnel, par défaut: même que API)
VITE_WS_URL=http://localhost:3000

# Environnement
VITE_ENV=development

# Options PWA
VITE_PWA_ENABLED=true
```

## 📝 Scripts Disponibles

### Développement

```bash
# Démarrer le serveur de développement avec hot-reload
npm run dev

# Vérification des types TypeScript
npm run type-check

# Linting et auto-fix
npm run lint

# Formatage du code avec Prettier
npm run format
```

### Production

```bash
# Build optimisé pour production
npm run build

# Preview du build de production
npm run preview
```

### Tests

```bash
# Lancer les tests unitaires
npm run test

# Tests en mode watch
npm run test:watch

# Tests avec interface UI
npm run test:ui

# Couverture de tests
npm run test:coverage
```

## 📁 Structure du Projet

```
frontend/
├── public/                 # Assets statiques
│   ├── manifest.json      # PWA manifest
│   └── icons/             # Icônes PWA
│
├── src/
│   ├── assets/            # Images, fonts, styles
│   │   └── styles/
│   │       └── main.css   # Styles globaux Tailwind
│   │
│   ├── components/        # Composants réutilisables
│   │   ├── ui/           # Composants UI de base (shadcn-vue)
│   │   ├── layout/       # Header, Sidebar, Footer
│   │   ├── common/       # DataTable, SearchBar, etc.
│   │   └── features/     # Composants par fonctionnalité
│   │
│   ├── views/            # Pages de l'application
│   │   ├── auth/         # Login, Register
│   │   ├── dashboard/    # Dashboard principal
│   │   ├── students/     # Gestion élèves
│   │   ├── classes/      # Gestion classes
│   │   ├── grades/       # Gestion notes
│   │   └── ...           # Autres modules
│   │
│   ├── stores/           # Stores Pinia (état global)
│   │   ├── auth.ts      # Authentification
│   │   ├── students.ts  # Élèves
│   │   └── ...
│   │
│   ├── services/         # Services API
│   │   ├── api.ts       # Configuration Axios
│   │   └── *.service.ts # Services par module
│   │
│   ├── router/           # Configuration routing
│   │   ├── index.ts     # Routes
│   │   └── guards.ts    # Navigation guards
│   │
│   ├── composables/      # Composables réutilisables
│   │   ├── useAuth.ts
│   │   ├── useApi.ts
│   │   └── ...
│   │
│   ├── types/            # Types TypeScript
│   │   └── index.ts
│   │
│   ├── utils/            # Fonctions utilitaires
│   │   ├── format.ts
│   │   ├── validation.ts
│   │   └── constants.ts
│   │
│   ├── locales/          # Traductions i18n
│   │   ├── fr.json      # Français
│   │   └── en.json      # Anglais
│   │
│   ├── App.vue           # Composant racine
│   ├── main.ts           # Point d'entrée
│   └── sw.ts             # Service Worker (PWA)
│
├── .env.example          # Template de configuration
├── .eslintrc.js         # Config ESLint
├── .prettierrc.json     # Config Prettier
├── index.html           # HTML template
├── package.json         # Dépendances npm
├── tailwind.config.js   # Config Tailwind CSS
├── tsconfig.json        # Config TypeScript
├── vite.config.ts       # Config Vite
└── README.md            # Cette documentation
```

## 🏗️ Architecture et Patterns

### Composition API avec `<script setup>`

Tous les nouveaux composants utilisent la Composition API moderne :

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useStudentsStore } from '@/stores/students';

// State
const searchQuery = ref('');
const studentsStore = useStudentsStore();

// Computed
const filteredStudents = computed(() => {
  // Logic
});

// Lifecycle
onMounted(() => {
  studentsStore.fetchStudents();
});
</script>

<template>
  <!-- Template -->
</template>

<style scoped>
/* Styles scopés */
</style>
```

### State Management avec Pinia

Stores typés pour chaque module :

```typescript
// stores/students.ts
export const useStudentsStore = defineStore('students', () => {
  // State
  const students = ref<Student[]>([]);
  const loading = ref(false);
  
  // Getters
  const activeStudents = computed(() => 
    students.value.filter(s => s.isActive)
  );
  
  // Actions
  async function fetchStudents() {
    loading.value = true;
    try {
      const response = await studentsService.getAll();
      students.value = response.data.students;
    } finally {
      loading.value = false;
    }
  }
  
  return { students, loading, activeStudents, fetchStudents };
});
```

### Services API

Services modulaires pour chaque endpoint :

```typescript
// services/students.service.ts
import api from './api';

export const studentsService = {
  getAll: (params?: any) => api.get('/students', { params }),
  getById: (id: string) => api.get(`/students/${id}`),
  create: (data: any) => api.post('/students', data),
  update: (id: string, data: any) => api.put(`/students/${id}`, data),
  delete: (id: string) => api.delete(`/students/${id}`),
};
```

## 🎨 Styles et Theming

L'application utilise **Tailwind CSS** pour un styling cohérent et maintenable :

```vue
<template>
  <!-- Utility classes -->
  <div class="bg-white rounded-lg shadow-sm p-6">
    <h2 class="text-2xl font-bold text-gray-900 mb-4">
      {{ title }}
    </h2>
    <button class="btn-primary">
      Enregistrer
    </button>
  </div>
</template>

<style scoped>
/* Custom classes avec @apply */
.btn-primary {
  @apply bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition;
}
</style>
```

## 🌐 Routing et Navigation

Routes protégées avec navigation guards :

```typescript
// router/index.ts
const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/dashboard/DashboardView.vue'),
    meta: { requiresAuth: true, roles: ['admin', 'teacher'] }
  },
];

// Guard d'authentification
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({ name: 'Login' });
  }
  
  next();
});
```

## 📝 Formulaires et Validation

Validation robuste avec **Vee-Validate** et **Zod** :

```vue
<script setup lang="ts">
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';

const schema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Minimum 6 caractères'),
});

const { handleSubmit, errors, defineField } = useForm({
  validationSchema: toTypedSchema(schema),
});

const [email] = defineField('email');
const [password] = defineField('password');

const onSubmit = handleSubmit(async (values) => {
  // Submit logic
});
</script>

<template>
  <form @submit="onSubmit">
    <input v-model="email" type="email" />
    <span v-if="errors.email">{{ errors.email }}</span>
    
    <input v-model="password" type="password" />
    <span v-if="errors.password">{{ errors.password }}</span>
    
    <button type="submit">Connexion</button>
  </form>
</template>
```

## 🌍 Internationalisation (i18n)

Support multilingue complet :

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
    <h1>{{ t('dashboard.title') }}</h1>
    <button @click="changeLanguage('fr')">Français</button>
    <button @click="changeLanguage('en')">English</button>
  </div>
</template>
```

## 📱 PWA - Progressive Web App

L'application est une PWA complète :

- ✅ Installation sur mobile et desktop
- ✅ Mode hors-ligne avec cache intelligent
- ✅ Notifications push (navigateur)
- ✅ Synchronisation en arrière-plan
- ✅ Icônes et splash screens optimisés

## 🧪 Tests

### Tests de Composants

```typescript
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import StudentCard from '@/components/students/StudentCard.vue';

describe('StudentCard', () => {
  it('renders student name', () => {
    const wrapper = mount(StudentCard, {
      props: {
        student: { name: 'John Doe', email: 'john@test.com' }
      }
    });
    
    expect(wrapper.text()).toContain('John Doe');
  });
});
```

### Tests de Stores

```typescript
import { setActivePinia, createPinia } from 'pinia';
import { useStudentsStore } from '@/stores/students';

describe('Students Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });
  
  it('fetches students', async () => {
    const store = useStudentsStore();
    await store.fetchStudents();
    
    expect(store.students.length).toBeGreaterThan(0);
  });
});
```

## 🚀 Build et Déploiement

### Build de Production

```bash
# Build optimisé
npm run build

# Les fichiers sont générés dans dist/
# Prêts pour déploiement sur nginx, Apache, Vercel, Netlify, etc.
```

### Déploiement Docker

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 📖 Bonnes Pratiques

1. **Composition API** : Utiliser `<script setup>` pour tous les nouveaux composants
2. **TypeScript** : Typage strict, éviter `any`
3. **Composables** : Extraire la logique réutilisable dans des composables
4. **Lazy Loading** : Routes et composants lourds chargés à la demande
5. **Reactivity** : Utiliser `ref` et `computed` correctement
6. **Error Handling** : Toujours gérer les erreurs API
7. **Accessibilité** : ARIA labels, navigation clavier
8. **Performance** : Éviter les re-renders inutiles avec `computed`

## 🔧 Troubleshooting

### Erreur CORS
Vérifier que `VITE_API_URL` pointe vers le bon backend et que le backend autorise l'origine frontend.

### Types TypeScript
```bash
npm run type-check
```

### Hot Reload ne fonctionne pas
```bash
rm -rf node_modules/.vite
npm run dev
```

## 📚 Documentation Complète

Consultez [README_DETAILED.md](./README_DETAILED.md) pour :
- Architecture détaillée
- Guide des composants
- Patterns avancés
- Exemples de code
- Tutoriels spécifiques

## 🤝 Contribution

Consultez [CONTRIBUTING.md](../CONTRIBUTING.md) dans le dossier racine pour les guidelines de contribution.

## 📞 Support et Contact

Pour toute question ou problème :
- Créer une issue sur GitHub
- Consulter la documentation détaillée
- Contacter l'équipe de développement

## 📄 Licence

ISC

---

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd) 
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

---

**Développé avec ❤️ pour Schoman**
