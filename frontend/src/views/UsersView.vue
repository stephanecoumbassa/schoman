<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8 flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Gestion des utilisateurs</h1>
          <p class="mt-2 text-sm text-gray-600">
            Gérer les enseignants, administrateurs et parents
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
            v-if="canManageUsers"
            @click="openAddModal"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Ajouter un utilisateur
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
            <label class="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
            <select
              v-model="selectedRole"
              @change="fetchUsers"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tous les rôles</option>
              <option value="admin">Administrateur</option>
              <option value="teacher">Enseignant</option>
              <option value="parent">Parent</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select
              v-model="activeFilter"
              @change="fetchUsers"
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

      <!-- Users Table -->
      <div v-else class="bg-white rounded-lg shadow overflow-hidden">
        <div v-if="users.length === 0" class="text-center py-12">
          <p class="text-gray-500">Aucun utilisateur trouvé</p>
        </div>
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom complet
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rôle
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Téléphone
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
              <tr v-for="user in users" :key="user._id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">
                    {{ user.firstName }} {{ user.lastName }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-500">{{ user.email }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getRoleBadgeClass(user.role)" class="px-2 py-1 text-xs rounded-full">
                    {{ getRoleLabel(user.role) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-500">{{ user.phone || 'N/A' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                  >
                    {{ user.isActive ? 'Actif' : 'Inactif' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    v-if="canManageUsers"
                    @click="openEditModal(user)"
                    class="text-blue-600 hover:text-blue-900"
                  >
                    Modifier
                  </button>
                  <button
                    v-if="canManageUsers"
                    @click="openPasswordModal(user)"
                    class="text-yellow-600 hover:text-yellow-900"
                  >
                    Mot de passe
                  </button>
                  <button
                    v-if="canManageUsers && user.role !== 'admin'"
                    @click="confirmDelete(user)"
                    class="text-red-600 hover:text-red-900"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.pages > 1" class="px-6 py-4 flex items-center justify-between border-t">
          <div class="text-sm text-gray-700">
            Page {{ pagination.page }} sur {{ pagination.pages }}
          </div>
          <div class="flex space-x-2">
            <button
              @click="changePage(pagination.page - 1)"
              :disabled="pagination.page === 1"
              class="px-3 py-1 border rounded-md disabled:opacity-50"
            >
              Précédent
            </button>
            <button
              @click="changePage(pagination.page + 1)"
              :disabled="pagination.page === pagination.pages"
              class="px-3 py-1 border rounded-md disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit User Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      @click.self="closeModal"
    >
      <div class="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div class="mb-4">
          <h3 class="text-lg font-medium leading-6 text-gray-900">
            {{ isEditing ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur' }}
          </h3>
        </div>
        <form @submit.prevent="submitForm" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
              <input
                v-model="formData.firstName"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
              <input
                v-model="formData.lastName"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              v-model="formData.email"
              type="email"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div v-if="!isEditing">
            <label class="block text-sm font-medium text-gray-700 mb-1">Mot de passe *</label>
            <input
              v-model="formData.password"
              type="password"
              :required="!isEditing"
              minlength="6"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <p class="text-xs text-gray-500 mt-1">Minimum 6 caractères</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Rôle *</label>
            <select
              v-model="formData.role"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="admin">Administrateur</option>
              <option value="teacher">Enseignant</option>
              <option value="parent">Parent</option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <input
                v-model="formData.phone"
                type="tel"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div v-if="isEditing">
              <label class="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select
                v-model="formData.isActive"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option :value="true">Actif</option>
                <option :value="false">Inactif</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
            <textarea
              v-model="formData.address"
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>

          <div class="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              :disabled="submitting"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {{ submitting ? 'Enregistrement...' : (isEditing ? 'Modifier' : 'Créer') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Password Modal -->
    <div
      v-if="showPasswordModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      @click.self="closePasswordModal"
    >
      <div class="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div class="mb-4">
          <h3 class="text-lg font-medium leading-6 text-gray-900">
            Changer le mot de passe
          </h3>
          <p class="text-sm text-gray-500 mt-1">
            Utilisateur: {{ selectedUser?.firstName }} {{ selectedUser?.lastName }}
          </p>
        </div>
        <form @submit.prevent="submitPasswordChange" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe *</label>
            <input
              v-model="newPassword"
              type="password"
              required
              minlength="6"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <p class="text-xs text-gray-500 mt-1">Minimum 6 caractères</p>
          </div>

          <div class="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              @click="closePasswordModal"
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              :disabled="submitting"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {{ submitting ? 'Enregistrement...' : 'Changer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import api from '@/services/api';
import type { User } from '@/types';

const authStore = useAuthStore();

const users = ref<User[]>([]);
const loading = ref(false);
const searchQuery = ref('');
const selectedRole = ref('');
const activeFilter = ref('');
const showModal = ref(false);
const showPasswordModal = ref(false);
const isEditing = ref(false);
const submitting = ref(false);
const selectedUser = ref<User | null>(null);
const newPassword = ref('');

const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  pages: 0,
});

const formData = ref({
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  role: 'teacher' as 'admin' | 'teacher' | 'student' | 'parent',
  phone: '',
  address: '',
  isActive: true,
});

const canManageUsers = computed(() => {
  return authStore.user?.role === 'admin';
});

let debounceTimer: ReturnType<typeof setTimeout>;

const debouncedSearch = () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    fetchUsers();
  }, 500);
};

const fetchUsers = async () => {
  loading.value = true;
  try {
    const params: any = {
      page: pagination.value.page,
      limit: pagination.value.limit,
    };

    if (searchQuery.value) params.search = searchQuery.value;
    if (selectedRole.value) params.role = selectedRole.value;
    if (activeFilter.value) params.isActive = activeFilter.value === 'true';

    const response = await api.getUsers(params);
    if (response.data) {
      users.value = response.data.users;
      pagination.value = response.data.pagination;
    }
  } catch (error) {
    console.error('Error fetching users:', error);
  } finally {
    loading.value = false;
  }
};

const changePage = (page: number) => {
  pagination.value.page = page;
  fetchUsers();
};

const openAddModal = () => {
  isEditing.value = false;
  formData.value = {
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'teacher',
    phone: '',
    address: '',
    isActive: true,
  };
  showModal.value = true;
};

const openEditModal = (user: User) => {
  isEditing.value = true;
  selectedUser.value = user;
  formData.value = {
    email: user.email,
    password: '',
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    phone: user.phone || '',
    address: user.address || '',
    isActive: user.isActive,
  };
  showModal.value = true;
};

const openPasswordModal = (user: User) => {
  selectedUser.value = user;
  newPassword.value = '';
  showPasswordModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  selectedUser.value = null;
};

const closePasswordModal = () => {
  showPasswordModal.value = false;
  selectedUser.value = null;
  newPassword.value = '';
};

const submitForm = async () => {
  submitting.value = true;
  try {
    if (isEditing.value && selectedUser.value) {
      const response = await api.updateUser(selectedUser.value._id, {
        email: formData.value.email,
        firstName: formData.value.firstName,
        lastName: formData.value.lastName,
        role: formData.value.role,
        phone: formData.value.phone,
        address: formData.value.address,
        isActive: formData.value.isActive,
      });
      if (response.error) {
        alert('Erreur: ' + response.error);
      } else {
        closeModal();
        fetchUsers();
      }
    } else {
      const response = await api.createUser(formData.value);
      if (response.error) {
        alert('Erreur: ' + response.error);
      } else {
        closeModal();
        fetchUsers();
      }
    }
  } catch (error) {
    alert('Erreur: ' + (error instanceof Error ? error.message : 'Une erreur est survenue'));
  } finally {
    submitting.value = false;
  }
};

const submitPasswordChange = async () => {
  if (!selectedUser.value) return;

  submitting.value = true;
  try {
    const response = await api.updateUserPassword(selectedUser.value._id, newPassword.value);
    if (response.error) {
      alert('Erreur: ' + response.error);
    } else {
      alert('Mot de passe changé avec succès');
      closePasswordModal();
    }
  } catch (error) {
    alert('Erreur: ' + (error instanceof Error ? error.message : 'Une erreur est survenue'));
  } finally {
    submitting.value = false;
  }
};

const confirmDelete = async (user: User) => {
  if (confirm(`Êtes-vous sûr de vouloir supprimer ${user.firstName} ${user.lastName} ?`)) {
    try {
      const response = await api.deleteUser(user._id);
      if (response.error) {
        alert('Erreur: ' + response.error);
      } else {
        fetchUsers();
      }
    } catch (error) {
      alert('Erreur: ' + (error instanceof Error ? error.message : 'Une erreur est survenue'));
    }
  }
};

const getRoleLabel = (role: string) => {
  const labels: Record<string, string> = {
    admin: 'Administrateur',
    teacher: 'Enseignant',
    parent: 'Parent',
    student: 'Élève',
  };
  return labels[role] || role;
};

const getRoleBadgeClass = (role: string) => {
  const classes: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-800',
    teacher: 'bg-blue-100 text-blue-800',
    parent: 'bg-green-100 text-green-800',
    student: 'bg-gray-100 text-gray-800',
  };
  return classes[role] || 'bg-gray-100 text-gray-800';
};

onMounted(() => {
  fetchUsers();
});
</script>
