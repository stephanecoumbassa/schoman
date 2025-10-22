import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

export type Theme = 'light' | 'dark' | 'system'

export const useThemeStore = defineStore('theme', () => {
  // Initialize from localStorage or default to system
  const theme = ref<Theme>((localStorage.getItem('theme') as Theme) || 'system')
  const isDark = ref(false)

  // Function to update the DOM with the current theme
  const updateDOM = () => {
    const root = document.documentElement
    
    if (theme.value === 'system') {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      isDark.value = prefersDark
    } else {
      isDark.value = theme.value === 'dark'
    }

    // Update DOM classes
    if (isDark.value) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }

  // Set theme
  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme
    localStorage.setItem('theme', newTheme)
    updateDOM()
  }

  // Toggle between light and dark
  const toggleTheme = () => {
    if (theme.value === 'system') {
      // If currently on system, switch to opposite of current system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(prefersDark ? 'light' : 'dark')
    } else {
      // Toggle between light and dark
      setTheme(theme.value === 'light' ? 'dark' : 'light')
    }
  }

  // Initialize theme on store creation
  updateDOM()

  // Listen for system theme changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', () => {
    if (theme.value === 'system') {
      updateDOM()
    }
  })

  // Watch for theme changes
  watch(theme, updateDOM)

  return {
    theme,
    isDark,
    setTheme,
    toggleTheme,
  }
})
