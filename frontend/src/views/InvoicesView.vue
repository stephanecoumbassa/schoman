<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Gestion des Factures</h1>
      <button
        v-if="canManageInvoices"
        @click="openCreateModal"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        + Nouvelle Facture
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Statut</label>
          <select
            v-model="filters.status"
            @change="loadInvoices"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous</option>
            <option value="draft">Brouillon</option>
            <option value="sent">Envoyée</option>
            <option value="paid">Payée</option>
            <option value="overdue">En retard</option>
            <option value="cancelled">Annulée</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Élève</label>
          <select
            v-model="filters.student"
            @change="loadInvoices"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les élèves</option>
            <option v-for="student in students" :key="student._id" :value="student._id">
              {{ student.userId?.firstName }} {{ student.userId?.lastName }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
          <input
            type="date"
            v-model="filters.startDate"
            @change="loadInvoices"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
          <input
            type="date"
            v-model="filters.endDate"
            @change="loadInvoices"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-lg shadow p-4">
        <h3 class="text-sm font-medium text-gray-500">Total Factures</h3>
        <p class="text-2xl font-bold text-gray-800 mt-2">{{ stats.totalInvoices || 0 }}</p>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <h3 class="text-sm font-medium text-gray-500">Revenu Total</h3>
        <p class="text-2xl font-bold text-green-600 mt-2">{{ formatCurrency(stats.totalRevenue) }}</p>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <h3 class="text-sm font-medium text-gray-500">En Retard</h3>
        <p class="text-2xl font-bold text-red-600 mt-2">{{ stats.overdueInvoices || 0 }}</p>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <h3 class="text-sm font-medium text-gray-500">Taux de Paiement</h3>
        <p class="text-2xl font-bold text-blue-600 mt-2">{{ paymentRate }}%</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <p class="text-gray-600">Chargement des factures...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-800">{{ error }}</p>
    </div>

    <!-- Invoices Table -->
    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              N° Facture
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Élève
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Montant
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date d'émission
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date d'échéance
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Statut
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="invoice in invoices" :key="invoice._id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {{ invoice.invoiceNumber }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ invoice.student?.userId?.firstName }} {{ invoice.student?.userId?.lastName }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ formatCurrency(invoice.totalAmount) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(invoice.issueDate) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(invoice.dueDate) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="getStatusClass(invoice.status)" class="px-2 py-1 text-xs font-semibold rounded-full">
                {{ getStatusLabel(invoice.status) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button
                @click="viewInvoice(invoice)"
                class="text-blue-600 hover:text-blue-900 mr-3"
                title="Voir les détails"
              >
                👁️
              </button>
              <button
                v-if="canManageInvoices && invoice.status !== 'paid' && invoice.status !== 'cancelled'"
                @click="openPaymentModal(invoice)"
                class="text-green-600 hover:text-green-900 mr-3"
                title="Enregistrer paiement"
              >
                💰
              </button>
              <button
                v-if="canManageInvoices && invoice.status !== 'paid' && invoice.status !== 'cancelled'"
                @click="editInvoice(invoice)"
                class="text-yellow-600 hover:text-yellow-900 mr-3"
                title="Modifier"
              >
                ✏️
              </button>
              <button
                v-if="user?.role === 'admin' && invoice.status !== 'paid'"
                @click="deleteInvoice(invoice._id)"
                class="text-red-600 hover:text-red-900"
                title="Supprimer"
              >
                🗑️
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div v-if="pagination" class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
        <div class="text-sm text-gray-700">
          Affichage de {{ ((pagination.page - 1) * pagination.limit) + 1 }} à 
          {{ Math.min(pagination.page * pagination.limit, pagination.total) }} sur {{ pagination.total }} factures
        </div>
        <div class="flex gap-2">
          <button
            @click="changePage(pagination.page - 1)"
            :disabled="pagination.page <= 1"
            class="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Précédent
          </button>
          <button
            @click="changePage(pagination.page + 1)"
            :disabled="pagination.page >= pagination.pages"
            class="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>

    <!-- Create/Edit Invoice Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-bold text-gray-800">
              {{ editingInvoice ? 'Modifier la Facture' : 'Nouvelle Facture' }}
            </h2>
            <button @click="closeModal" class="text-gray-500 hover:text-gray-700">
              <span class="text-2xl">&times;</span>
            </button>
          </div>

          <form @submit.prevent="saveInvoice" class="space-y-4">
            <!-- Student Selection -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Élève *</label>
              <select
                v-model="form.student"
                required
                :disabled="editingInvoice !== null"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionner un élève</option>
                <option v-for="student in students" :key="student._id" :value="student._id">
                  {{ student.userId?.firstName }} {{ student.userId?.lastName }} ({{ student.studentNumber }})
                </option>
              </select>
            </div>

            <!-- Invoice Items -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Articles de la facture *</label>
              <div v-for="(item, index) in form.items" :key="index" class="border border-gray-200 rounded-lg p-4 mb-3">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-3 mb-2">
                  <div class="md:col-span-2">
                    <input
                      v-model="item.description"
                      type="text"
                      placeholder="Description"
                      required
                      class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <select
                      v-model="item.category"
                      required
                      class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Catégorie</option>
                      <option value="tuition">Scolarité</option>
                      <option value="activity">Activité</option>
                      <option value="material">Fournitures</option>
                      <option value="transport">Transport</option>
                      <option value="cafeteria">Cantine</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>
                  <div>
                    <button
                      type="button"
                      @click="removeItem(index)"
                      class="w-full bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <input
                      v-model.number="item.quantity"
                      type="number"
                      min="1"
                      placeholder="Quantité"
                      required
                      @input="calculateItemTotal(item)"
                      class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <input
                      v-model.number="item.unitPrice"
                      type="number"
                      min="0"
                      step="100"
                      placeholder="Prix unitaire"
                      required
                      @input="calculateItemTotal(item)"
                      class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <input
                      :value="formatCurrency(item.totalPrice || 0)"
                      type="text"
                      readonly
                      placeholder="Total"
                      class="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50"
                    />
                  </div>
                </div>
              </div>
              <button
                type="button"
                @click="addItem"
                class="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                + Ajouter un article
              </button>
            </div>

            <!-- Tax and Dates -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Taux de taxe (%)</label>
                <input
                  v-model.number="form.taxRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Date d'échéance *</label>
                <input
                  v-model="form.dueDate"
                  type="date"
                  required
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <select
                  v-model="form.status"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="draft">Brouillon</option>
                  <option value="sent">Envoyée</option>
                </select>
              </div>
            </div>

            <!-- Notes -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                v-model="form.notes"
                rows="3"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>

            <!-- Total Summary -->
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="flex justify-between mb-2">
                <span class="text-gray-700">Sous-total:</span>
                <span class="font-medium">{{ formatCurrency(subtotal) }}</span>
              </div>
              <div class="flex justify-between mb-2">
                <span class="text-gray-700">Taxe ({{ form.taxRate }}%):</span>
                <span class="font-medium">{{ formatCurrency(taxAmount) }}</span>
              </div>
              <div class="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span class="text-blue-600">{{ formatCurrency(totalAmount) }}</span>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="flex justify-end gap-3">
              <button
                type="button"
                @click="closeModal"
                class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {{ editingInvoice ? 'Modifier' : 'Créer' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Payment Modal -->
    <div v-if="showPaymentModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-bold text-gray-800">Enregistrer le Paiement</h2>
            <button @click="closePaymentModal" class="text-gray-500 hover:text-gray-700">
              <span class="text-2xl">&times;</span>
            </button>
          </div>

          <form @submit.prevent="savePayment" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Montant à payer</label>
              <input
                :value="formatCurrency(paymentForm.amount)"
                type="text"
                readonly
                class="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date de paiement *</label>
              <input
                v-model="paymentForm.paymentDate"
                type="date"
                required
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Méthode de paiement *</label>
              <select
                v-model="paymentForm.paymentMethod"
                required
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionner une méthode</option>
                <option value="cash">Espèces</option>
                <option value="check">Chèque</option>
                <option value="bank_transfer">Virement bancaire</option>
                <option value="credit_card">Carte de crédit</option>
                <option value="mobile_money">Mobile Money</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Référence de paiement</label>
              <input
                v-model="paymentForm.paymentReference"
                type="text"
                placeholder="Numéro de transaction"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div class="flex justify-end gap-3 mt-6">
              <button
                type="button"
                @click="closePaymentModal"
                class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Enregistrer le Paiement
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import api from '../services/api';
import type { Invoice, Student, Pagination, InvoiceStats } from '@/types';

const authStore = useAuthStore();
const user = computed(() => authStore.user);
const canManageInvoices = computed(() => user.value?.role === 'admin' || user.value?.role === 'teacher');

const invoices = ref<Invoice[]>([]);
const students = ref<Student[]>([]);
const loading = ref(false);
const error = ref('');
const pagination = ref<Pagination | null>(null);
const stats = ref<InvoiceStats | Record<string, never>>({});

const filters = ref({
  status: '',
  student: '',
  startDate: '',
  endDate: '',
  page: 1,
});

const showModal = ref(false);
const showPaymentModal = ref(false);
const editingInvoice = ref<Invoice | null>(null);

const form = ref({
  student: '',
  items: [{ description: '', category: '', quantity: 1, unitPrice: 0, totalPrice: 0 }],
  taxRate: 0,
  dueDate: '',
  status: 'draft',
  notes: '',
});

const paymentForm = ref({
  amount: 0,
  paymentDate: new Date().toISOString().split('T')[0],
  paymentMethod: '',
  paymentReference: '',
});

const subtotal = computed(() => {
  return form.value.items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
});

const taxAmount = computed(() => {
  return (subtotal.value * (form.value.taxRate || 0)) / 100;
});

const totalAmount = computed(() => {
  return subtotal.value + taxAmount.value;
});

const paymentRate = computed(() => {
  if (!('totalInvoices' in stats.value) || stats.value.totalInvoices === 0) return 0;
  return Math.round(((stats.value.paidAmount || 0) / (stats.value.totalAmount || 1)) * 100);
});

const loadInvoices = async () => {
  loading.value = true;
  error.value = '';
  try {
    const params: Record<string, string | number> = { page: filters.value.page, limit: 10 };
    if (filters.value.status) params.status = filters.value.status;
    if (filters.value.student) params.student = filters.value.student;
    if (filters.value.startDate) params.startDate = filters.value.startDate;
    if (filters.value.endDate) params.endDate = filters.value.endDate;

    const response = await api.getInvoices(params);
    if (response.data) {
      invoices.value = response.data.invoices || [];
      pagination.value = response.data.pagination;
    } else {
      error.value = response.error || 'Erreur lors du chargement des factures';
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Erreur lors du chargement des factures';
  } finally {
    loading.value = false;
  }
};

const loadStudents = async () => {
  try {
    const response = await api.getStudents({ limit: 100 });
    if (response.data) {
      students.value = response.data.students || [];
    }
  } catch (err) {
    console.error('Error loading students:', err);
  }
};

const loadStats = async () => {
  try {
    const response = await api.getInvoiceStats();
    if (response.data) {
      stats.value = response.data;
    }
  } catch (err) {
    console.error('Error loading stats:', err);
  }
};

const openCreateModal = () => {
  editingInvoice.value = null;
  form.value = {
    student: '',
    items: [{ description: '', category: '', quantity: 1, unitPrice: 0, totalPrice: 0 }],
    taxRate: 0,
    dueDate: '',
    status: 'draft',
    notes: '',
  };
  showModal.value = true;
};

const editInvoice = (invoice: Invoice) => {
  editingInvoice.value = invoice;
  form.value = {
    student: typeof invoice.student !== 'string' ? invoice.student._id : invoice.student,
    items: JSON.parse(JSON.stringify(invoice.items)),
    taxRate: invoice.taxRate,
    dueDate: invoice.dueDate.split('T')[0],
    status: invoice.status,
    notes: invoice.notes || '',
  };
  showModal.value = true;
};

const viewInvoice = (invoice: Invoice) => {
  const studentName = typeof invoice.student !== 'string' ? `${invoice.student.userId.firstName} ${invoice.student.userId.lastName}` : 'N/A';
  alert(`Facture ${invoice.invoiceNumber}\nÉlève: ${studentName}\nMontant: ${formatCurrency(invoice.totalAmount)}\nStatut: ${getStatusLabel(invoice.status)}`);
};

const closeModal = () => {
  showModal.value = false;
  editingInvoice.value = null;
};

const addItem = () => {
  form.value.items.push({ description: '', category: '', quantity: 1, unitPrice: 0, totalPrice: 0 });
};

const removeItem = (index: number) => {
  if (form.value.items.length > 1) {
    form.value.items.splice(index, 1);
  }
};

const calculateItemTotal = (item: { quantity: number; unitPrice: number; totalPrice?: number }) => {
  item.totalPrice = (item.quantity || 0) * (item.unitPrice || 0);
};

const saveInvoice = async () => {
  try {
    const invoiceData = {
      ...form.value,
      items: form.value.items.map(item => ({
        ...item,
        totalPrice: item.quantity * item.unitPrice,
      })),
    };

    let response;
    if (editingInvoice.value) {
      response = await api.updateInvoice(editingInvoice.value._id, invoiceData);
    } else {
      response = await api.createInvoice(invoiceData);
    }

    if (response.data) {
      alert(response.data.message || 'Facture enregistrée avec succès');
      closeModal();
      await loadInvoices();
      await loadStats();
    } else {
      alert(response.error || 'Erreur lors de l\'enregistrement');
    }
  } catch (err) {
    alert(err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement');
  }
};

const openPaymentModal = (invoice: Invoice) => {
  editingInvoice.value = invoice;
  paymentForm.value = {
    amount: invoice.totalAmount,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: '',
    paymentReference: '',
  };
  showPaymentModal.value = true;
};

const closePaymentModal = () => {
  showPaymentModal.value = false;
  editingInvoice.value = null;
};

const savePayment = async () => {
  try {
    const response = await api.recordPayment(editingInvoice.value._id, paymentForm.value);
    if (response.data) {
      alert(response.data.message || 'Paiement enregistré avec succès');
      closePaymentModal();
      await loadInvoices();
      await loadStats();
    } else {
      alert(response.error || 'Erreur lors de l\'enregistrement du paiement');
    }
  } catch (err) {
    alert(err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement du paiement');
  }
};

const deleteInvoice = async (id: string) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) return;

  try {
    const response = await api.deleteInvoice(id);
    if (response.data) {
      alert('Facture supprimée avec succès');
      await loadInvoices();
      await loadStats();
    } else {
      alert(response.error || 'Erreur lors de la suppression');
    }
  } catch (err) {
    alert(err instanceof Error ? err.message : 'Erreur lors de la suppression');
  }
};

const changePage = (page: number) => {
  filters.value.page = page;
  loadInvoices();
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0,
  }).format(amount || 0);
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR');
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    draft: 'Brouillon',
    sent: 'Envoyée',
    paid: 'Payée',
    overdue: 'En retard',
    cancelled: 'Annulée',
  };
  return labels[status] || status;
};

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    sent: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
    overdue: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};

onMounted(() => {
  loadInvoices();
  loadStudents();
  loadStats();
});
</script>
