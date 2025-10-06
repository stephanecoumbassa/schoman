<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">📆 Événements</h1>
      <button
        v-if="canManageEvents"
        @click="openCreateModal"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
      >
        <span class="text-xl">+</span>
        Nouvel événement
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-md p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select
            v-model="filters.eventType"
            @change="fetchEvents"
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Tous les types</option>
            <option value="meeting">Réunion</option>
            <option value="celebration">Célébration</option>
            <option value="outing">Sortie</option>
            <option value="conference">Conférence</option>
            <option value="exam">Examen</option>
            <option value="holiday">Vacances</option>
            <option value="other">Autre</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Statut</label>
          <select
            v-model="filters.status"
            @change="fetchEvents"
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Tous les statuts</option>
            <option value="planned">Planifié</option>
            <option value="ongoing">En cours</option>
            <option value="completed">Terminé</option>
            <option value="cancelled">Annulé</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Recherche</label>
          <input
            v-model="filters.search"
            @input="debouncedSearch"
            type="text"
            placeholder="Rechercher..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div class="flex items-end">
          <button
            @click="resetFilters"
            class="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md"
          >
            Réinitialiser
          </button>
        </div>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div v-if="stats" class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="text-sm text-gray-600">Total événements</div>
        <div class="text-3xl font-bold text-blue-600">{{ stats.totalEvents }}</div>
      </div>
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="text-sm text-gray-600">À venir</div>
        <div class="text-3xl font-bold text-green-600">{{ stats.upcomingEvents }}</div>
      </div>
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="text-sm text-gray-600">En cours</div>
        <div class="text-3xl font-bold text-orange-600">{{ stats.ongoingEvents }}</div>
      </div>
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="text-sm text-gray-600">Terminés</div>
        <div class="text-3xl font-bold text-gray-600">{{ stats.completedEvents }}</div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="text-gray-600">Chargement...</div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <p class="text-red-600">{{ error }}</p>
    </div>

    <!-- Events List -->
    <div v-else class="bg-white rounded-lg shadow-md overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Titre</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lieu</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="event in events" :key="event._id" class="hover:bg-gray-50">
              <td class="px-6 py-4">
                <div class="font-medium text-gray-900">{{ event.title }}</div>
                <div v-if="event.description" class="text-sm text-gray-500">{{ truncate(event.description, 50) }}</div>
              </td>
              <td class="px-6 py-4 text-sm">
                <span :class="getEventTypeColor(event.eventType)" class="px-2 py-1 rounded-full text-xs">
                  {{ getEventTypeLabel(event.eventType) }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-900">
                <div>{{ formatDate(event.startDate) }}</div>
                <div class="text-xs text-gray-500">{{ formatTime(event.startDate) }} - {{ formatTime(event.endDate) }}</div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-900">{{ event.location || '-' }}</td>
              <td class="px-6 py-4 text-sm">
                <span :class="getStatusColor(event.status)" class="px-2 py-1 rounded-full text-xs">
                  {{ getStatusLabel(event.status) }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm">
                <div class="flex gap-2">
                  <button
                    @click="viewEvent(event)"
                    class="text-blue-600 hover:text-blue-800"
                    title="Voir détails"
                  >
                    👁️
                  </button>
                  <button
                    v-if="canManageEvents"
                    @click="editEvent(event)"
                    class="text-green-600 hover:text-green-800"
                    title="Modifier"
                  >
                    ✏️
                  </button>
                  <button
                    v-if="canManageEvents && event.status === 'planned'"
                    @click="deleteEvent(event._id)"
                    class="text-red-600 hover:text-red-800"
                    title="Supprimer"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination" class="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
        <div class="text-sm text-gray-700">
          {{ (pagination.page - 1) * pagination.limit + 1 }} - 
          {{ Math.min(pagination.page * pagination.limit, pagination.total) }} sur {{ pagination.total }}
        </div>
        <div class="flex gap-2">
          <button
            @click="changePage(pagination.page - 1)"
            :disabled="pagination.page === 1"
            class="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Précédent
          </button>
          <button
            @click="changePage(pagination.page + 1)"
            :disabled="pagination.page >= pagination.pages"
            class="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <h2 class="text-2xl font-bold mb-4">
            {{ isEditing ? 'Modifier l\'événement' : 'Nouvel événement' }}
          </h2>
          
          <form @submit.prevent="submitForm" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
              <input
                v-model="form.title"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                v-model="form.description"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md"
              ></textarea>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <select
                  v-model="form.eventType"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="meeting">Réunion</option>
                  <option value="celebration">Célébration</option>
                  <option value="outing">Sortie</option>
                  <option value="conference">Conférence</option>
                  <option value="exam">Examen</option>
                  <option value="holiday">Vacances</option>
                  <option value="other">Autre</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Lieu</label>
                <input
                  v-model="form.location"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Date de début *</label>
                <input
                  v-model="form.startDate"
                  type="datetime-local"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Date de fin *</label>
                <input
                  v-model="form.endDate"
                  type="datetime-local"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Participants max</label>
              <input
                v-model.number="form.maxParticipants"
                type="number"
                min="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div v-if="isEditing">
              <label class="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select
                v-model="form.status"
                class="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="planned">Planifié</option>
                <option value="ongoing">En cours</option>
                <option value="completed">Terminé</option>
                <option value="cancelled">Annulé</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                v-model="form.notes"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md"
              ></textarea>
            </div>

            <div class="flex justify-end gap-2 pt-4">
              <button
                type="button"
                @click="closeModal"
                class="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
              >
                Annuler
              </button>
              <button
                type="submit"
                :disabled="submitting"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
              >
                {{ submitting ? 'En cours...' : isEditing ? 'Mettre à jour' : 'Créer' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import api from '@/services/api';
import type { Event, EventFormData, EventStats, Pagination } from '@/types';

const authStore = useAuthStore();

const events = ref<Event[]>([]);
const stats = ref<EventStats | null>(null);
const pagination = ref<Pagination | null>(null);
const loading = ref(false);
const error = ref('');
const showModal = ref(false);
const isEditing = ref(false);
const submitting = ref(false);
const editingId = ref<string>('');

const filters = ref({
  eventType: '',
  status: '',
  search: '',
  page: 1,
  limit: 10,
});

const form = ref<EventFormData>({
  title: '',
  description: '',
  eventType: 'meeting',
  startDate: '',
  endDate: '',
  location: '',
  targetAudience: ['all'],
  notes: '',
});

const canManageEvents = computed(() => {
  return authStore.userRole === 'admin' || authStore.userRole === 'teacher';
});

let searchTimeout: ReturnType<typeof setTimeout>;
const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    fetchEvents();
  }, 300);
};

const fetchEvents = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    const params: Record<string, string> = {
      page: filters.value.page.toString(),
      limit: filters.value.limit.toString(),
    };

    if (filters.value.eventType) params.eventType = filters.value.eventType;
    if (filters.value.status) params.status = filters.value.status;
    if (filters.value.search) params.search = filters.value.search;

    const response = await api.getEvents(params);
    
    if (response.error) {
      error.value = response.error;
    } else if (response.data) {
      events.value = response.data.events;
      pagination.value = response.data.pagination;
    }
  } catch (err) {
    error.value = 'Erreur lors du chargement des événements';
  } finally {
    loading.value = false;
  }
};

const fetchStats = async () => {
  try {
    const response = await api.getEventStats();
    if (response.data) {
      stats.value = response.data;
    }
  } catch (err) {
    console.error('Erreur lors du chargement des statistiques');
  }
};

const resetFilters = () => {
  filters.value = {
    eventType: '',
    status: '',
    search: '',
    page: 1,
    limit: 10,
  };
  fetchEvents();
};

const changePage = (page: number) => {
  filters.value.page = page;
  fetchEvents();
};

const openCreateModal = () => {
  isEditing.value = false;
  form.value = {
    title: '',
    description: '',
    eventType: 'meeting',
    startDate: '',
    endDate: '',
    location: '',
    targetAudience: ['all'],
    notes: '',
  };
  showModal.value = true;
};

const editEvent = (event: Event) => {
  isEditing.value = true;
  editingId.value = event._id;
  form.value = {
    title: event.title,
    description: event.description || '',
    eventType: event.eventType,
    startDate: event.startDate.slice(0, 16),
    endDate: event.endDate.slice(0, 16),
    location: event.location || '',
    targetAudience: event.targetAudience,
    maxParticipants: event.maxParticipants,
    notes: event.notes || '',
    status: event.status,
  };
  showModal.value = true;
};

const viewEvent = (event: Event) => {
  alert(`Événement: ${event.title}\nType: ${getEventTypeLabel(event.eventType)}\nDate: ${formatDate(event.startDate)}\nLieu: ${event.location || 'Non spécifié'}\nStatut: ${getStatusLabel(event.status)}`);
};

const closeModal = () => {
  showModal.value = false;
  isEditing.value = false;
  editingId.value = '';
};

const submitForm = async () => {
  submitting.value = true;
  error.value = '';

  try {
    let response;
    if (isEditing.value) {
      response = await api.updateEvent(editingId.value, form.value);
    } else {
      response = await api.createEvent(form.value);
    }

    if (response.error) {
      error.value = response.error;
    } else {
      closeModal();
      await fetchEvents();
      await fetchStats();
    }
  } catch (err) {
    error.value = 'Erreur lors de l\'enregistrement';
  } finally {
    submitting.value = false;
  }
};

const deleteEvent = async (id: string) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) return;

  try {
    const response = await api.deleteEvent(id);
    if (response.error) {
      error.value = response.error;
    } else {
      await fetchEvents();
      await fetchStats();
    }
  } catch (err) {
    error.value = 'Erreur lors de la suppression';
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR');
};

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

const truncate = (text: string, length: number) => {
  return text.length > length ? text.substring(0, length) + '...' : text;
};

const getEventTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    meeting: 'Réunion',
    celebration: 'Célébration',
    outing: 'Sortie',
    conference: 'Conférence',
    exam: 'Examen',
    holiday: 'Vacances',
    other: 'Autre',
  };
  return labels[type] || type;
};

const getEventTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    meeting: 'bg-blue-100 text-blue-800',
    celebration: 'bg-pink-100 text-pink-800',
    outing: 'bg-green-100 text-green-800',
    conference: 'bg-purple-100 text-purple-800',
    exam: 'bg-red-100 text-red-800',
    holiday: 'bg-yellow-100 text-yellow-800',
    other: 'bg-gray-100 text-gray-800',
  };
  return colors[type] || colors.other;
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    planned: 'Planifié',
    ongoing: 'En cours',
    completed: 'Terminé',
    cancelled: 'Annulé',
  };
  return labels[status] || status;
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    planned: 'bg-blue-100 text-blue-800',
    ongoing: 'bg-orange-100 text-orange-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return colors[status] || colors.planned;
};

onMounted(() => {
  fetchEvents();
  if (canManageEvents.value) {
    fetchStats();
  }
});
</script>
