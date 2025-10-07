<template>
  <div class="container mx-auto px-4 py-6">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">💵 Comptabilité - Transactions</h1>

    <!-- Statistics Cards -->
    <div v-if="stats" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Revenus</p>
            <p class="text-2xl font-bold text-gray-800">{{ formatCurrency(stats.totalIncome) }}</p>
          </div>
          <div class="bg-green-100 rounded-full p-3">
            <span class="text-2xl">📈</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Dépenses</p>
            <p class="text-2xl font-bold text-gray-800">{{ formatCurrency(stats.totalExpenses) }}</p>
          </div>
          <div class="bg-red-100 rounded-full p-3">
            <span class="text-2xl">📉</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6 border-l-4" :class="stats.balance >= 0 ? 'border-blue-500' : 'border-orange-500'">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Solde</p>
            <p class="text-2xl font-bold" :class="stats.balance >= 0 ? 'text-blue-600' : 'text-orange-600'">
              {{ formatCurrency(stats.balance) }}
            </p>
          </div>
          <div class="rounded-full p-3" :class="stats.balance >= 0 ? 'bg-blue-100' : 'bg-orange-100'">
            <span class="text-2xl">💰</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Transactions</p>
            <p class="text-2xl font-bold text-gray-800">{{ stats.transactionCount }}</p>
          </div>
          <div class="bg-purple-100 rounded-full p-3">
            <span class="text-2xl">📊</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters and Actions -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div class="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <!-- Transaction Type Filter -->
          <select
            v-model="filters.type"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous types</option>
            <option value="income">Revenus</option>
            <option value="expense">Dépenses</option>
          </select>

          <!-- Fiscal Year Filter -->
          <select
            v-model="filters.fiscalYear"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Toutes années</option>
            <option v-for="year in fiscalYears" :key="year" :value="year">{{ year }}</option>
          </select>

          <!-- Search -->
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher..."
            class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          @click="openCreateModal"
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition whitespace-nowrap"
        >
          + Nouvelle transaction
        </button>
      </div>
    </div>

    <!-- Transactions List -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div v-if="loading" class="p-8 text-center">
        <p class="text-gray-500">Chargement...</p>
      </div>

      <div v-else-if="transactions.length === 0" class="p-8 text-center">
        <p class="text-gray-500">Aucune transaction trouvée</p>
      </div>

      <table v-else class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Numéro</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catégorie</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Montant</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="transaction in transactions" :key="transaction._id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {{ transaction.transactionNumber }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(transaction.transactionDate) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                class="px-2 py-1 text-xs font-semibold rounded-full"
                :class="
                  transaction.type === 'income'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                "
              >
                {{ transaction.type === 'income' ? 'Revenu' : 'Dépense' }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-500">{{ transaction.category }}</td>
            <td class="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{{ transaction.description }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold"
              :class="transaction.type === 'income' ? 'text-green-600' : 'text-red-600'"
            >
              {{ transaction.type === 'income' ? '+' : '-' }}{{ formatCurrency(transaction.amount) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button
                @click="viewTransaction(transaction)"
                class="text-blue-600 hover:text-blue-900 mr-3"
              >
                Voir
              </button>
              <button
                v-if="canDelete"
                @click="deleteTransactionConfirm(transaction._id)"
                class="text-red-600 hover:text-red-900"
              >
                Supprimer
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div v-if="pagination" class="bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
        <div class="text-sm text-gray-700">
          Page {{ pagination.page }} sur {{ pagination.pages }} ({{ pagination.total }} transactions)
        </div>
        <div class="flex gap-2">
          <button
            @click="changePage(pagination.page - 1)"
            :disabled="pagination.page === 1"
            class="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Précédent
          </button>
          <button
            @click="changePage(pagination.page + 1)"
            :disabled="pagination.page === pagination.pages"
            class="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b">
          <h2 class="text-2xl font-bold">{{ editingTransaction ? 'Modifier' : 'Nouvelle' }} transaction</h2>
        </div>

        <form @submit.prevent="saveTransaction" class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Type *</label>
              <select
                v-model="formData.type"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="income">Revenu</option>
                <option value="expense">Dépense</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Montant (FCFA) *</label>
              <input
                v-model.number="formData.amount"
                type="number"
                min="0"
                step="1"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Catégorie *</label>
              <input
                v-model="formData.category"
                type="text"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                v-model="formData.transactionDate"
                type="date"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Méthode de paiement</label>
              <select
                v-model="formData.paymentMethod"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Sélectionner --</option>
                <option value="cash">Espèces</option>
                <option value="check">Chèque</option>
                <option value="bank_transfer">Virement bancaire</option>
                <option value="mobile_money">Mobile Money</option>
                <option value="other">Autre</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Référence</label>
              <input
                v-model="formData.reference"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea
                v-model="formData.description"
                rows="3"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                v-model="formData.notes"
                rows="2"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>
          </div>

          <div class="flex justify-end gap-4 mt-6">
            <button
              type="button"
              @click="closeModal"
              class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {{ editingTransaction ? 'Mettre à jour' : 'Créer' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- View Transaction Modal -->
    <div v-if="viewingTransaction" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b">
          <h2 class="text-2xl font-bold">Détails de la transaction</h2>
        </div>

        <div class="p-6">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-gray-600">Numéro</p>
              <p class="font-semibold">{{ viewingTransaction.transactionNumber }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600">Type</p>
              <span
                class="inline-block px-2 py-1 text-xs font-semibold rounded-full"
                :class="
                  viewingTransaction.type === 'income'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                "
              >
                {{ viewingTransaction.type === 'income' ? 'Revenu' : 'Dépense' }}
              </span>
            </div>
            <div>
              <p class="text-sm text-gray-600">Montant</p>
              <p class="font-semibold text-lg" :class="viewingTransaction.type === 'income' ? 'text-green-600' : 'text-red-600'">
                {{ formatCurrency(viewingTransaction.amount) }} FCFA
              </p>
            </div>
            <div>
              <p class="text-sm text-gray-600">Date</p>
              <p class="font-semibold">{{ formatDate(viewingTransaction.transactionDate) }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600">Catégorie</p>
              <p class="font-semibold">{{ viewingTransaction.category }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600">Année fiscale</p>
              <p class="font-semibold">{{ viewingTransaction.fiscalYear }}</p>
            </div>
            <div v-if="viewingTransaction.paymentMethod">
              <p class="text-sm text-gray-600">Méthode de paiement</p>
              <p class="font-semibold">{{ getPaymentMethodLabel(viewingTransaction.paymentMethod) }}</p>
            </div>
            <div v-if="viewingTransaction.reference">
              <p class="text-sm text-gray-600">Référence</p>
              <p class="font-semibold">{{ viewingTransaction.reference }}</p>
            </div>
            <div class="col-span-2">
              <p class="text-sm text-gray-600">Description</p>
              <p class="font-semibold">{{ viewingTransaction.description }}</p>
            </div>
            <div v-if="viewingTransaction.notes" class="col-span-2">
              <p class="text-sm text-gray-600">Notes</p>
              <p class="font-semibold">{{ viewingTransaction.notes }}</p>
            </div>
            <div class="col-span-2">
              <p class="text-sm text-gray-600">Créé par</p>
              <p class="font-semibold">
                {{ viewingTransaction.createdBy?.firstName }} {{ viewingTransaction.createdBy?.lastName }}
              </p>
            </div>
          </div>

          <div class="flex justify-end gap-4 mt-6">
            <button
              @click="viewingTransaction = null"
              class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Fermer
            </button>
            <button
              @click="editTransaction(viewingTransaction)"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Modifier
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const authStore = useAuthStore()

const transactions = ref<any[]>([])
const stats = ref<any>(null)
const loading = ref(false)
const pagination = ref<any>(null)
const filters = ref({
  type: '',
  fiscalYear: new Date().getFullYear().toString(),
})
const searchQuery = ref('')
const showModal = ref(false)
const editingTransaction = ref<any>(null)
const viewingTransaction = ref<any>(null)
const formData = ref({
  type: 'income' as 'income' | 'expense',
  amount: 0,
  category: '',
  description: '',
  transactionDate: new Date().toISOString().split('T')[0],
  paymentMethod: '',
  reference: '',
  notes: '',
})

const fiscalYears = computed(() => {
  const currentYear = new Date().getFullYear()
  return [currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map(String)
})

const canDelete = computed(() => authStore.user?.role === 'admin')

let debounceTimeout: any = null

watch([filters, searchQuery], () => {
  clearTimeout(debounceTimeout)
  debounceTimeout = setTimeout(() => {
    loadTransactions()
  }, 300)
}, { deep: true })

onMounted(() => {
  loadTransactions()
  loadStats()
})

async function loadTransactions() {
  loading.value = true
  try {
    const params: any = {
      page: pagination.value?.page || 1,
      limit: 20,
      ...filters.value,
    }
    if (searchQuery.value) {
      params.search = searchQuery.value
    }
    const response = await api.getTransactions(params)
    if (response.data) {
      transactions.value = response.data.transactions
      pagination.value = response.data.pagination
    }
  } catch (error) {
    console.error('Error loading transactions:', error)
  } finally {
    loading.value = false
  }
}

async function loadStats() {
  try {
    const response = await api.getTransactionStats(filters.value.fiscalYear)
    if (response.data) {
      stats.value = response.data
    }
  } catch (error) {
    console.error('Error loading stats:', error)
  }
}

function changePage(page: number) {
  if (pagination.value) {
    pagination.value.page = page
    loadTransactions()
  }
}

function openCreateModal() {
  editingTransaction.value = null
  formData.value = {
    type: 'income',
    amount: 0,
    category: '',
    description: '',
    transactionDate: new Date().toISOString().split('T')[0],
    paymentMethod: '',
    reference: '',
    notes: '',
  }
  showModal.value = true
}

function editTransaction(transaction: any) {
  editingTransaction.value = transaction
  formData.value = {
    type: transaction.type,
    amount: transaction.amount,
    category: transaction.category,
    description: transaction.description,
    transactionDate: transaction.transactionDate.split('T')[0],
    paymentMethod: transaction.paymentMethod || '',
    reference: transaction.reference || '',
    notes: transaction.notes || '',
  }
  viewingTransaction.value = null
  showModal.value = true
}

function viewTransaction(transaction: any) {
  viewingTransaction.value = transaction
}

async function saveTransaction() {
  try {
    if (editingTransaction.value) {
      await api.updateTransaction(editingTransaction.value._id, formData.value)
    } else {
      await api.createTransaction(formData.value)
    }
    closeModal()
    loadTransactions()
    loadStats()
  } catch (error) {
    console.error('Error saving transaction:', error)
    alert('Erreur lors de l\'enregistrement de la transaction')
  }
}

async function deleteTransactionConfirm(id: string) {
  if (confirm('Êtes-vous sûr de vouloir supprimer cette transaction ?')) {
    try {
      await api.deleteTransaction(id)
      loadTransactions()
      loadStats()
    } catch (error) {
      console.error('Error deleting transaction:', error)
      alert('Erreur lors de la suppression de la transaction')
    }
  }
}

function closeModal() {
  showModal.value = false
  editingTransaction.value = null
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('fr-FR')
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('fr-FR').format(amount)
}

function getPaymentMethodLabel(method: string) {
  const labels: Record<string, string> = {
    cash: 'Espèces',
    check: 'Chèque',
    bank_transfer: 'Virement bancaire',
    mobile_money: 'Mobile Money',
    other: 'Autre',
  }
  return labels[method] || method
}
</script>
