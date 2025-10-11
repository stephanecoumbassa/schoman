<template>
  <div
    v-if="showPrompt"
    class="fixed bottom-4 right-4 max-w-sm bg-white rounded-lg shadow-lg p-4 z-50 border border-gray-200"
  >
    <button
      @click="dismissPrompt"
      class="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>

    <div class="flex items-start">
      <div class="flex-shrink-0">
        <svg class="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      </div>
      <div class="ml-3 flex-1">
        <h3 class="text-sm font-medium text-gray-900">
          Installer Schoman
        </h3>
        <p class="mt-1 text-sm text-gray-500">
          Installez l'application sur votre appareil pour un accès rapide et une expérience optimale.
        </p>
        <div class="mt-3 flex space-x-3">
          <button
            @click="installPWA"
            class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Installer
          </button>
          <button
            @click="dismissPrompt"
            class="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Plus tard
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const showPrompt = ref(false);
let deferredPrompt: any = null;

onMounted(() => {
  // Check if already dismissed
  const dismissed = localStorage.getItem('pwa-install-dismissed');
  if (dismissed) {
    const dismissedTime = parseInt(dismissed);
    const daysSinceDismissal = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
    
    // Show prompt again after 7 days
    if (daysSinceDismissal < 7) {
      return;
    }
  }

  // Check if already installed
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return;
  }

  // Listen for beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    // Prevent the default prompt
    e.preventDefault();
    
    // Store the event for later use
    deferredPrompt = e;
    
    // Show custom prompt
    showPrompt.value = true;
  });

  // Listen for successful installation
  window.addEventListener('appinstalled', () => {
    console.log('PWA installed successfully');
    showPrompt.value = false;
    deferredPrompt = null;
  });
});

async function installPWA() {
  if (!deferredPrompt) {
    return;
  }

  // Show the install prompt
  deferredPrompt.prompt();

  // Wait for the user's response
  const { outcome } = await deferredPrompt.userChoice;
  console.log(`User ${outcome} the install prompt`);

  // Clear the deferredPrompt
  deferredPrompt = null;
  showPrompt.value = false;

  if (outcome === 'accepted') {
    localStorage.removeItem('pwa-install-dismissed');
  }
}

function dismissPrompt() {
  showPrompt.value = false;
  localStorage.setItem('pwa-install-dismissed', Date.now().toString());
}
</script>
