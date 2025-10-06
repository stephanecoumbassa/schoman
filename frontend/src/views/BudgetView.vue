<template>
  <div class="container mx-auto px-4 py-6">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">📊 Gestion des Budgets</h1>

    <!-- Budgets List -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold">Budgets</h2>
        <button
          @click="router.push('/accounting')"
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
        >
          Voir les transactions
        </button>
      </div>

      <div v-if="loading" class="text-center py-8">
        <p class="text-gray-500">Chargement...</p>
      </div>

      <div v-else-if="budgets.length === 0" class="text-center py-8">
        <p class="text-gray-500">Aucun budget trouvé</p>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="budget in budgets"
          :key="budget._id"
          class="border rounded-lg p-4 hover:shadow-md transition"
        >
          <div class="flex justify-between items-start">
            <div>
              <h3 class="text-lg font-semibold">{{ budget.name }}</h3>
              <p class="text-sm text-gray-600">
                {{ budget.fiscalYear }} | {{ formatDate(budget.startDate) }} - {{ formatDate(budget.endDate) }}
              </p>
              <span
                class="inline-block mt-2 px-2 py-1 text-xs font-semibold rounded-full"
                :class="{
                  'bg-gray-100 text-gray-800': budget.status === 'draft',
                  'bg-green-100 text-green-800': budget.status === 'active',
                  'bg-red-100 text-red-800': budget.status === 'closed',
                }"
              >
                {{ budget.status === 'draft' ? 'Brouillon' : budget.status === 'active' ? 'Actif' : 'Clôturé' }}
              </span>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-600">Budget total</p>
              <p class="text-xl font-bold text-blue-600">{{ formatCurrency(budget.totalBudget) }} FCFA</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

const router = useRouter()
const budgets = ref<any[]>([])
const loading = ref(false)

onMounted(() => {
  loadBudgets()
})

async function loadBudgets() {
  loading.value = true
  try {
    const response = await api.getBudgets({ limit: 50 })
    if (response.data) {
      budgets.value = response.data.budgets
    }
  } catch (error) {
    console.error('Error loading budgets:', error)
  } finally {
    loading.value = false
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('fr-FR')
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('fr-FR').format(amount)
}
</script>
