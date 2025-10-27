import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useNotification } from './useNotification';
import { useNotificationsStore, type Notification } from '@/stores/notifications';

// Mock the API
vi.mock('@/services/api', () => ({
  default: {
    request: vi.fn(),
  },
}));

describe('useNotification Composable', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  const mockNotification1: Notification = {
    _id: 'notif1',
    recipient: 'user1',
    type: 'message',
    title: 'New Message',
    message: 'You have a new message',
    read: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockNotification2: Notification = {
    _id: 'notif2',
    recipient: 'user1',
    type: 'payment',
    title: 'Payment Received',
    message: 'Your payment has been received',
    read: true,
    readAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  describe('Computed Properties', () => {
    it('should return all notifications', () => {
      const { notifications } = useNotification();
      const store = useNotificationsStore();
      
      store.notifications = [mockNotification1, mockNotification2];
      
      expect(notifications.value).toHaveLength(2);
      expect(notifications.value[0]._id).toBe(mockNotification1._id);
    });

    it('should return unread notifications', () => {
      const { unreadNotifications } = useNotification();
      const store = useNotificationsStore();
      
      store.notifications = [mockNotification1, mockNotification2];
      
      expect(unreadNotifications.value).toHaveLength(1);
      expect(unreadNotifications.value[0]).toEqual(mockNotification1);
    });

    it('should return read notifications', () => {
      const { readNotifications } = useNotification();
      const store = useNotificationsStore();
      
      store.notifications = [mockNotification1, mockNotification2];
      
      expect(readNotifications.value).toHaveLength(1);
      expect(readNotifications.value[0]).toEqual(mockNotification2);
    });

    it('should return unread count', () => {
      const { unreadCount } = useNotification();
      const store = useNotificationsStore();
      
      store.unreadCount = 5;
      
      expect(unreadCount.value).toBe(5);
    });

    it('should check if there are unread notifications', () => {
      const { hasUnreadNotifications } = useNotification();
      const store = useNotificationsStore();
      
      store.unreadCount = 0;
      expect(hasUnreadNotifications.value).toBe(false);
      
      store.unreadCount = 3;
      expect(hasUnreadNotifications.value).toBe(true);
    });
  });

  describe('Fetch Methods', () => {
    it('should fetch notifications', async () => {
      const { fetchNotifications } = useNotification();
      const store = useNotificationsStore();
      
      const fetchSpy = vi.spyOn(store, 'fetchNotifications').mockResolvedValue();
      
      await fetchNotifications();
      
      expect(fetchSpy).toHaveBeenCalledWith(false);
    });

    it('should fetch unread notifications only', async () => {
      const { fetchNotifications } = useNotification();
      const store = useNotificationsStore();
      
      const fetchSpy = vi.spyOn(store, 'fetchNotifications').mockResolvedValue();
      
      await fetchNotifications(true);
      
      expect(fetchSpy).toHaveBeenCalledWith(true);
    });

    it('should fetch unread count', async () => {
      const { fetchUnreadCount } = useNotification();
      const store = useNotificationsStore();
      
      const fetchSpy = vi.spyOn(store, 'fetchUnreadCount').mockResolvedValue();
      
      await fetchUnreadCount();
      
      expect(fetchSpy).toHaveBeenCalled();
    });
  });

  describe('Mark as Read Methods', () => {
    it('should mark notification as read', async () => {
      const { markAsRead } = useNotification();
      const store = useNotificationsStore();
      
      const markSpy = vi.spyOn(store, 'markAsRead').mockResolvedValue();
      
      await markAsRead('notif1');
      
      expect(markSpy).toHaveBeenCalledWith('notif1');
    });

    it('should mark all notifications as read', async () => {
      const { markAllAsRead } = useNotification();
      const store = useNotificationsStore();
      
      const markAllSpy = vi.spyOn(store, 'markAllAsRead').mockResolvedValue();
      
      await markAllAsRead();
      
      expect(markAllSpy).toHaveBeenCalled();
    });
  });

  describe('Delete Method', () => {
    it('should delete notification', async () => {
      const { deleteNotification } = useNotification();
      const store = useNotificationsStore();
      
      const deleteSpy = vi.spyOn(store, 'deleteNotification').mockResolvedValue();
      
      await deleteNotification('notif1');
      
      expect(deleteSpy).toHaveBeenCalledWith('notif1');
    });
  });

  describe('Add Notification Method', () => {
    it('should add notification', () => {
      const { addNotification } = useNotification();
      const store = useNotificationsStore();
      
      const addSpy = vi.spyOn(store, 'addNotification');
      
      addNotification(mockNotification1);
      
      expect(addSpy).toHaveBeenCalledWith(mockNotification1);
    });
  });

  describe('Get Notifications By Type', () => {
    it('should filter notifications by type', () => {
      const { getNotificationsByType } = useNotification();
      const store = useNotificationsStore();
      
      store.notifications = [mockNotification1, mockNotification2];
      
      const messageNotifications = getNotificationsByType('message');
      expect(messageNotifications.value).toHaveLength(1);
      expect(messageNotifications.value[0].type).toBe('message');
      
      const paymentNotifications = getNotificationsByType('payment');
      expect(paymentNotifications.value).toHaveLength(1);
      expect(paymentNotifications.value[0].type).toBe('payment');
    });
  });

  describe('Toast Methods', () => {
    beforeEach(() => {
      // Mock console.log to avoid cluttering test output
      vi.spyOn(console, 'log').mockImplementation(() => {});
      // Mock window.dispatchEvent
      vi.spyOn(window, 'dispatchEvent');
    });

    it('should show toast notification', () => {
      const { showToast } = useNotification();
      
      showToast('Test Title', 'Test Message', 'info');
      
      expect(console.log).toHaveBeenCalledWith('[INFO] Test Title: Test Message');
      expect(window.dispatchEvent).toHaveBeenCalled();
    });

    it('should show success toast', () => {
      const { showSuccess } = useNotification();
      
      showSuccess('Success', 'Operation completed');
      
      expect(console.log).toHaveBeenCalledWith('[SUCCESS] Success: Operation completed');
    });

    it('should show error toast', () => {
      const { showError } = useNotification();
      
      showError('Error', 'Something went wrong');
      
      expect(console.log).toHaveBeenCalledWith('[ERROR] Error: Something went wrong');
    });

    it('should show warning toast', () => {
      const { showWarning } = useNotification();
      
      showWarning('Warning', 'Please be careful');
      
      expect(console.log).toHaveBeenCalledWith('[WARNING] Warning: Please be careful');
    });

    it('should show info toast', () => {
      const { showInfo } = useNotification();
      
      showInfo('Info', 'Here is some information');
      
      expect(console.log).toHaveBeenCalledWith('[INFO] Info: Here is some information');
    });

    it('should dispatch custom event for toast', () => {
      const { showToast } = useNotification();
      
      showToast('Test', 'Message', 'success');
      
      expect(window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'show-toast',
        })
      );
    });
  });
});
