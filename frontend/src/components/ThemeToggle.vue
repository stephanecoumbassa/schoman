<script setup lang="ts">
import { useThemeStore } from '@/stores/theme'
import { computed } from 'vue'

const themeStore = useThemeStore()

const themeIcon = computed(() => {
  if (themeStore.isDark) {
    return 'moon' // Dark mode active
  }
  return 'sun' // Light mode active
})

const themeLabel = computed(() => {
  if (themeStore.theme === 'system') {
    return themeStore.isDark ? 'Système (Sombre)' : 'Système (Clair)'
  }
  return themeStore.isDark ? 'Sombre' : 'Clair'
})
</script>

<template>
  <div class="relative">
    <button
      @click="themeStore.toggleTheme"
      class="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
      :aria-label="themeLabel"
      :title="themeLabel"
    >
      <!-- Sun Icon (Light Mode) -->
      <svg
        v-if="themeIcon === 'sun'"
        class="h-5 w-5 text-gray-700 dark:text-gray-200"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>

      <!-- Moon Icon (Dark Mode) -->
      <svg
        v-else
        class="h-5 w-5 text-gray-700 dark:text-gray-200"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
        />
      </svg>
    </button>
  </div>
</template>

<style scoped>
/* Add smooth transitions */
button {
  transition: all 0.2s ease-in-out;
}

svg {
  transition: all 0.2s ease-in-out;
}
</style>
