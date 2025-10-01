import { ref } from 'vue'
import { defineStore } from 'pinia'
import api from '@/services/api'

export interface DashboardStats {
  totalStudents: number
  totalTeachers: number
  attendanceRate: number
  revenue: number
  expenses: number
  netIncome: number
  pendingInvoices: number
}

export const useDashboardStore = defineStore('dashboard', () => {
  const stats = ref<DashboardStats | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchStats = async () => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.get('/dashboard/stats')
      stats.value = response.data.stats
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch statistics'
    } finally {
      loading.value = false
    }
  }

  return {
    stats,
    loading,
    error,
    fetchStats,
  }
})
