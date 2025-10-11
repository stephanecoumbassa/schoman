<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Audit Logs</h1>
      <p class="text-gray-600 mt-1">
        Suivez toutes les actions importantes effectuées dans le système
      </p>
    </div>

    <!-- Stats Cards (Admin only) -->
    <div v-if="isAdmin && stats" class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white p-4 rounded-lg shadow">
        <div class="text-sm text-gray-600">Total Logs</div>
        <div class="text-2xl font-bold text-gray-900">{{ stats.totalLogs }}</div>
      </div>
      <div class="bg-white p-4 rounded-lg shadow">
        <div class="text-sm text-gray-600">Erreurs</div>
        <div class="text-2xl font-bold text-red-600">{{ stats.errorLogs }}</div>
      </div>
      <div class="bg-white p-4 rounded-lg shadow">
        <div class="text-sm text-gray-600">Taux de Succès</div>
        <div class="text-2xl font-bold text-green-600">{{ stats.successRate }}%</div>
      </div>
      <div class="bg-white p-4 rounded-lg shadow">
        <div class="text-sm text-gray-600">Logs par Jour</div>
        <div class="text-2xl font-bold text-blue-600">
          {{ Math.round(stats.totalLogs / Math.max(daysDiff, 1)) }}
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <!-- Search -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Recherche
          </label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Action, ressource..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            @input="debouncedSearch"
          />
        </div>

        <!-- Action Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Action
          </label>
          <select
            v-model="filters.action"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            @change="applyFilters"
          >
            <option value="">Toutes</option>
            <option value="login">Login</option>
            <option value="logout">Logout</option>
            <option value="create_student">Create Student</option>
            <option value="update_student">Update Student</option>
            <option value="delete_student">Delete Student</option>
            <option value="create_grade">Create Grade</option>
            <option value="update_grade">Update Grade</option>
          </select>
        </div>

        <!-- Resource Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Ressource
          </label>
          <select
            v-model="filters.resource"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            @change="applyFilters"
          >
            <option value="">Toutes</option>
            <option value="Auth">Auth</option>
            <option value="User">User</option>
            <option value="Student">Student</option>
            <option value="Grade">Grade</option>
            <option value="Invoice">Invoice</option>
            <option value="Transaction">Transaction</option>
          </select>
        </div>

        <!-- Method Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Méthode
          </label>
          <select
            v-model="filters.method"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            @change="applyFilters"
          >
            <option value="">Toutes</option>
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>
        </div>

        <!-- Status Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            v-model="statusFilter"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            @change="applyStatusFilter"
          >
            <option value="">Tous</option>
            <option value="success">Succès (2xx)</option>
            <option value="error">Erreurs (4xx, 5xx)</option>
          </select>
        </div>
      </div>

      <!-- Date Range -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Date de début
          </label>
          <input
            v-model="filters.startDate"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            @change="applyFilters"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Date de fin
          </label>
          <input
            v-model="filters.endDate"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            @change="applyFilters"
          />
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-between items-center mt-4">
        <button
          @click="resetFilters"
          class="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          Réinitialiser
        </button>
        <button
          v-if="isAdmin"
          @click="showDeleteDialog = true"
          class="px-4 py-2 text-sm text-red-600 bg-red-100 rounded-md hover:bg-red-200"
        >
          Supprimer anciens logs
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p class="mt-4 text-gray-600">Chargement des logs...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      {{ error }}
    </div>

    <!-- Audit Logs Table -->
    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Heure
              </th>
              <th v-if="isAdmin" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Utilisateur
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ressource
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Méthode
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Durée
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="log in logs" :key="log._id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(log.createdAt) }}
              </td>
              <td v-if="isAdmin" class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div v-if="log.user">
                  <div class="font-medium">{{ log.user.firstName }} {{ log.user.lastName }}</div>
                  <div class="text-xs text-gray-500">{{ log.user.email }}</div>
                </div>
                <span v-else class="text-gray-400">System</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span class="font-medium text-gray-900">
                  {{ formatAction(log.action) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {{ log.resource }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="px-2 py-1 text-xs font-semibold rounded"
                  :class="getMethodColor(log.method)"
                >
                  {{ log.method }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="px-2 py-1 text-xs font-semibold rounded"
                  :class="getStatusColor(log.statusCode)"
                >
                  {{ log.statusCode }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {{ log.duration ? `${log.duration}ms` : '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  @click="viewDetails(log)"
                  class="text-blue-600 hover:text-blue-900"
                >
                  Détails
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-if="logs.length === 0" class="text-center py-12">
        <svg
          class="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p class="mt-2 text-sm text-gray-500">Aucun log d'audit trouvé</p>
      </div>

      <!-- Pagination -->
      <div
        v-if="pagination && pagination.pages > 1"
        class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6"
      >
        <div class="flex-1 flex justify-between sm:hidden">
          <button
            @click="previousPage"
            :disabled="pagination.page === 1"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Précédent
          </button>
          <button
            @click="nextPage"
            :disabled="pagination.page === pagination.pages"
            class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Suivant
          </button>
        </div>
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              Affichage de
              <span class="font-medium">{{ (pagination.page - 1) * pagination.limit + 1 }}</span>
              à
              <span class="font-medium">
                {{ Math.min(pagination.page * pagination.limit, pagination.total) }}
              </span>
              sur
              <span class="font-medium">{{ pagination.total }}</span>
              résultats
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                @click="previousPage"
                :disabled="pagination.page === 1"
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                Précédent
              </button>
              <button
                @click="nextPage"
                :disabled="pagination.page === pagination.pages"
                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                Suivant
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Details Modal -->
    <div
      v-if="selectedLog"
      class="fixed inset-0 z-50 overflow-y-auto"
      @click.self="selectedLog = null"
    >
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 bg-black opacity-30"></div>
        <div class="relative bg-white rounded-lg max-w-2xl w-full p-6 shadow-xl">
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Détails du Log</h3>
            <button
              @click="selectedLog = null"
              class="text-gray-400 hover:text-gray-600"
            >
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="space-y-4">
            <div>
              <label class="text-sm font-medium text-gray-700">Date & Heure</label>
              <p class="text-sm text-gray-900">{{ formatDate(selectedLog.createdAt) }}</p>
            </div>

            <div v-if="selectedLog.user">
              <label class="text-sm font-medium text-gray-700">Utilisateur</label>
              <p class="text-sm text-gray-900">
                {{ selectedLog.user.firstName }} {{ selectedLog.user.lastName }} ({{ selectedLog.user.email }})
              </p>
            </div>

            <div>
              <label class="text-sm font-medium text-gray-700">Action</label>
              <p class="text-sm text-gray-900">{{ formatAction(selectedLog.action) }}</p>
            </div>

            <div>
              <label class="text-sm font-medium text-gray-700">Ressource</label>
              <p class="text-sm text-gray-900">{{ selectedLog.resource }}</p>
            </div>

            <div v-if="selectedLog.resourceId">
              <label class="text-sm font-medium text-gray-700">ID Ressource</label>
              <p class="text-sm text-gray-900 font-mono">{{ selectedLog.resourceId }}</p>
            </div>

            <div>
              <label class="text-sm font-medium text-gray-700">Endpoint</label>
              <p class="text-sm text-gray-900 font-mono">{{ selectedLog.method }} {{ selectedLog.endpoint }}</p>
            </div>

            <div>
              <label class="text-sm font-medium text-gray-700">Status Code</label>
              <p class="text-sm">
                <span
                  class="px-2 py-1 text-xs font-semibold rounded"
                  :class="getStatusColor(selectedLog.statusCode)"
                >
                  {{ selectedLog.statusCode }}
                </span>
              </p>
            </div>

            <div v-if="selectedLog.ipAddress">
              <label class="text-sm font-medium text-gray-700">Adresse IP</label>
              <p class="text-sm text-gray-900 font-mono">{{ selectedLog.ipAddress }}</p>
            </div>

            <div v-if="selectedLog.duration">
              <label class="text-sm font-medium text-gray-700">Durée</label>
              <p class="text-sm text-gray-900">{{ selectedLog.duration }}ms</p>
            </div>

            <div v-if="selectedLog.error">
              <label class="text-sm font-medium text-gray-700">Erreur</label>
              <p class="text-sm text-red-600">{{ selectedLog.error }}</p>
            </div>

            <div v-if="selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0">
              <label class="text-sm font-medium text-gray-700">Métadonnées</label>
              <pre class="text-xs text-gray-900 bg-gray-50 p-2 rounded overflow-x-auto">{{ JSON.stringify(selectedLog.metadata, null, 2) }}</pre>
            </div>
          </div>

          <div class="mt-6 flex justify-end">
            <button
              @click="selectedLog = null"
              class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Dialog -->
    <div
      v-if="showDeleteDialog"
      class="fixed inset-0 z-50 overflow-y-auto"
      @click.self="showDeleteDialog = false"
    >
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 bg-black opacity-30"></div>
        <div class="relative bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Supprimer les anciens logs</h3>
          <p class="text-sm text-gray-600 mb-4">
            Supprimer tous les logs d'audit de plus de :
          </p>
          <input
            v-model.number="deleteAfterDays"
            type="number"
            min="1"
            class="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
          />
          <p class="text-xs text-gray-500 mb-4">jours</p>

          <div class="flex justify-end space-x-3">
            <button
              @click="showDeleteDialog = false"
              class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Annuler
            </button>
            <button
              @click="deleteOldLogs"
              class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import auditLogService, { type AuditLog, type AuditLogFilters, type AuditLogStats } from '../services/auditLogService';

const authStore = useAuthStore();
const isAdmin = computed(() => authStore.user?.role === 'admin');

const logs = ref<AuditLog[]>([]);
const stats = ref<AuditLogStats | null>(null);
const pagination = ref<any>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const selectedLog = ref<AuditLog | null>(null);
const showDeleteDialog = ref(false);
const deleteAfterDays = ref(365);
const statusFilter = ref('');

const filters = ref<AuditLogFilters>({
  page: 1,
  limit: 50,
  search: '',
  action: '',
  resource: '',
  method: '',
  startDate: '',
  endDate: ''
});

const daysDiff = computed(() => {
  if (!filters.value.startDate || !filters.value.endDate) return 30;
  const start = new Date(filters.value.startDate);
  const end = new Date(filters.value.endDate);
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
});

const loadAuditLogs = async () => {
  loading.value = true;
  error.value = null;

  try {
    const response = isAdmin.value
      ? await auditLogService.getAuditLogs(filters.value)
      : await auditLogService.getMyAuditLogs(filters.value);

    if (response) {
      logs.value = response.logs;
      pagination.value = response.pagination;
    }
  } catch (err: any) {
    error.value = err.message || 'Erreur lors du chargement des logs';
    console.error('Error loading audit logs:', err);
  } finally {
    loading.value = false;
  }
};

const loadStats = async () => {
  if (!isAdmin.value) return;

  try {
    const statsData = await auditLogService.getAuditStats({
      startDate: filters.value.startDate,
      endDate: filters.value.endDate
    });
    if (statsData) {
      stats.value = statsData;
    }
  } catch (err) {
    console.error('Error loading stats:', err);
  }
};

const applyFilters = () => {
  filters.value.page = 1;
  loadAuditLogs();
  if (isAdmin.value) {
    loadStats();
  }
};

const applyStatusFilter = () => {
  if (statusFilter.value === 'success') {
    filters.value.statusCodeMin = 200;
    filters.value.statusCodeMax = 299;
  } else if (statusFilter.value === 'error') {
    filters.value.statusCodeMin = 400;
    filters.value.statusCodeMax = undefined;
  } else {
    filters.value.statusCodeMin = undefined;
    filters.value.statusCodeMax = undefined;
  }
  applyFilters();
};

let searchTimeout: ReturnType<typeof setTimeout>;
const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    applyFilters();
  }, 500);
};

const resetFilters = () => {
  filters.value = {
    page: 1,
    limit: 50,
    search: '',
    action: '',
    resource: '',
    method: '',
    startDate: '',
    endDate: ''
  };
  statusFilter.value = '';
  applyFilters();
};

const previousPage = () => {
  if (filters.value.page && filters.value.page > 1) {
    filters.value.page--;
    loadAuditLogs();
  }
};

const nextPage = () => {
  if (filters.value.page && pagination.value && filters.value.page < pagination.value.pages) {
    filters.value.page++;
    loadAuditLogs();
  }
};

const viewDetails = (log: AuditLog) => {
  selectedLog.value = log;
};

const deleteOldLogs = async () => {
  try {
    const result = await auditLogService.deleteOldLogs(deleteAfterDays.value);
    if (result) {
      alert(`${result.deletedCount} logs supprimés avec succès`);
      showDeleteDialog.value = false;
      loadAuditLogs();
      if (isAdmin.value) {
        loadStats();
      }
    }
  } catch (err: any) {
    alert('Erreur lors de la suppression: ' + err.message);
  }
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

const formatAction = (action: string): string => {
  return auditLogService.formatAction(action);
};

const getStatusColor = (statusCode: number): string => {
  return auditLogService.getStatusColor(statusCode);
};

const getMethodColor = (method: string): string => {
  return auditLogService.getMethodColor(method);
};

onMounted(() => {
  loadAuditLogs();
  if (isAdmin.value) {
    loadStats();
  }
});
</script>
