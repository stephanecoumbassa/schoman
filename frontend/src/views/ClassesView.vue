<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8 flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Gestion des Classes</h1>
          <p class="mt-2 text-sm text-gray-600">
            Gérez les classes et leurs affectations
          </p>
        </div>
        <router-link
          to="/dashboard"
          class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
        >
          ← Retour au tableau de bord
        </router-link>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Recherche</label>
            <input
              v-model="filters.search"
              @input="debouncedSearch"
              type="text"
              placeholder="Nom de la classe..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Niveau</label>
            <select
              v-model="filters.level"
              @change="fetchClasses"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tous les niveaux</option>
              <option value="Maternelle">Maternelle</option>
              <option value="CP">CP</option>
              <option value="CE1">CE1</option>
              <option value="CE2">CE2</option>
              <option value="CM1">CM1</option>
              <option value="CM2">CM2</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Année scolaire</label>
            <select
              v-model="filters.academicYear"
              @change="fetchClasses"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Toutes les années</option>
              <option value="2024-2025">2024-2025</option>
              <option value="2023-2024">2023-2024</option>
              <option value="2022-2023">2022-2023</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Statut</label>
            <select
              v-model="filters.isActive"
              @change="fetchClasses"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tous</option>
              <option value="true">Actives</option>
              <option value="false">Inactives</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <!-- Classes List -->
      <div v-else class="bg-white rounded-lg shadow overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Classe
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Niveau
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Année scolaire
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Enseignant
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Capacité
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Salle
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="classItem in classes" :key="classItem._id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ classItem.name }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ classItem.level }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ classItem.academicYear }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">
                    {{ classItem.mainTeacher ? `${classItem.mainTeacher.firstName} ${classItem.mainTeacher.lastName}` : 'Non assigné' }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">
                    {{ classItem.currentEnrollment || 0 }} / {{ classItem.maxCapacity }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ classItem.room || '-' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="[
                      'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                      classItem.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800',
                    ]"
                  >
                    {{ classItem.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    @click="viewClass(classItem._id)"
                    class="text-blue-600 hover:text-blue-900"
                  >
                    Voir
                  </button>
                  <button
                    v-if="canManage"
                    @click="deleteClassItem(classItem._id)"
                    class="text-red-600 hover:text-red-900"
                  >
                    Désactiver
                  </button>
                </td>
              </tr>
              <tr v-if="classes.length === 0">
                <td colspan="8" class="px-6 py-4 text-center text-sm text-gray-500">
                  Aucune classe trouvée
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.total > 0" class="bg-gray-50 px-6 py-3 flex items-center justify-between">
          <div class="text-sm text-gray-700">
            Affichage {{ (pagination.page - 1) * pagination.limit + 1 }} à
            {{ Math.min(pagination.page * pagination.limit, pagination.total) }} sur
            {{ pagination.total }} résultats
          </div>
          <div class="flex space-x-2">
            <button
              @click="previousPage"
              :disabled="pagination.page === 1"
              :class="[
                'px-3 py-1 rounded',
                pagination.page === 1
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700',
              ]"
            >
              Précédent
            </button>
            <button
              @click="nextPage"
              :disabled="pagination.page >= pagination.pages"
              :class="[
                'px-3 py-1 rounded',
                pagination.page >= pagination.pages
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700',
              ]"
            >
              Suivant
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { api } from '../services/api';
import type { Class } from '@/types';

const router = useRouter();
const authStore = useAuthStore();

const loading = ref(true);
const classes = ref<Class[]>([]);
const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  pages: 0,
});

const filters = ref({
  search: '',
  level: '',
  academicYear: '',
  isActive: '',
});

const canManage = computed(() => {
  return authStore.user?.role === 'admin' || authStore.user?.role === 'teacher';
});

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

const debouncedSearch = () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  debounceTimer = setTimeout(() => {
    fetchClasses();
  }, 500);
};

const fetchClasses = async () => {
  loading.value = true;
  const params: {
    page: number;
    limit: number;
    search?: string;
    level?: string;
    academicYear?: string;
    isActive?: boolean;
  } = {
    page: pagination.value.page,
    limit: pagination.value.limit,
  };

  if (filters.value.search) params.search = filters.value.search;
  if (filters.value.level) params.level = filters.value.level;
  if (filters.value.academicYear) params.academicYear = filters.value.academicYear;
  if (filters.value.isActive !== '') params.isActive = filters.value.isActive === 'true';

  const response = await api.getClasses(params);
  if (response.data) {
    classes.value = response.data.classes;
    pagination.value = response.data.pagination;
  }
  loading.value = false;
};

const viewClass = (id: string) => {
  router.push(`/classes/${id}`);
};

const deleteClassItem = async (id: string) => {
  if (confirm('Êtes-vous sûr de vouloir désactiver cette classe ?')) {
    await api.deleteClass(id);
    fetchClasses();
  }
};

const previousPage = () => {
  if (pagination.value.page > 1) {
    pagination.value.page--;
    fetchClasses();
  }
};

const nextPage = () => {
  if (pagination.value.page < pagination.value.pages) {
    pagination.value.page++;
    fetchClasses();
  }
};

onMounted(() => {
  fetchClasses();
});
</script>
