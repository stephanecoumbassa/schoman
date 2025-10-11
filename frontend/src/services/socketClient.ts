import { io, Socket } from 'socket.io-client';
import { useNotificationsStore } from '../stores/notifications';

class SocketClient {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(token: string): void {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    const serverUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    this.socket = io(serverUrl, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts
    });

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket?.id);
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('👋 Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.disconnect();
      }
    });

    // Listen for new notifications
    this.socket.on('new_notification', (notification) => {
      console.log('🔔 New notification received:', notification);
      const notificationsStore = useNotificationsStore();
      notificationsStore.addNotification(notification);
    });

    // Listen for notification updates
    this.socket.on('notification_updated', (notification) => {
      console.log('🔄 Notification updated:', notification);
      const notificationsStore = useNotificationsStore();
      notificationsStore.updateNotification(notification);
    });

    // Listen for all notifications read event
    this.socket.on('all_notifications_read', () => {
      console.log('✅ All notifications marked as read');
      const notificationsStore = useNotificationsStore();
      notificationsStore.markAllAsRead();
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('Socket disconnected manually');
    }
  }

  markNotificationRead(notificationId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('mark_notification_read', notificationId);
    }
  }

  markAllRead(): void {
    if (this.socket?.connected) {
      this.socket.emit('mark_all_read');
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

// Export singleton instance
export const socketClient = new SocketClient();
export default socketClient;
