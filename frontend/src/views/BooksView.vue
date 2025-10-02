<template>
  <div class="min-h-screen bg-gray-100 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-3xl font-bold text-gray-900">📚 Gestion des Livres</h1>
        <button
          @click="$router.go(-1)"
          class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          ← Retour
        </button>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            v-model="filters.search"
            type="text"
            placeholder="Rechercher (titre, auteur, ISBN)..."
            class="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            v-model="filters.category"
            type="text"
            placeholder="Catégorie..."
            class="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <select
            v-model="filters.available"
            class="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Tous les livres</option>
            <option value="true">Disponibles uniquement</option>
          </select>
          <button
            @click="loadBooks"
            class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            🔍 Filtrer
          </button>
        </div>
      </div>

      <!-- Add Book Button -->
      <div v-if="canManage" class="mb-6">
        <button
          @click="showAddForm = true"
          class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          ➕ Ajouter un livre
        </button>
      </div>

      <!-- Add/Edit Form Modal -->
      <div
        v-if="showAddForm || showEditForm"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        @click.self="closeForm"
      >
        <div class="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <h2 class="text-2xl font-bold mb-6">
            {{ showEditForm ? '✏️ Modifier le livre' : '➕ Ajouter un livre' }}
          </h2>
          <form @submit.prevent="showEditForm ? updateBook() : createBook()">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Titre <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="formData.title"
                  type="text"
                  required
                  class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Auteur <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="formData.author"
                  type="text"
                  required
                  class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">ISBN</label>
                <input
                  v-model="formData.isbn"
                  type="text"
                  class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="formData.category"
                  type="text"
                  required
                  class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Éditeur</label>
                <input
                  v-model="formData.publisher"
                  type="text"
                  class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Année de publication</label>
                <input
                  v-model.number="formData.publishedYear"
                  type="number"
                  class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Quantité totale <span class="text-red-500">*</span>
                </label>
                <input
                  v-model.number="formData.totalQuantity"
                  type="number"
                  required
                  min="0"
                  class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div v-if="showEditForm">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Quantité disponible <span class="text-red-500">*</span>
                </label>
                <input
                  v-model.number="formData.availableQuantity"
                  type="number"
                  required
                  min="0"
                  class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Emplacement</label>
                <input
                  v-model="formData.location"
                  type="text"
                  class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <div class="mt-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                v-model="formData.description"
                rows="3"
                class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              ></textarea>
            </div>
            <div class="flex justify-end gap-4 mt-6">
              <button
                type="button"
                @click="closeForm"
                class="px-6 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Annuler
              </button>
              <button
                type="submit"
                :disabled="loading"
                class="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
              >
                {{ loading ? 'En cours...' : (showEditForm ? 'Modifier' : 'Créer') }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Books Table -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div v-if="loading" class="p-8 text-center">
          <p class="text-gray-600">Chargement...</p>
        </div>
        <div v-else-if="error" class="p-8 text-center">
          <p class="text-red-600">{{ error }}</p>
          <button @click="loadBooks" class="mt-4 text-purple-600 hover:underline">
            Réessayer
          </button>
        </div>
        <div v-else-if="books.length === 0" class="p-8 text-center">
          <p class="text-gray-600">Aucun livre trouvé</p>
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Titre</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Auteur</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catégorie</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ISBN</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Disponible</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Emplacement</th>
                <th v-if="canManage" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="book in books" :key="book._id" class="hover:bg-gray-50">
                <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ book.title }}</td>
                <td class="px-6 py-4 text-sm text-gray-500">{{ book.author }}</td>
                <td class="px-6 py-4 text-sm">
                  <span class="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                    {{ book.category }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">{{ book.isbn || '-' }}</td>
                <td class="px-6 py-4 text-sm">
                  <span
                    :class="[
                      'px-2 py-1 text-xs font-medium rounded',
                      book.availableQuantity > 0
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800',
                    ]"
                  >
                    {{ book.availableQuantity }} / {{ book.totalQuantity }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">{{ book.location || '-' }}</td>
                <td v-if="canManage" class="px-6 py-4 text-sm">
                  <div class="flex gap-2">
                    <button
                      @click="editBook(book)"
                      class="text-blue-600 hover:text-blue-900"
                      title="Modifier"
                    >
                      ✏️
                    </button>
                    <button
                      v-if="authStore.user?.role === 'admin'"
                      @click="deleteBook(book._id)"
                      class="text-red-600 hover:text-red-900"
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
        <div v-if="pagination.pages > 1" class="bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
          <div class="text-sm text-gray-700">
            Page {{ pagination.page }} sur {{ pagination.pages }} ({{ pagination.total }} livres)
          </div>
          <div class="flex gap-2">
            <button
              @click="changePage(pagination.page - 1)"
              :disabled="pagination.page === 1"
              class="px-4 py-2 bg-white border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Précédent
            </button>
            <button
              @click="changePage(pagination.page + 1)"
              :disabled="pagination.page >= pagination.pages"
              class="px-4 py-2 bg-white border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant →
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import api from '@/services/api';

const authStore = useAuthStore();

const books = ref<any[]>([]);
const loading = ref(false);
const error = ref('');
const showAddForm = ref(false);
const showEditForm = ref(false);
const editingId = ref('');

const filters = ref({
  search: '',
  category: '',
  available: '',
});

const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  pages: 0,
});

const formData = ref({
  title: '',
  author: '',
  isbn: '',
  category: '',
  publisher: '',
  publishedYear: undefined as number | undefined,
  description: '',
  totalQuantity: 1,
  availableQuantity: 1,
  location: '',
});

const canManage = computed(() => {
  const role = authStore.user?.role;
  return role === 'admin' || role === 'teacher';
});

const loadBooks = async () => {
  loading.value = true;
  error.value = '';
  try {
    const response = await api.getBooks({
      page: pagination.value.page,
      limit: pagination.value.limit,
      search: filters.value.search || undefined,
      category: filters.value.category || undefined,
      available: filters.value.available === 'true' ? true : undefined,
    });

    if (response.error) {
      error.value = response.error;
    } else if (response.data) {
      books.value = response.data.books;
      pagination.value = response.data.pagination;
    }
  } catch (err: any) {
    error.value = err.message || 'Erreur lors du chargement des livres';
  } finally {
    loading.value = false;
  }
};

const changePage = (page: number) => {
  pagination.value.page = page;
  loadBooks();
};

const resetForm = () => {
  formData.value = {
    title: '',
    author: '',
    isbn: '',
    category: '',
    publisher: '',
    publishedYear: undefined,
    description: '',
    totalQuantity: 1,
    availableQuantity: 1,
    location: '',
  };
  editingId.value = '';
};

const closeForm = () => {
  showAddForm.value = false;
  showEditForm.value = false;
  resetForm();
};

const createBook = async () => {
  loading.value = true;
  try {
    const response = await api.createBook(formData.value);
    if (response.error) {
      alert('Erreur: ' + response.error);
    } else {
      closeForm();
      loadBooks();
    }
  } catch (err: any) {
    alert('Erreur: ' + (err.message || 'Erreur lors de la création du livre'));
  } finally {
    loading.value = false;
  }
};

const editBook = (book: any) => {
  formData.value = {
    title: book.title,
    author: book.author,
    isbn: book.isbn || '',
    category: book.category,
    publisher: book.publisher || '',
    publishedYear: book.publishedYear,
    description: book.description || '',
    totalQuantity: book.totalQuantity,
    availableQuantity: book.availableQuantity,
    location: book.location || '',
  };
  editingId.value = book._id;
  showEditForm.value = true;
};

const updateBook = async () => {
  loading.value = true;
  try {
    const response = await api.updateBook(editingId.value, formData.value);
    if (response.error) {
      alert('Erreur: ' + response.error);
    } else {
      closeForm();
      loadBooks();
    }
  } catch (err: any) {
    alert('Erreur: ' + (err.message || 'Erreur lors de la mise à jour du livre'));
  } finally {
    loading.value = false;
  }
};

const deleteBook = async (id: string) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer ce livre ?')) {
    return;
  }
  
  loading.value = true;
  try {
    const response = await api.deleteBook(id);
    if (response.error) {
      alert('Erreur: ' + response.error);
    } else {
      loadBooks();
    }
  } catch (err: any) {
    alert('Erreur: ' + (err.message || 'Erreur lors de la suppression du livre'));
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadBooks();
});
</script>
