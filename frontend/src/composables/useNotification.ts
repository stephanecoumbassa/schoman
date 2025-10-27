import { computed } from 'vue';
import { useNotificationsStore, type Notification } from '@/stores/notifications';

/**
 * Composable for notification management
 * Provides convenient access to notification state and methods
 */
export function useNotification() {
  const notificationsStore = useNotificationsStore();

  // Computed properties
  const notifications = computed(() => notificationsStore.notifications);
  const unreadNotifications = computed(() => notificationsStore.unreadNotifications);
  const readNotifications = computed(() => notificationsStore.readNotifications);
  const unreadCount = computed(() => notificationsStore.unreadCount);
  const loading = computed(() => notificationsStore.loading);
  const error = computed(() => notificationsStore.error);

  // Fetch notifications
  const fetchNotifications = async (unreadOnly = false) => {
    await notificationsStore.fetchNotifications(unreadOnly);
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    await notificationsStore.fetchUnreadCount();
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    await notificationsStore.markAsRead(notificationId);
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    await notificationsStore.markAllAsRead();
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    await notificationsStore.deleteNotification(notificationId);
  };

  // Add notification (for real-time updates)
  const addNotification = (notification: Notification) => {
    notificationsStore.addNotification(notification);
  };

  // Show a toast notification (simple notification display)
  const showToast = (
    title: string,
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info'
  ) => {
    // This would typically integrate with a toast library
    // For now, we'll just log it
    console.log(`[${type.toUpperCase()}] ${title}: ${message}`);
    
    // You could dispatch a custom event here to show a toast
    const event = new CustomEvent('show-toast', {
      detail: { title, message, type },
    });
    window.dispatchEvent(event);
  };

  // Show success toast
  const showSuccess = (title: string, message: string) => {
    showToast(title, message, 'success');
  };

  // Show error toast
  const showError = (title: string, message: string) => {
    showToast(title, message, 'error');
  };

  // Show warning toast
  const showWarning = (title: string, message: string) => {
    showToast(title, message, 'warning');
  };

  // Show info toast
  const showInfo = (title: string, message: string) => {
    showToast(title, message, 'info');
  };

  // Get notifications by type
  const getNotificationsByType = (type: Notification['type']) => {
    return computed(() => 
      notificationsStore.notifications.filter(n => n.type === type)
    );
  };

  // Check if there are unread notifications
  const hasUnreadNotifications = computed(() => unreadCount.value > 0);

  return {
    // State
    notifications,
    unreadNotifications,
    readNotifications,
    unreadCount,
    loading,
    error,
    hasUnreadNotifications,
    
    // Methods
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
    getNotificationsByType,
    
    // Toast methods
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
}
