<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8 flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Gestion des élèves</h1>
          <p class="mt-2 text-sm text-gray-600">
            Liste complète des élèves inscrits
          </p>
        </div>
        <div class="flex space-x-4">
          <router-link
            to="/dashboard"
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Retour
          </router-link>
          <button
            v-if="canManageStudents"
            @click="showAddModal = true"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Ajouter un élève
          </button>
        </div>
      </div>

      <!-- Search and Filters -->
      <div class="bg-white rounded-lg shadow p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Recherche</label>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Nom, email..."
              @input="debouncedSearch"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Niveau</label>
            <select
              v-model="selectedLevel"
              @change="fetchStudents"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
            <label class="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select
              v-model="activeFilter"
              @change="fetchStudents"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tous</option>
              <option value="true">Actifs</option>
              <option value="false">Inactifs</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <!-- Students Table -->
      <div v-else class="bg-white rounded-lg shadow overflow-hidden">
        <div v-if="students.length === 0" class="text-center py-12">
          <p class="text-gray-500">Aucun élève trouvé</p>
        </div>
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  N° Élève
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom complet
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Niveau
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th v-if="canManageStudents" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="student in students" :key="student._id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ student.studentNumber }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">
                    {{ student.userId?.firstName }} {{ student.userId?.lastName }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ student.userId?.email }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {{ student.level || 'Non défini' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="student.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                  >
                    {{ student.isActive ? 'Actif' : 'Inactif' }}
                  </span>
                </td>
                <td v-if="canManageStudents" class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    @click="viewStudent(student)"
                    class="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    Voir
                  </button>
                  <button
                    v-if="authStore.userRole === 'admin'"
                    @click="deleteStudent(student)"
                    class="text-red-600 hover:text-red-900"
                  >
                    Désactiver
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="pagination" class="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
          <div class="text-sm text-gray-700">
            Page {{ pagination.page }} sur {{ pagination.pages }} ({{ pagination.total }} résultats)
          </div>
          <div class="flex space-x-2">
            <button
              :disabled="pagination.page === 1"
              @click="changePage(pagination.page - 1)"
              class="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>
            <button
              :disabled="pagination.page >= pagination.pages"
              @click="changePage(pagination.page + 1)"
              class="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Student Modal (simplified placeholder) -->
    <div
      v-if="showAddModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showAddModal = false"
    >
      <div class="bg-white rounded-lg shadow-xl p-6 max-w-md w-full m-4">
        <h3 class="text-lg font-semibold mb-4">Ajouter un élève</h3>
        <p class="text-sm text-gray-600 mb-4">
          Cette fonctionnalité sera implémentée dans une prochaine version.
          Pour l'instant, vous pouvez créer des élèves via l'API.
        </p>
        <button
          @click="showAddModal = false"
          class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Fermer
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { api } from '../services/api';
import type { Student, Pagination } from '@/types';

const authStore = useAuthStore();

const loading = ref(true);
const students = ref<Student[]>([]);
const pagination = ref<Pagination | null>(null);
const searchQuery = ref('');
const selectedLevel = ref('');
const activeFilter = ref('');
const currentPage = ref(1);
const showAddModal = ref(false);

const canManageStudents = computed(() => {
  return ['admin', 'teacher'].includes(authStore.userRole || '');
});

let searchTimeout: ReturnType<typeof setTimeout> | null = null;

function debouncedSearch() {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage.value = 1;
    fetchStudents();
  }, 300);
}

async function fetchStudents() {
  loading.value = true;
  const response = await api.getStudents({
    page: currentPage.value,
    limit: 10,
    search: searchQuery.value || undefined,
    level: selectedLevel.value || undefined,
    isActive: activeFilter.value ? activeFilter.value === 'true' : undefined,
  });

  if (response.data) {
    students.value = response.data.students;
    pagination.value = response.data.pagination;
  }
  loading.value = false;
}

function changePage(page: number) {
  currentPage.value = page;
  fetchStudents();
}

function viewStudent(student: Student) {
  alert(`Détails de l'élève:\n\nNom: ${typeof student.userId !== 'string' ? student.userId.firstName : ''} ${typeof student.userId !== 'string' ? student.userId.lastName : ''}\nEmail: ${typeof student.userId !== 'string' ? student.userId.email : ''}\nNiveau: ${student.level}\nMatricule: ${student.matricule}`);
}

async function deleteStudent(student: Student) {
  const firstName = typeof student.userId !== 'string' ? student.userId.firstName : '';
  const lastName = typeof student.userId !== 'string' ? student.userId.lastName : '';
  if (!confirm(`Êtes-vous sûr de vouloir désactiver ${firstName} ${lastName}?`)) {
    return;
  }

  const response = await api.deleteStudent(student._id);
  if (!response.error) {
    alert('Élève désactivé avec succès');
    fetchStudents();
  } else {
    alert('Erreur: ' + response.error);
  }
}

onMounted(() => {
  fetchStudents();
});
</script>
