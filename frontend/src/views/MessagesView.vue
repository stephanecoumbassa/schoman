<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">📬 Messages</h1>
      <button
        @click="openComposeModal"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
      >
        <span class="text-xl">✉️</span>
        Nouveau message
      </button>
    </div>

    <!-- Statistics Cards -->
    <div v-if="stats" class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="text-sm text-gray-600">Messages reçus</div>
        <div class="text-3xl font-bold text-blue-600">{{ stats.totalReceived }}</div>
      </div>
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="text-sm text-gray-600">Messages envoyés</div>
        <div class="text-3xl font-bold text-green-600">{{ stats.totalSent }}</div>
      </div>
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="text-sm text-gray-600">Non lus</div>
        <div class="text-3xl font-bold text-red-600">{{ stats.unreadCount }}</div>
      </div>
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="text-sm text-gray-600">Taux de lecture</div>
        <div class="text-3xl font-bold text-purple-600">{{ stats.readPercentage }}%</div>
      </div>
    </div>

    <!-- Tabs and Filters -->
    <div class="bg-white rounded-lg shadow-md p-4 mb-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <!-- Tabs -->
        <div class="flex gap-2">
          <button
            @click="changeBox('inbox')"
            :class="[
              'px-4 py-2 rounded-md transition-colors',
              filters.box === 'inbox'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
            ]"
          >
            📥 Boîte de réception
          </button>
          <button
            @click="changeBox('sent')"
            :class="[
              'px-4 py-2 rounded-md transition-colors',
              filters.box === 'sent'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
            ]"
          >
            📤 Messages envoyés
          </button>
        </div>

        <!-- Unread filter -->
        <div v-if="filters.box === 'inbox'" class="flex items-center gap-2">
          <input
            id="unread-only"
            v-model="filters.unreadOnly"
            type="checkbox"
            @change="fetchMessages"
            class="w-4 h-4"
          />
          <label for="unread-only" class="text-sm text-gray-700">Afficher uniquement les non lus</label>
        </div>
      </div>

      <!-- Filters Row -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
          <select
            v-model="filters.category"
            @change="fetchMessages"
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Toutes les catégories</option>
            <option value="general">Général</option>
            <option value="academic">Académique</option>
            <option value="administrative">Administratif</option>
            <option value="event">Événement</option>
            <option value="announcement">Annonce</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
          <select
            v-model="filters.priority"
            @change="fetchMessages"
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Toutes les priorités</option>
            <option value="low">Basse</option>
            <option value="normal">Normale</option>
            <option value="high">Haute</option>
            <option value="urgent">Urgente</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Recherche</label>
          <input
            v-model="filters.search"
            @input="debouncedSearch"
            type="text"
            placeholder="Rechercher dans les messages..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>
    </div>

    <!-- Messages List -->
    <div class="bg-white rounded-lg shadow-md">
      <div v-if="loading" class="p-8 text-center text-gray-500">Chargement...</div>
      <div v-else-if="messages.length === 0" class="p-8 text-center text-gray-500">
        Aucun message trouvé
      </div>
      <div v-else class="divide-y divide-gray-200">
        <div
          v-for="message in messages"
          :key="message._id"
          @click="viewMessage(message)"
          :class="[
            'p-4 cursor-pointer hover:bg-gray-50 transition-colors',
            !isMessageRead(message) && filters.box === 'inbox' ? 'bg-blue-50' : '',
          ]"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span
                  :class="[
                    'text-sm font-semibold',
                    !isMessageRead(message) && filters.box === 'inbox'
                      ? 'text-blue-900'
                      : 'text-gray-900',
                  ]"
                >
                  {{
                    filters.box === 'sent'
                      ? `À: ${message.recipients.map((r) => `${r.firstName} ${r.lastName}`).join(', ')}`
                      : `De: ${message.sender.firstName} ${message.sender.lastName}`
                  }}
                </span>
                <span
                  :class="[
                    'text-xs px-2 py-0.5 rounded-full',
                    getPriorityClass(message.priority),
                  ]"
                >
                  {{ getPriorityLabel(message.priority) }}
                </span>
                <span
                  :class="[
                    'text-xs px-2 py-0.5 rounded-full',
                    getCategoryClass(message.category),
                  ]"
                >
                  {{ getCategoryLabel(message.category) }}
                </span>
              </div>
              <div
                :class="[
                  'text-base mb-1',
                  !isMessageRead(message) && filters.box === 'inbox'
                    ? 'font-semibold text-gray-900'
                    : 'text-gray-800',
                ]"
              >
                {{ message.subject }}
              </div>
              <div class="text-sm text-gray-600 line-clamp-2">
                {{ message.content }}
              </div>
            </div>
            <div class="ml-4 text-sm text-gray-500 whitespace-nowrap">
              {{ formatDate(message.createdAt) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="pagination && pagination.pages > 1" class="p-4 border-t border-gray-200">
        <div class="flex justify-between items-center">
          <button
            @click="changePage(pagination.page - 1)"
            :disabled="pagination.page === 1"
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Précédent
          </button>
          <span class="text-gray-700">
            Page {{ pagination.page }} sur {{ pagination.pages }}
          </span>
          <button
            @click="changePage(pagination.page + 1)"
            :disabled="pagination.page >= pagination.pages"
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>

    <!-- Compose Modal -->
    <div
      v-if="showComposeModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-bold text-gray-800">Nouveau message</h2>
            <button @click="closeComposeModal" class="text-gray-500 hover:text-gray-700">✕</button>
          </div>

          <form @submit.prevent="sendMessage">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Destinataires <span class="text-red-500">*</span>
              </label>
              <select
                v-model="form.recipients"
                multiple
                size="5"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option v-for="user in availableUsers" :key="user.id" :value="user.id">
                  {{ user.firstName }} {{ user.lastName }} ({{ user.role }})
                </option>
              </select>
              <p class="text-xs text-gray-500 mt-1">
                Maintenez Ctrl/Cmd pour sélectionner plusieurs destinataires
              </p>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
                <select
                  v-model="form.priority"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="low">Basse</option>
                  <option value="normal">Normale</option>
                  <option value="high">Haute</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                <select
                  v-model="form.category"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="general">Général</option>
                  <option value="academic">Académique</option>
                  <option value="administrative">Administratif</option>
                  <option value="event">Événement</option>
                  <option value="announcement">Annonce</option>
                </select>
              </div>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Sujet <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.subject"
                type="text"
                required
                maxlength="200"
                class="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Message <span class="text-red-500">*</span>
              </label>
              <textarea
                v-model="form.content"
                required
                maxlength="5000"
                rows="8"
                class="w-full px-3 py-2 border border-gray-300 rounded-md"
              ></textarea>
              <p class="text-xs text-gray-500 mt-1">
                {{ form.content.length }}/5000 caractères
              </p>
            </div>

            <div class="flex justify-end gap-2">
              <button
                type="button"
                @click="closeComposeModal"
                class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Annuler
              </button>
              <button
                type="submit"
                :disabled="sending"
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {{ sending ? 'Envoi...' : 'Envoyer' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- View Message Modal -->
    <div
      v-if="showViewModal && selectedMessage"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-start mb-4">
            <div class="flex-1">
              <h2 class="text-2xl font-bold text-gray-800 mb-2">{{ selectedMessage.subject }}</h2>
              <div class="flex items-center gap-2 mb-2">
                <span
                  :class="[
                    'text-xs px-2 py-0.5 rounded-full',
                    getPriorityClass(selectedMessage.priority),
                  ]"
                >
                  {{ getPriorityLabel(selectedMessage.priority) }}
                </span>
                <span
                  :class="[
                    'text-xs px-2 py-0.5 rounded-full',
                    getCategoryClass(selectedMessage.category),
                  ]"
                >
                  {{ getCategoryLabel(selectedMessage.category) }}
                </span>
              </div>
            </div>
            <button @click="closeViewModal" class="text-gray-500 hover:text-gray-700">✕</button>
          </div>

          <div class="border-t border-b border-gray-200 py-4 mb-4 space-y-2">
            <div class="flex gap-2">
              <span class="font-semibold text-gray-700">De:</span>
              <span class="text-gray-600">
                {{ selectedMessage.sender.firstName }} {{ selectedMessage.sender.lastName }}
                ({{ selectedMessage.sender.email }})
              </span>
            </div>
            <div class="flex gap-2">
              <span class="font-semibold text-gray-700">À:</span>
              <span class="text-gray-600">
                {{
                  selectedMessage.recipients
                    .map((r) => `${r.firstName} ${r.lastName}`)
                    .join(', ')
                }}
              </span>
            </div>
            <div class="flex gap-2">
              <span class="font-semibold text-gray-700">Date:</span>
              <span class="text-gray-600">{{ formatDate(selectedMessage.createdAt) }}</span>
            </div>
          </div>

          <div class="prose max-w-none mb-6 whitespace-pre-wrap">
            {{ selectedMessage.content }}
          </div>

          <div class="flex justify-between items-center pt-4 border-t border-gray-200">
            <div class="flex gap-2">
              <button
                v-if="filters.box === 'inbox'"
                @click="replyToMessage"
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                ↩️ Répondre
              </button>
              <button
                @click="archiveCurrentMessage"
                class="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
              >
                📦 Archiver
              </button>
              <button
                v-if="canDeleteMessage(selectedMessage)"
                @click="confirmDeleteMessage"
                class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                🗑️ Supprimer
              </button>
            </div>
            <button
              @click="closeViewModal"
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { api } from '@/services/api';
import type { Message, MessageFormData, MessageStats, Pagination, User } from '@/types';

const messages = ref<Message[]>([]);
const stats = ref<MessageStats | null>(null);
const pagination = ref<Pagination | null>(null);
const loading = ref(false);
const sending = ref(false);
const showComposeModal = ref(false);
const showViewModal = ref(false);
const selectedMessage = ref<Message | null>(null);
const availableUsers = ref<User[]>([]);

const currentUser = computed(() => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
});

const filters = ref({
  box: 'inbox' as 'inbox' | 'sent',
  category: '',
  priority: '',
  search: '',
  unreadOnly: false,
  page: 1,
  limit: 20,
});

const form = ref<MessageFormData>({
  subject: '',
  content: '',
  recipients: [],
  priority: 'normal',
  category: 'general',
});

let searchTimeout: ReturnType<typeof setTimeout>;

const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    filters.value.page = 1;
    fetchMessages();
  }, 500);
};

const fetchMessages = async () => {
  try {
    loading.value = true;
    const params: any = {
      box: filters.value.box,
      page: filters.value.page,
      limit: filters.value.limit,
    };

    if (filters.value.category) params.category = filters.value.category;
    if (filters.value.priority) params.priority = filters.value.priority;
    if (filters.value.search) params.search = filters.value.search;
    if (filters.value.unreadOnly) params.unreadOnly = 'true';

    const response = await api.getMessages(params);
    messages.value = response.data?.messages || [];
    pagination.value = response.data?.pagination || null;
  } catch (error) {
    console.error('Error fetching messages:', error);
  } finally {
    loading.value = false;
  }
};

const fetchStats = async () => {
  try {
    const response = await api.getMessageStats();
    stats.value = response.data || null;
  } catch (error) {
    console.error('Error fetching stats:', error);
  }
};

const fetchAvailableUsers = async () => {
  try {
    // Fetch all users (you may need to add this endpoint)
    // For now, this is a placeholder
    availableUsers.value = [];
  } catch (error) {
    console.error('Error fetching users:', error);
  }
};

const changeBox = (box: 'inbox' | 'sent') => {
  filters.value.box = box;
  filters.value.page = 1;
  fetchMessages();
};

const changePage = (page: number) => {
  filters.value.page = page;
  fetchMessages();
};

const openComposeModal = () => {
  form.value = {
    subject: '',
    content: '',
    recipients: [],
    priority: 'normal',
    category: 'general',
  };
  showComposeModal.value = true;
};

const closeComposeModal = () => {
  showComposeModal.value = false;
};

const sendMessage = async () => {
  try {
    sending.value = true;
    await api.createMessage(form.value);
    closeComposeModal();
    await fetchMessages();
    await fetchStats();
  } catch (error) {
    console.error('Error sending message:', error);
    alert('Erreur lors de l\'envoi du message');
  } finally {
    sending.value = false;
  }
};

const viewMessage = async (message: Message) => {
  selectedMessage.value = message;
  showViewModal.value = true;

  // Mark as read if viewing from inbox and not already read
  if (filters.value.box === 'inbox' && !isMessageRead(message)) {
    try {
      await api.markMessageAsRead(message._id);
      // Refresh messages and stats
      await Promise.all([fetchMessages(), fetchStats()]);
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  }
};

const closeViewModal = () => {
  showViewModal.value = false;
  selectedMessage.value = null;
};

const replyToMessage = () => {
  if (!selectedMessage.value) return;

  form.value = {
    subject: `Re: ${selectedMessage.value.subject}`,
    content: '',
    recipients: [selectedMessage.value.sender._id],
    priority: selectedMessage.value.priority,
    category: selectedMessage.value.category,
    parentMessage: selectedMessage.value._id,
  };

  closeViewModal();
  showComposeModal.value = true;
};

const archiveCurrentMessage = async () => {
  if (!selectedMessage.value) return;

  try {
    await api.archiveMessage(selectedMessage.value._id);
    closeViewModal();
    await fetchMessages();
    await fetchStats();
  } catch (error) {
    console.error('Error archiving message:', error);
    alert('Erreur lors de l\'archivage du message');
  }
};

const confirmDeleteMessage = async () => {
  if (!selectedMessage.value) return;

  if (confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
    try {
      await api.deleteMessage(selectedMessage.value._id);
      closeViewModal();
      await fetchMessages();
      await fetchStats();
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Erreur lors de la suppression du message');
    }
  }
};

const canDeleteMessage = (message: Message): boolean => {
  if (!currentUser.value) return false;
  return (
    message.sender._id === currentUser.value.id || currentUser.value.role === 'admin'
  );
};

const isMessageRead = (message: Message): boolean => {
  if (!currentUser.value) return false;
  return message.readBy.some((r) => r.user === currentUser.value.id);
};

const formatDate = (date: string): string => {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) {
    return `Il y a ${diffMins} min`;
  } else if (diffHours < 24) {
    return `Il y a ${diffHours}h`;
  } else if (diffDays < 7) {
    return `Il y a ${diffDays}j`;
  } else {
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  }
};

const getPriorityClass = (priority: string): string => {
  const classes: Record<string, string> = {
    low: 'bg-gray-200 text-gray-700',
    normal: 'bg-blue-200 text-blue-700',
    high: 'bg-orange-200 text-orange-700',
    urgent: 'bg-red-200 text-red-700',
  };
  return (classes[priority] ?? classes['normal']) as string;
};

const getPriorityLabel = (priority: string): string => {
  const labels: Record<string, string> = {
    low: 'Basse',
    normal: 'Normale',
    high: 'Haute',
    urgent: 'Urgente',
  };
  return labels[priority] ?? priority;
};

const getCategoryClass = (category: string): string => {
  const classes: Record<string, string> = {
    general: 'bg-gray-200 text-gray-700',
    academic: 'bg-green-200 text-green-700',
    administrative: 'bg-purple-200 text-purple-700',
    event: 'bg-yellow-200 text-yellow-700',
    announcement: 'bg-pink-200 text-pink-700',
  };
  return (classes[category] ?? classes['general']) as string;
};

const getCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    general: 'Général',
    academic: 'Académique',
    administrative: 'Administratif',
    event: 'Événement',
    announcement: 'Annonce',
  };
  return labels[category] ?? category;
};

onMounted(async () => {
  await Promise.all([fetchMessages(), fetchStats(), fetchAvailableUsers()]);
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
