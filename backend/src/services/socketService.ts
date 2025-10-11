import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import Notification from '../models/Notification.js';

interface SocketUser {
  userId: string;
  role: string;
}

class SocketService {
  private io: Server | null = null;
  private userSockets: Map<string, Set<string>> = new Map(); // userId -> Set of socketIds

  initialize(httpServer: HttpServer): Server {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        credentials: true
      }
    });

    this.io.use(this.authenticateSocket.bind(this));
    this.io.on('connection', this.handleConnection.bind(this));

    console.log('✅ Socket.io initialized');
    return this.io;
  }

  private async authenticateSocket(socket: Socket, next: (err?: Error) => void) {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as SocketUser;
      socket.data.user = decoded;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  }

  private handleConnection(socket: Socket) {
    const userId = socket.data.user?.userId;
    
    if (!userId) {
      console.log('❌ Connection rejected: No user ID');
      socket.disconnect();
      return;
    }

    console.log(`✅ User connected: ${userId} (socket: ${socket.id})`);

    // Track user's socket
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)?.add(socket.id);

    // Join user's personal room
    socket.join(`user:${userId}`);

    // Handle events
    socket.on('disconnect', () => this.handleDisconnect(socket, userId));
    socket.on('mark_notification_read', (notificationId: string) => 
      this.handleMarkNotificationRead(socket, notificationId)
    );
    socket.on('mark_all_read', () => this.handleMarkAllRead(socket, userId));
  }

  private handleDisconnect(socket: Socket, userId: string) {
    console.log(`👋 User disconnected: ${userId} (socket: ${socket.id})`);
    
    const userSocketSet = this.userSockets.get(userId);
    if (userSocketSet) {
      userSocketSet.delete(socket.id);
      if (userSocketSet.size === 0) {
        this.userSockets.delete(userId);
      }
    }
  }

  private async handleMarkNotificationRead(socket: Socket, notificationId: string) {
    try {
      const userId = socket.data.user?.userId;
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, recipient: userId },
        { read: true, readAt: new Date() },
        { new: true }
      );

      if (notification) {
        socket.emit('notification_updated', notification);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  private async handleMarkAllRead(socket: Socket, userId: string) {
    try {
      await Notification.updateMany(
        { recipient: userId, read: false },
        { read: true, readAt: new Date() }
      );

      socket.emit('all_notifications_read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }

  // Public method to send notification to a user
  async sendNotificationToUser(userId: string, notification: any) {
    if (!this.io) {
      console.error('Socket.io not initialized');
      return;
    }

    // Send to user's room
    this.io.to(`user:${userId}`).emit('new_notification', notification);
  }

  // Public method to broadcast to all connected clients
  broadcast(event: string, data: any) {
    if (!this.io) {
      console.error('Socket.io not initialized');
      return;
    }

    this.io.emit(event, data);
  }

  // Get number of connected users
  getConnectedUsersCount(): number {
    return this.userSockets.size;
  }

  // Check if user is online
  isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId);
  }

  getIO(): Server | null {
    return this.io;
  }
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService;
