import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import Notification from '../models/Notification.js';
import socketService from '../services/socketService.js';

// Get all notifications for current user
export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const unreadOnly = req.query.unreadOnly === 'true';

    const query: any = { recipient: userId };
    if (unreadOnly) {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .populate('sender', 'firstName lastName avatar')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ 
      recipient: userId, 
      read: false 
    });

    res.json({
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      unreadCount
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des notifications' });
  }
};

// Get unread count
export const getUnreadCount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const count = await Notification.countDocuments({ 
      recipient: userId, 
      read: false 
    });

    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ message: 'Erreur lors du comptage des notifications' });
  }
};

// Create a notification (typically called from other services)
export const createNotification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { recipient, type, title, message, link, metadata } = req.body;

    const notification = await Notification.create({
      recipient,
      sender: req.user?.id,
      type,
      title,
      message,
      link,
      metadata
    });

    // Populate sender information
    await notification.populate('sender', 'firstName lastName avatar');

    // Send real-time notification via Socket.io
    await socketService.sendNotificationToUser(recipient, notification);

    res.status(201).json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: 'Erreur lors de la création de la notification' });
  }
};

// Mark notification as read
export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipient: userId },
      { read: true, readAt: new Date() },
      { new: true }
    ).populate('sender', 'firstName lastName avatar');

    if (!notification) {
      res.status(404).json({ message: 'Notification non trouvée' });
      return;
    }

    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la notification' });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    await Notification.updateMany(
      { recipient: userId, read: false },
      { read: true, readAt: new Date() }
    );

    res.json({ message: 'Toutes les notifications ont été marquées comme lues' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour des notifications' });
  }
};

// Delete notification
export const deleteNotification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      recipient: userId
    });

    if (!notification) {
      res.status(404).json({ message: 'Notification non trouvée' });
      return;
    }

    res.json({ message: 'Notification supprimée avec succès' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression de la notification' });
  }
};

// Delete all read notifications
export const deleteAllRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    const result = await Notification.deleteMany({
      recipient: userId,
      read: true
    });

    res.json({ 
      message: 'Notifications lues supprimées avec succès',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error deleting read notifications:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression des notifications' });
  }
};

// Helper function to send notification (can be imported by other controllers)
export const sendNotification = async (
  recipientId: string,
  type: string,
  title: string,
  message: string,
  link?: string,
  senderId?: string,
  metadata?: Record<string, any>
) => {
  try {
    const notification = await Notification.create({
      recipient: recipientId,
      sender: senderId,
      type,
      title,
      message,
      link,
      metadata
    });

    await notification.populate('sender', 'firstName lastName avatar');

    // Send real-time notification
    await socketService.sendNotificationToUser(recipientId, notification);

    return notification;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};
