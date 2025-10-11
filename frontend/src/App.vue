<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import { registerServiceWorker } from './registerServiceWorker'
import PWAInstallPrompt from './components/PWAInstallPrompt.vue'
import PWAStatus from './components/PWAStatus.vue'

const authStore = useAuthStore()

onMounted(() => {
  if (authStore.isAuthenticated) {
    authStore.fetchProfile()
  }

  // Register service worker
  registerServiceWorker()
})
</script>

<template>
  <RouterView />
  <PWAInstallPrompt />
  <PWAStatus />
</template>

<style scoped>
</style>
