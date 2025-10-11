<template>
  <div class="fixed bottom-4 left-4 z-50">
    <!-- Offline Indicator -->
    <div
      v-if="!isOnline"
      class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-3 rounded shadow-lg mb-2"
    >
      <div class="flex items-center">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
        </svg>
        <span class="text-sm font-medium">Mode Hors Ligne</span>
      </div>
    </div>

    <!-- Update Available -->
    <div
      v-if="updateAvailable"
      class="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-3 rounded shadow-lg mb-2"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span class="text-sm font-medium">Mise à jour disponible</span>
        </div>
        <button
          @click="updateApp"
          class="ml-3 text-sm font-medium underline hover:no-underline"
        >
          Mettre à jour
        </button>
      </div>
    </div>

    <!-- PWA Status Badge (only when installed) -->
    <div
      v-if="isPWAInstalled && showStatusBadge"
      class="bg-green-100 border-l-4 border-green-500 text-green-700 p-2 rounded shadow-lg flex items-center"
    >
      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
      <span class="text-xs font-medium">Mode PWA</span>
      <button
        @click="showStatusBadge = false"
        class="ml-2 text-green-600 hover:text-green-800"
      >
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { onNetworkChange, isPWA, pwaUpdateManager } from '@/registerServiceWorker';

const isOnline = ref(navigator.onLine);
const updateAvailable = ref(false);
const isPWAInstalled = ref(false);
const showStatusBadge = ref(false);

let networkCleanup: (() => void) | null = null;

onMounted(() => {
  // Check PWA status
  isPWAInstalled.value = isPWA();
  
  // Show PWA badge temporarily if installed
  if (isPWAInstalled.value) {
    showStatusBadge.value = true;
    setTimeout(() => {
      showStatusBadge.value = false;
    }, 5000);
  }

  // Listen for network changes
  const handleOnline = (online: boolean) => {
    isOnline.value = online;
  };

  onNetworkChange(handleOnline);

  // Listen for PWA updates
  window.addEventListener('pwa-update-available', handleUpdateAvailable);

  // Check for updates periodically (every 30 minutes)
  const updateCheckInterval = setInterval(() => {
    pwaUpdateManager.checkForUpdates();
  }, 30 * 60 * 1000);

  networkCleanup = () => {
    clearInterval(updateCheckInterval);
    window.removeEventListener('pwa-update-available', handleUpdateAvailable);
  };
});

onUnmounted(() => {
  if (networkCleanup) {
    networkCleanup();
  }
});

function handleUpdateAvailable() {
  updateAvailable.value = true;
}

async function updateApp() {
  try {
    await pwaUpdateManager.update();
    updateAvailable.value = false;
  } catch (error) {
    console.error('Error updating app:', error);
  }
}
</script>
