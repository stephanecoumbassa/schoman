<template>
  <div class="min-h-screen bg-gray-100 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-3xl font-bold text-gray-900">📖 Gestion des Emprunts</h1>
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
          <select
            v-model="filters.status"
            class="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Tous les statuts</option>
            <option value="borrowed">Emprunté</option>
            <option value="returned">Retourné</option>
            <option value="overdue">En retard</option>
          </select>
          <select
            v-model="filters.student"
            class="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Tous les élèves</option>
            <option v-for="student in students" :key="student._id" :value="student._id">
              {{ typeof student.userId === 'object' ? student.userId.firstName : '' }} {{ typeof student.userId === 'object' ? student.userId.lastName : '' }}
            </option>
          </select>
          <select
            v-model="filters.book"
            class="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Tous les livres</option>
            <option v-for="book in availableBooks" :key="book._id" :value="book._id">
              {{ book.title }}
            </option>
          </select>
          <button
            @click="loadLoans"
            class="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
          >
            🔍 Filtrer
          </button>
        </div>
      </div>

      <!-- Add Loan Button -->
      <div v-if="canManage" class="mb-6">
        <button
          @click="showAddForm = true"
          class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          ➕ Enregistrer un emprunt
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
            {{ showEditForm ? '✏️ Modifier l\'emprunt' : '➕ Enregistrer un emprunt' }}
          </h2>
          <form @submit.prevent="showEditForm ? updateLoan() : createLoan()">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Livre <span class="text-red-500">*</span>
                </label>
                <select
                  v-model="formData.book"
                  required
                  :disabled="showEditForm"
                  class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Sélectionner un livre</option>
                  <option
                    v-for="book in availableBooks"
                    :key="book._id"
                    :value="book._id"
                    :disabled="!showEditForm && book.availableQuantity <= 0"
                  >
                    {{ book.title }} ({{ book.availableQuantity }} dispo)
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Élève <span class="text-red-500">*</span>
                </label>
                <select
                  v-model="formData.student"
                  required
                  :disabled="showEditForm"
                  class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Sélectionner un élève</option>
                  <option v-for="student in students" :key="student._id" :value="student._id">
                    {{ typeof student.userId === 'object' ? student.userId.firstName : '' }} {{ typeof student.userId === 'object' ? student.userId.lastName : '' }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Date d'échéance <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="formData.dueDate"
                  type="date"
                  required
                  class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div v-if="showEditForm">
                <label class="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                <select
                  v-model="formData.status"
                  class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="borrowed">Emprunté</option>
                  <option value="returned">Retourné</option>
                  <option value="overdue">En retard</option>
                </select>
              </div>
            </div>
            <div class="mt-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                v-model="formData.notes"
                rows="3"
                class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                class="px-6 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
              >
                {{ loading ? 'En cours...' : (showEditForm ? 'Modifier' : 'Enregistrer') }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Loans Table -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div v-if="loading" class="p-8 text-center">
          <p class="text-gray-600">Chargement...</p>
        </div>
        <div v-else-if="error" class="p-8 text-center">
          <p class="text-red-600">{{ error }}</p>
          <button @click="loadLoans" class="mt-4 text-orange-600 hover:underline">
            Réessayer
          </button>
        </div>
        <div v-else-if="loans.length === 0" class="p-8 text-center">
          <p class="text-gray-600">Aucun emprunt trouvé</p>
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Élève</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Livre</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date d'emprunt</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date d'échéance</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date de retour</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th v-if="canManage" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="loan in loans" :key="loan._id" class="hover:bg-gray-50">
                <td class="px-6 py-4 text-sm font-medium text-gray-900">
                  {{ typeof loan.student === 'object' && typeof loan.student.userId === 'object' ? loan.student.userId.firstName : '' }} {{ typeof loan.student === 'object' && typeof loan.student.userId === 'object' ? loan.student.userId.lastName : '' }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">{{ typeof loan.book === 'object' ? loan.book.title : '' }}</td>
                <td class="px-6 py-4 text-sm text-gray-500">{{ formatDate(loan.borrowDate) }}</td>
                <td class="px-6 py-4 text-sm text-gray-500">{{ formatDate(loan.dueDate) }}</td>
                <td class="px-6 py-4 text-sm text-gray-500">
                  {{ loan.returnDate ? formatDate(loan.returnDate) : '-' }}
                </td>
                <td class="px-6 py-4 text-sm">
                  <span
                    :class="[
                      'px-2 py-1 text-xs font-medium rounded',
                      getStatusClass(loan.status),
                    ]"
                  >
                    {{ getStatusLabel(loan.status) }}
                  </span>
                </td>
                <td v-if="canManage" class="px-6 py-4 text-sm">
                  <div class="flex gap-2">
                    <button
                      v-if="loan.status === 'borrowed' || loan.status === 'overdue'"
                      @click="returnLoan(loan._id)"
                      class="text-green-600 hover:text-green-900"
                      title="Retourner"
                    >
                      ↩️
                    </button>
                    <button
                      @click="editLoan(loan)"
                      class="text-blue-600 hover:text-blue-900"
                      title="Modifier"
                    >
                      ✏️
                    </button>
                    <button
                      v-if="authStore.user?.role === 'admin'"
                      @click="deleteLoan(loan._id)"
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
            Page {{ pagination.page }} sur {{ pagination.pages }} ({{ pagination.total }} emprunts)
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
import type { Loan, Student, Book } from '@/types';

const authStore = useAuthStore();

const loans = ref<Loan[]>([]);
const students = ref<Student[]>([]);
const availableBooks = ref<Book[]>([]);
const loading = ref(false);
const error = ref('');
const showAddForm = ref(false);
const showEditForm = ref(false);
const editingId = ref('');

const filters = ref({
  status: '',
  student: '',
  book: '',
});

const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  pages: 0,
});

const formData = ref({
  book: '',
  student: '',
  dueDate: '',
  status: 'borrowed',
  notes: '',
});

const canManage = computed(() => {
  const role = authStore.user?.role;
  return role === 'admin' || role === 'teacher';
});

const loadLoans = async () => {
  loading.value = true;
  error.value = '';
  try {
    const response = await api.getLoans({
      page: pagination.value.page,
      limit: pagination.value.limit,
      status: filters.value.status || undefined,
      student: filters.value.student || undefined,
      book: filters.value.book || undefined,
    });

    if (response.error) {
      error.value = response.error;
    } else if (response.data) {
      loans.value = response.data.loans;
      pagination.value = response.data.pagination;
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Erreur lors du chargement des emprunts';
  } finally {
    loading.value = false;
  }
};

const loadStudents = async () => {
  try {
    const response = await api.getStudents({ limit: 100, isActive: true });
    if (response.data) {
      students.value = response.data.students;
    }
  } catch (err) {
    console.error('Error loading students:', err);
  }
};

const loadBooks = async () => {
  try {
    const response = await api.getBooks({ limit: 100, isActive: true });
    if (response.data) {
      availableBooks.value = response.data.books;
    }
  } catch (err) {
    console.error('Error loading books:', err);
  }
};

const changePage = (page: number) => {
  pagination.value.page = page;
  loadLoans();
};

const resetForm = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 14); // Default: 2 weeks
  
  formData.value = {
    book: '',
    student: '',
    dueDate: tomorrow.toISOString().split('T')[0] || '',
    status: 'borrowed',
    notes: '',
  };
  editingId.value = '';
};

const closeForm = () => {
  showAddForm.value = false;
  showEditForm.value = false;
  resetForm();
};

const createLoan = async () => {
  loading.value = true;
  try {
    const response = await api.createLoan(formData.value);
    if (response.error) {
      alert('Erreur: ' + response.error);
    } else {
      closeForm();
      loadLoans();
      loadBooks(); // Refresh to update available quantities
    }
  } catch (err) {
    alert('Erreur: ' + (err instanceof Error ? err.message : 'Erreur lors de la création de l\'emprunt'));
  } finally {
    loading.value = false;
  }
};

const editLoan = (loan: Loan) => {
  formData.value = {
    book: (typeof loan.book !== 'string' ? loan.book?._id : loan.book) || '',
    student: (typeof loan.student !== 'string' ? loan.student?._id : loan.student) || '',
    dueDate: loan.dueDate ? (new Date(loan.dueDate).toISOString().split('T')[0] || '') : '',
    status: loan.status,
    notes: loan.notes || '',
  };
  editingId.value = loan._id;
  showEditForm.value = true;
};

const updateLoan = async () => {
  loading.value = true;
  try {
    const response = await api.updateLoan(editingId.value, {
      dueDate: formData.value.dueDate,
      notes: formData.value.notes,
    });
    if (response.error) {
      alert('Erreur: ' + response.error);
    } else {
      closeForm();
      loadLoans();
    }
  } catch (err) {
    alert('Erreur: ' + (err instanceof Error ? err.message : 'Erreur lors de la mise à jour de l\'emprunt'));
  } finally {
    loading.value = false;
  }
};

const returnLoan = async (id: string) => {
  if (!confirm('Confirmer le retour de ce livre ?')) {
    return;
  }
  
  loading.value = true;
  try {
    const response = await api.returnLoan(id);
    if (response.error) {
      alert('Erreur: ' + response.error);
    } else {
      loadLoans();
      loadBooks(); // Refresh to update available quantities
    }
  } catch (err) {
    alert('Erreur: ' + (err instanceof Error ? err.message : 'Erreur lors du retour du livre'));
  } finally {
    loading.value = false;
  }
};

const deleteLoan = async (id: string) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cet emprunt ?')) {
    return;
  }
  
  loading.value = true;
  try {
    const response = await api.deleteLoan(id);
    if (response.error) {
      alert('Erreur: ' + response.error);
    } else {
      loadLoans();
      loadBooks(); // Refresh to update available quantities
    }
  } catch (err) {
    alert('Erreur: ' + (err instanceof Error ? err.message : 'Erreur lors de la suppression de l\'emprunt'));
  } finally {
    loading.value = false;
  }
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR');
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    borrowed: 'Emprunté',
    returned: 'Retourné',
    overdue: 'En retard',
  };
  return labels[status] || status;
};

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    borrowed: 'bg-blue-100 text-blue-800',
    returned: 'bg-green-100 text-green-800',
    overdue: 'bg-red-100 text-red-800',
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};

onMounted(() => {
  loadLoans();
  loadStudents();
  loadBooks();
  resetForm();
});
</script>
