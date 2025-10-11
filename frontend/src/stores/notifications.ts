import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '../services/api';

export interface Notification {
  _id: string;
  recipient: string;
  sender?: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  type: 'message' | 'payment' | 'grade' | 'attendance' | 'invoice' | 'system' | 'announcement';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  readAt?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref<Notification[]>([]);
  const unreadCount = ref(0);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Computed
  const unreadNotifications = computed(() => 
    notifications.value.filter(n => !n.read)
  );

  const readNotifications = computed(() => 
    notifications.value.filter(n => n.read)
  );

  // Actions
  const fetchNotifications = async (unreadOnly = false) => {
    loading.value = true;
    error.value = null;
    
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('unreadOnly', String(unreadOnly));
      queryParams.append('limit', '50');
      
      const response = await api.request<{ notifications: Notification[]; unreadCount: number }>(
        `/notifications?${queryParams}`
      );
      
      if (response.data) {
        notifications.value = response.data.notifications;
        unreadCount.value = response.data.unreadCount;
      } else {
        error.value = response.error || 'Erreur lors du chargement des notifications';
      }
    } catch (err: any) {
      error.value = 'Erreur lors du chargement des notifications';
      console.error('Error fetching notifications:', err);
    } finally {
      loading.value = false;
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await api.request<{ count: number }>('/notifications/unread-count');
      if (response.data) {
        unreadCount.value = response.data.count;
      }
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  const addNotification = (notification: Notification) => {
    // Add to beginning of array
    notifications.value.unshift(notification);
    if (!notification.read) {
      unreadCount.value++;
    }
  };

  const updateNotification = (updatedNotification: Notification) => {
    const index = notifications.value.findIndex(n => n._id === updatedNotification._id);
    if (index !== -1) {
      const notification = notifications.value[index];
      if (notification) {
        const wasUnread = !notification.read;
        notifications.value[index] = updatedNotification;
        
        if (wasUnread && updatedNotification.read) {
          unreadCount.value = Math.max(0, unreadCount.value - 1);
        }
      }
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await api.request<Notification>(
        `/notifications/${notificationId}/read`,
        { method: 'PUT' }
      );
      if (response.data) {
        updateNotification(response.data);
      } else {
        error.value = response.error || 'Erreur lors de la mise à jour';
      }
    } catch (err: any) {
      error.value = 'Erreur lors de la mise à jour';
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.request('/notifications/mark-all-read', { method: 'PUT' });
      
      notifications.value = notifications.value.map(n => ({
        ...n,
        read: true,
        readAt: new Date().toISOString()
      }));
      
      unreadCount.value = 0;
    } catch (err: any) {
      error.value = 'Erreur lors de la mise à jour';
      console.error('Error marking all as read:', err);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await api.request(`/notifications/${notificationId}`, { method: 'DELETE' });
      
      const index = notifications.value.findIndex(n => n._id === notificationId);
      if (index !== -1) {
        const notification = notifications.value[index];
        if (notification) {
          const wasUnread = !notification.read;
          notifications.value.splice(index, 1);
          
          if (wasUnread) {
            unreadCount.value = Math.max(0, unreadCount.value - 1);
          }
        }
      }
    } catch (err: any) {
      error.value = 'Erreur lors de la suppression';
      console.error('Error deleting notification:', err);
    }
  };

  const deleteAllRead = async () => {
    try {
      await api.request('/notifications/read/all', { method: 'DELETE' });
      notifications.value = notifications.value.filter(n => !n.read);
    } catch (err: any) {
      error.value = 'Erreur lors de la suppression';
      console.error('Error deleting read notifications:', err);
    }
  };

  const reset = () => {
    notifications.value = [];
    unreadCount.value = 0;
    loading.value = false;
    error.value = null;
  };

  return {
    // State
    notifications,
    unreadCount,
    loading,
    error,
    
    // Computed
    unreadNotifications,
    readNotifications,
    
    // Actions
    fetchNotifications,
    fetchUnreadCount,
    addNotification,
    updateNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
    reset
  };
});
