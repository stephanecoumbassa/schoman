import { Response } from 'express';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { AuthRequest } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

export const createMessage = async (req: AuthRequest, res: Response) => {
  try {
    const {
      subject,
      content,
      recipients,
      priority,
      category,
      parentMessage,
    } = req.body;

    // Verify recipients exist
    if (!recipients || recipients.length === 0) {
      return res.status(400).json({ message: 'Au moins un destinataire est requis' });
    }

    const recipientCount = await User.countDocuments({ 
      _id: { $in: recipients },
      isActive: true 
    });
    
    if (recipientCount !== recipients.length) {
      return res.status(404).json({ message: 'Un ou plusieurs destinataires n\'existent pas ou sont inactifs' });
    }

    // Generate conversation ID if replying to a message
    let conversationId: string | undefined;
    if (parentMessage) {
      const parent = await Message.findById(parentMessage);
      if (parent) {
        conversationId = parent.conversationId || (parent._id as any).toString();
      }
    } else {
      conversationId = uuidv4();
    }

    // Create message
    const newMessage = await Message.create({
      subject,
      content,
      sender: req.user!.id,
      recipients,
      conversationId,
      priority: priority || 'normal',
      category: category || 'general',
      parentMessage,
      isArchived: false,
      readBy: [],
    });

    await newMessage.populate([
      { path: 'sender', select: 'firstName lastName email role' },
      { path: 'recipients', select: 'firstName lastName email role' },
    ]);

    res.status(201).json({
      message: 'Message envoyé avec succès',
      data: newMessage,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de l\'envoi du message', error: error.message });
  }
};

export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;

    const userId = req.user!.id;
    const query: any = {
      isArchived: false,
    };

    // Filter by box type
    const box = req.query.box as string;
    if (box === 'sent') {
      query.sender = userId;
    } else {
      // inbox (default)
      query.recipients = userId;
    }

    // Filter by category
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Filter by priority
    if (req.query.priority) {
      query.priority = req.query.priority;
    }

    // Filter by read status
    if (req.query.unreadOnly === 'true' && box !== 'sent') {
      query['readBy.user'] = { $ne: userId };
    }

    // Search in subject and content
    if (req.query.search) {
      query.$text = { $search: req.query.search as string };
    }

    const messages = await Message.find(query)
      .populate('sender', 'firstName lastName email role')
      .populate('recipients', 'firstName lastName email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Message.countDocuments(query);

    res.json({
      messages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la récupération des messages', error: error.message });
  }
};

export const getMessage = async (req: AuthRequest, res: Response) => {
  try {
    const message = await Message.findById(req.params.id)
      .populate('sender', 'firstName lastName email role')
      .populate('recipients', 'firstName lastName email role')
      .populate('parentMessage', 'subject sender createdAt');

    if (!message) {
      return res.status(404).json({ message: 'Message non trouvé' });
    }

    const userId = req.user!.id;
    
    // Check if user has access to this message
    const isRecipient = message.recipients.some((r: any) => r._id.toString() === userId);
    const isSender = message.sender._id.toString() === userId;
    
    if (!isRecipient && !isSender && req.user!.role !== 'admin') {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    res.json({ message });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la récupération du message', error: error.message });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message non trouvé' });
    }

    const userId = req.user!.id;
    
    // Check if user is a recipient
    const isRecipient = message.recipients.some((r: any) => r.toString() === userId);
    if (!isRecipient) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    // Check if already marked as read
    const alreadyRead = message.readBy.some((r: any) => r.user.toString() === userId);
    if (!alreadyRead) {
      message.readBy.push({
        user: userId as any,
        readAt: new Date(),
      });
      await message.save();
    }

    await message.populate([
      { path: 'sender', select: 'firstName lastName email role' },
      { path: 'recipients', select: 'firstName lastName email role' },
    ]);

    res.json({
      message: 'Message marqué comme lu',
      data: message,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du message', error: error.message });
  }
};

export const archiveMessage = async (req: AuthRequest, res: Response) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message non trouvé' });
    }

    const userId = req.user!.id;
    
    // Check if user has access to this message
    const isRecipient = message.recipients.some((r: any) => r.toString() === userId);
    const isSender = message.sender.toString() === userId;
    
    if (!isRecipient && !isSender && req.user!.role !== 'admin') {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    message.isArchived = true;
    await message.save();

    res.json({
      message: 'Message archivé avec succès',
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de l\'archivage du message', error: error.message });
  }
};

export const deleteMessage = async (req: AuthRequest, res: Response) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message non trouvé' });
    }

    const userId = req.user!.id;
    
    // Only sender or admin can delete
    if (message.sender.toString() !== userId && req.user!.role !== 'admin') {
      return res.status(403).json({ message: 'Seul l\'expéditeur ou un administrateur peut supprimer ce message' });
    }

    await Message.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Message supprimé avec succès',
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la suppression du message', error: error.message });
  }
};

export const getConversation = async (req: AuthRequest, res: Response) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user!.id;

    const messages = await Message.find({
      conversationId,
      $or: [
        { sender: userId },
        { recipients: userId },
      ],
    })
      .populate('sender', 'firstName lastName email role')
      .populate('recipients', 'firstName lastName email role')
      .sort({ createdAt: 1 });

    if (messages.length === 0) {
      return res.status(404).json({ message: 'Conversation non trouvée' });
    }

    res.json({
      messages,
      conversationId,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la récupération de la conversation', error: error.message });
  }
};

export const getMessageStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const [totalReceived, totalSent, unreadCount, byCategory, byPriority] = await Promise.all([
      Message.countDocuments({
        recipients: userId,
        isArchived: false,
      }),
      Message.countDocuments({
        sender: userId,
        isArchived: false,
      }),
      Message.countDocuments({
        recipients: userId,
        isArchived: false,
        'readBy.user': { $ne: userId },
      }),
      Message.aggregate([
        {
          $match: {
            recipients: userId,
            isArchived: false,
          },
        },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
          },
        },
      ]),
      Message.aggregate([
        {
          $match: {
            recipients: userId,
            isArchived: false,
          },
        },
        {
          $group: {
            _id: '$priority',
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    res.json({
      totalReceived,
      totalSent,
      unreadCount,
      readPercentage: totalReceived > 0 ? ((totalReceived - unreadCount) / totalReceived * 100).toFixed(1) : 0,
      byCategory: byCategory.reduce((acc: any, item: any) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      byPriority: byPriority.reduce((acc: any, item: any) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques', error: error.message });
  }
};
