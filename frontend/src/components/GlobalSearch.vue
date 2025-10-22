<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/services/api'

interface SearchResult {
  type: string
  id: string
  title: string
  subtitle?: string
  description?: string
  url?: string
  relevance?: number
}

const router = useRouter()
const isOpen = ref(false)
const query = ref('')
const results = ref<SearchResult[]>([])
const suggestions = ref<string[]>([])
const loading = ref(false)
const selectedIndex = ref(-1)
const searchInput = ref<HTMLInputElement>()

// Debounce timer
let debounceTimer: number | null = null

// Watch for query changes and perform search
watch(query, (newQuery) => {
  selectedIndex.value = -1
  
  if (!newQuery || newQuery.length < 2) {
    results.value = []
    suggestions.value = []
    return
  }

  // Clear previous debounce timer
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  // Set new debounce timer
  debounceTimer = window.setTimeout(async () => {
    await performSearch(newQuery)
  }, 300)
})

// Perform search
const performSearch = async (searchQuery: string) => {
  if (!searchQuery || searchQuery.length < 2) {
    return
  }

  loading.value = true
  try {
    const response = await api.get(`/search?q=${encodeURIComponent(searchQuery)}&limit=10`)
    if (response.data?.data?.results) {
      results.value = response.data.data.results
    }
  } catch (error) {
    console.error('Search error:', error)
    results.value = []
  } finally {
    loading.value = false
  }
}

// Get autocomplete suggestions
const getAutocompleteSuggestions = async (searchQuery: string) => {
  if (!searchQuery || searchQuery.length < 2) {
    return
  }

  try {
    const response = await api.get(`/search/autocomplete?q=${encodeURIComponent(searchQuery)}&limit=5`)
    if (response.data?.data) {
      suggestions.value = response.data.data
    }
  } catch (error) {
    console.error('Autocomplete error:', error)
    suggestions.value = []
  }
}

// Open search modal
const openSearch = () => {
  isOpen.value = true
  setTimeout(() => {
    searchInput.value?.focus()
  }, 100)
}

// Close search modal
const closeSearch = () => {
  isOpen.value = false
  query.value = ''
  results.value = []
  suggestions.value = []
  selectedIndex.value = -1
}

// Navigate to result
const navigateToResult = (result: SearchResult) => {
  if (result.url) {
    router.push(result.url)
    closeSearch()
  }
}

// Handle keyboard navigation
const handleKeydown = (event: KeyboardEvent) => {
  if (!isOpen.value) {
    // Open search with Ctrl+K or Cmd+K
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault()
      openSearch()
    }
    return
  }

  switch (event.key) {
    case 'Escape':
      event.preventDefault()
      closeSearch()
      break
    case 'ArrowDown':
      event.preventDefault()
      if (selectedIndex.value < results.value.length - 1) {
        selectedIndex.value++
      }
      break
    case 'ArrowUp':
      event.preventDefault()
      if (selectedIndex.value > 0) {
        selectedIndex.value--
      }
      break
    case 'Enter':
      event.preventDefault()
      if (selectedIndex.value >= 0 && results.value[selectedIndex.value]) {
        navigateToResult(results.value[selectedIndex.value])
      }
      break
  }
}

// Get icon for result type
const getTypeIcon = (type: string): string => {
  const icons: Record<string, string> = {
    student: '👨‍🎓',
    user: '👤',
    class: '🏫',
    subject: '📚',
    book: '📖',
    event: '📅',
    invoice: '💰',
    message: '✉️',
  }
  return icons[type] || '📄'
}

// Get type label
const getTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    student: 'Élève',
    user: 'Utilisateur',
    class: 'Classe',
    subject: 'Matière',
    book: 'Livre',
    event: 'Événement',
    invoice: 'Facture',
    message: 'Message',
  }
  return labels[type] || type
}

// Keyboard event listener
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

// Expose open method for parent components
defineExpose({ openSearch })
</script>

<template>
  <!-- Search Button -->
  <button
    @click="openSearch"
    class="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
    title="Rechercher (Ctrl+K)"
  >
    <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
    <span class="hidden md:inline text-sm text-gray-600 dark:text-gray-400">Rechercher...</span>
    <kbd class="hidden md:inline px-2 py-0.5 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">
      ⌘K
    </kbd>
  </button>

  <!-- Search Modal -->
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 overflow-y-auto"
      @click.self="closeSearch"
    >
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-black/50 dark:bg-black/70 transition-opacity" @click="closeSearch"></div>

      <!-- Modal -->
      <div class="flex min-h-full items-start justify-center p-4 pt-20">
        <div class="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-2xl dark:shadow-gray-900">
          <!-- Search Input -->
          <div class="flex items-center border-b border-gray-200 dark:border-gray-700 p-4">
            <svg class="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref="searchInput"
              v-model="query"
              type="text"
              placeholder="Rechercher des élèves, classes, matières..."
              class="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              @keydown="handleKeydown"
            />
            <button
              v-if="query"
              @click="query = ''"
              class="ml-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Loading -->
          <div v-if="loading" class="p-8 text-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">Recherche en cours...</p>
          </div>

          <!-- No Query -->
          <div v-else-if="!query || query.length < 2" class="p-8 text-center">
            <svg class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p class="text-gray-500 dark:text-gray-400">Tapez au moins 2 caractères pour rechercher</p>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-2">Utilisez Ctrl+K (Cmd+K) pour ouvrir la recherche</p>
          </div>

          <!-- Results -->
          <div v-else-if="results.length > 0" class="max-h-96 overflow-y-auto">
            <div
              v-for="(result, index) in results"
              :key="result.id"
              :class="[
                'p-4 cursor-pointer border-b border-gray-100 dark:border-gray-700 transition-colors',
                selectedIndex === index
                  ? 'bg-blue-50 dark:bg-blue-900/20'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
              ]"
              @click="navigateToResult(result)"
              @mouseenter="selectedIndex = index"
            >
              <div class="flex items-start gap-3">
                <div class="flex-shrink-0 text-2xl">{{ getTypeIcon(result.type) }}</div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <h3 class="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {{ result.title }}
                    </h3>
                    <span class="px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                      {{ getTypeLabel(result.type) }}
                    </span>
                  </div>
                  <p v-if="result.subtitle" class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {{ result.subtitle }}
                  </p>
                  <p v-if="result.description" class="text-xs text-gray-600 dark:text-gray-500 mt-1 line-clamp-2">
                    {{ result.description }}
                  </p>
                </div>
                <svg class="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>

          <!-- No Results -->
          <div v-else class="p-8 text-center">
            <svg class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-gray-500 dark:text-gray-400">Aucun résultat trouvé pour "{{ query }}"</p>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-2">Essayez avec d'autres mots-clés</p>
          </div>

          <!-- Footer -->
          <div class="border-t border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-900/50">
            <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div class="flex items-center gap-4">
                <span class="flex items-center gap-1">
                  <kbd class="px-1.5 py-0.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded">↑↓</kbd>
                  Naviguer
                </span>
                <span class="flex items-center gap-1">
                  <kbd class="px-1.5 py-0.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded">↵</kbd>
                  Sélectionner
                </span>
                <span class="flex items-center gap-1">
                  <kbd class="px-1.5 py-0.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded">Esc</kbd>
                  Fermer
                </span>
              </div>
              <span v-if="results.length > 0">{{ results.length }} résultat(s)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
