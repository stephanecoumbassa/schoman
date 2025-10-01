<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }

  try {
    await authStore.fetchProfile();
  } catch (error) {
    console.error('Error fetching profile:', error);
    router.push('/login');
  }
});

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <h1 class="text-xl font-bold text-indigo-600">Schoman</h1>
            </div>
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <router-link
                to="/dashboard"
                class="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Dashboard
              </router-link>
              <router-link
                to="/students"
                class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Étudiants
              </router-link>
              <router-link
                to="/teachers"
                class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Enseignants
              </router-link>
              <router-link
                to="/classes"
                class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Classes
              </router-link>
            </div>
          </div>
          <div class="flex items-center">
            <div class="ml-3 relative">
              <div class="flex items-center space-x-4">
                <span class="text-sm text-gray-700">
                  {{ authStore.user?.firstName }} {{ authStore.user?.lastName }}
                  <span class="text-xs text-gray-500">({{ authStore.user?.role }})</span>
                </span>
                <button
                  @click="handleLogout"
                  class="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="py-10">
      <header>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 class="text-3xl font-bold leading-tight text-gray-900">Tableau de bord</h1>
        </div>
      </header>
      <main>
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <!-- Stats -->
          <div class="mt-8">
            <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <!-- Stat Card 1 -->
              <div class="bg-white overflow-hidden shadow rounded-lg">
                <div class="px-4 py-5 sm:p-6">
                  <dt class="text-sm font-medium text-gray-500 truncate">Total Étudiants</dt>
                  <dd class="mt-1 text-3xl font-semibold text-gray-900">0</dd>
                </div>
              </div>

              <!-- Stat Card 2 -->
              <div class="bg-white overflow-hidden shadow rounded-lg">
                <div class="px-4 py-5 sm:p-6">
                  <dt class="text-sm font-medium text-gray-500 truncate">Total Enseignants</dt>
                  <dd class="mt-1 text-3xl font-semibold text-gray-900">0</dd>
                </div>
              </div>

              <!-- Stat Card 3 -->
              <div class="bg-white overflow-hidden shadow rounded-lg">
                <div class="px-4 py-5 sm:p-6">
                  <dt class="text-sm font-medium text-gray-500 truncate">Classes</dt>
                  <dd class="mt-1 text-3xl font-semibold text-gray-900">0</dd>
                </div>
              </div>

              <!-- Stat Card 4 -->
              <div class="bg-white overflow-hidden shadow rounded-lg">
                <div class="px-4 py-5 sm:p-6">
                  <dt class="text-sm font-medium text-gray-500 truncate">Revenus ce mois</dt>
                  <dd class="mt-1 text-3xl font-semibold text-gray-900">0 €</dd>
                </div>
              </div>
            </div>
          </div>

          <!-- Welcome Message -->
          <div class="mt-8 bg-white shadow rounded-lg p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">
              Bienvenue, {{ authStore.user?.firstName }} !
            </h2>
            <p class="text-gray-600">
              Bienvenue sur votre système de gestion scolaire Schoman. Utilisez le menu de navigation
              ci-dessus pour accéder aux différents modules de l'application.
            </p>
            <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <router-link
                to="/students"
                class="block p-4 border border-gray-200 rounded-lg hover:border-indigo-500 hover:shadow-md transition-all"
              >
                <h3 class="font-semibold text-gray-900">Gestion des Étudiants</h3>
                <p class="text-sm text-gray-600 mt-1">
                  Gérer les inscriptions, les informations et le suivi des étudiants
                </p>
              </router-link>
              <router-link
                to="/teachers"
                class="block p-4 border border-gray-200 rounded-lg hover:border-indigo-500 hover:shadow-md transition-all"
              >
                <h3 class="font-semibold text-gray-900">Gestion des Enseignants</h3>
                <p class="text-sm text-gray-600 mt-1">
                  Gérer le personnel enseignant et leurs affectations
                </p>
              </router-link>
              <router-link
                to="/classes"
                class="block p-4 border border-gray-200 rounded-lg hover:border-indigo-500 hover:shadow-md transition-all"
              >
                <h3 class="font-semibold text-gray-900">Gestion des Classes</h3>
                <p class="text-sm text-gray-600 mt-1">
                  Organiser les classes, niveaux et matières
                </p>
              </router-link>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
