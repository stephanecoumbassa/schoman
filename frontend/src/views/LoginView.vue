<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 px-4">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-4xl font-extrabold text-gray-900">
          Schoman
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Système de gestion d'école
        </p>
      </div>
      <div class="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
        <h3 class="text-center text-2xl font-bold text-gray-900 mb-6">
          Connexion
        </h3>
        <form class="space-y-6" @submit.prevent="handleLogin">
          <div v-if="authStore.error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {{ authStore.error }}
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              Mot de passe
            </label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <button
              type="submit"
              :disabled="authStore.loading"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="!authStore.loading">Se connecter</span>
              <span v-else class="flex items-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connexion...
              </span>
            </button>
          </div>
        </form>

        <div class="mt-6">
          <p class="text-center text-sm text-gray-600">
            Première visite?
            <router-link to="/register" class="font-medium text-blue-600 hover:text-blue-500">
              Créer un compte
            </router-link>
          </p>
        </div>

        <!-- Demo Credentials -->
        <div class="mt-6 border-t border-gray-200 pt-6">
          <p class="text-xs text-gray-500 text-center mb-2">Comptes de démonstration:</p>
          <div class="text-xs text-gray-600 space-y-1">
            <p><strong>Admin:</strong> admin@schoman.com / admin123</p>
            <p><strong>Enseignant:</strong> teacher@schoman.com / teacher123</p>
            <p><strong>Élève:</strong> student@schoman.com / student123</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');

async function handleLogin() {
  const success = await authStore.login(email.value, password.value);
  if (success) {
    router.push('/dashboard');
  }
}
</script>
