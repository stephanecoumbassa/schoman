import { registerSW } from 'virtual:pwa-register';

/**
 * Register service worker with auto-update
 */
export function registerServiceWorker() {
  const updateSW = registerSW({
    onNeedRefresh() {
      // Show update notification
      if (confirm('New version available! Reload to update?')) {
        updateSW(true);
      }
    },
    onOfflineReady() {
      console.log('App ready to work offline');
      showNotification('App ready to work offline', 'success');
    },
    onRegistered(registration) {
      console.log('Service Worker registered:', registration);
    },
    onRegisterError(error) {
      console.error('Service Worker registration error:', error);
    },
  });

  return updateSW;
}

/**
 * Check if app is running as PWA
 */
export function isPWA(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  );
}

/**
 * Check if service worker is supported
 */
export function isServiceWorkerSupported(): boolean {
  return 'serviceWorker' in navigator;
}

/**
 * Check if push notifications are supported
 */
export function isPushNotificationSupported(): boolean {
  return 'PushManager' in window;
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
}

/**
 * Show browser notification
 */
export function showNotification(
  title: string,
  type: 'success' | 'error' | 'info' | 'warning' = 'info',
  body?: string,
  icon?: string
) {
  if (Notification.permission !== 'granted') {
    return;
  }

  const iconMap = {
    success: '/pwa-192x192.png',
    error: '/pwa-192x192.png',
    info: '/pwa-192x192.png',
    warning: '/pwa-192x192.png',
  };

  const notification = new Notification(title, {
    body: body || '',
    icon: icon || iconMap[type],
    badge: '/pwa-192x192.png',
    tag: `schoman-${Date.now()}`,
    requireInteraction: type === 'error',
  });

  notification.onclick = () => {
    window.focus();
    notification.close();
  };

  // Auto close after 5 seconds for success/info
  if (type === 'success' || type === 'info') {
    setTimeout(() => notification.close(), 5000);
  }
}

/**
 * Get network status
 */
export function getNetworkStatus() {
  return {
    online: navigator.onLine,
    connection: (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection,
  };
}

/**
 * Listen for network status changes
 */
export function onNetworkChange(callback: (online: boolean) => void) {
  window.addEventListener('online', () => callback(true));
  window.addEventListener('offline', () => callback(false));
}

/**
 * Cache management utilities
 */
export const cacheManager = {
  /**
   * Clear all caches
   */
  async clearAll(): Promise<void> {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
      console.log('All caches cleared');
    }
  },

  /**
   * Get cache size
   */
  async getSize(): Promise<number> {
    if ('caches' in window && 'storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return estimate.usage || 0;
    }
    return 0;
  },

  /**
   * Get cache quota
   */
  async getQuota(): Promise<number> {
    if ('caches' in window && 'storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return estimate.quota || 0;
    }
    return 0;
  },
};

/**
 * PWA Update Manager
 */
export class PWAUpdateManager {
  private updateSW: ((reloadPage?: boolean) => Promise<void>) | null = null;
  private hasUpdate = false;

  constructor() {
    this.init();
  }

  private init() {
    this.updateSW = registerSW({
      onNeedRefresh: () => {
        this.hasUpdate = true;
        this.notifyUpdate();
      },
      onOfflineReady: () => {
        showNotification('App ready to work offline', 'success');
      },
    });
  }

  private notifyUpdate() {
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('pwa-update-available'));
  }

  async update() {
    if (this.updateSW && this.hasUpdate) {
      await this.updateSW(true);
      this.hasUpdate = false;
    }
  }

  checkForUpdates() {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'CHECK_FOR_UPDATES' });
    }
  }
}

// Export singleton instance
export const pwaUpdateManager = new PWAUpdateManager();
