import { Response } from 'express';
import Event from '../models/Event.js';
import Class from '../models/Class.js';
import { AuthRequest } from '../middleware/auth.js';

export const createEvent = async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      description,
      eventType,
      startDate,
      endDate,
      location,
      organizer,
      targetAudience,
      classes,
      maxParticipants,
      notes,
    } = req.body;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      return res.status(400).json({ message: 'La date de fin doit être après la date de début' });
    }

    // Verify classes exist if provided
    if (classes && classes.length > 0) {
      const classCount = await Class.countDocuments({ _id: { $in: classes } });
      if (classCount !== classes.length) {
        return res.status(404).json({ message: 'Une ou plusieurs classes n\'existent pas' });
      }
    }

    // Create event
    const newEvent = await Event.create({
      title,
      description,
      eventType,
      startDate: start,
      endDate: end,
      location,
      organizer,
      targetAudience: targetAudience || ['all'],
      classes,
      maxParticipants,
      currentParticipants: 0,
      status: 'planned',
      notes,
      createdBy: req.user!.id,
    });

    await newEvent.populate([
      { path: 'organizer', select: 'firstName lastName email' },
      { path: 'classes', select: 'name level' },
      { path: 'createdBy', select: 'firstName lastName' },
    ]);

    res.status(201).json({
      message: 'Événement créé avec succès',
      event: newEvent,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la création de l\'événement', error: error.message });
  }
};

export const getEvents = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    const skip = (page - 1) * limit;

    const query: any = {};

    // Filter by event type
    if (req.query.eventType) {
      query.eventType = req.query.eventType;
    }

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by date range
    if (req.query.startDate || req.query.endDate) {
      query.startDate = {};
      if (req.query.startDate) {
        query.startDate.$gte = new Date(req.query.startDate as string);
      }
      if (req.query.endDate) {
        query.startDate.$lte = new Date(req.query.endDate as string);
      }
    }

    // Search by title or description
    if (req.query.search) {
      query.$text = { $search: req.query.search as string };
    }

    const [events, total] = await Promise.all([
      Event.find(query)
        .populate('organizer', 'firstName lastName email')
        .populate('classes', 'name level')
        .populate('createdBy', 'firstName lastName')
        .sort({ startDate: -1 })
        .skip(skip)
        .limit(limit),
      Event.countDocuments(query),
    ]);

    res.json({
      events,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la récupération des événements', error: error.message });
  }
};

export const getEventById = async (req: AuthRequest, res: Response) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'firstName lastName email phone')
      .populate('classes', 'name level academicYear')
      .populate('createdBy', 'firstName lastName');

    if (!event) {
      return res.status(404).json({ message: 'Événement non trouvé' });
    }

    res.json({ event });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'événement', error: error.message });
  }
};

export const updateEvent = async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      description,
      eventType,
      startDate,
      endDate,
      location,
      organizer,
      targetAudience,
      classes,
      maxParticipants,
      status,
      notes,
    } = req.body;

    // Validate dates if provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end < start) {
        return res.status(400).json({ message: 'La date de fin doit être après la date de début' });
      }
    }

    // Verify classes exist if provided
    if (classes && classes.length > 0) {
      const classCount = await Class.countDocuments({ _id: { $in: classes } });
      if (classCount !== classes.length) {
        return res.status(404).json({ message: 'Une ou plusieurs classes n\'existent pas' });
      }
    }

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        eventType,
        startDate,
        endDate,
        location,
        organizer,
        targetAudience,
        classes,
        maxParticipants,
        status,
        notes,
      },
      { new: true, runValidators: true }
    )
      .populate('organizer', 'firstName lastName email')
      .populate('classes', 'name level')
      .populate('createdBy', 'firstName lastName');

    if (!event) {
      return res.status(404).json({ message: 'Événement non trouvé' });
    }

    res.json({
      message: 'Événement mis à jour avec succès',
      event,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'événement', error: error.message });
  }
};

export const deleteEvent = async (req: AuthRequest, res: Response) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Événement non trouvé' });
    }

    res.json({ message: 'Événement supprimé avec succès' });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'événement', error: error.message });
  }
};

export const getEventStats = async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date();

    const [
      totalEvents,
      upcomingEvents,
      ongoingEvents,
      completedEvents,
      eventsByType,
    ] = await Promise.all([
      Event.countDocuments({ status: { $ne: 'cancelled' } }),
      Event.countDocuments({
        status: 'planned',
        startDate: { $gt: now },
      }),
      Event.countDocuments({
        status: 'ongoing',
      }),
      Event.countDocuments({
        status: 'completed',
      }),
      Event.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        {
          $group: {
            _id: '$eventType',
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    res.json({
      totalEvents,
      upcomingEvents,
      ongoingEvents,
      completedEvents,
      eventsByType,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques', error: error.message });
  }
};
