import { Response } from 'express';
import Schedule from '../models/Schedule.js';
import Class from '../models/Class.js';
import Subject from '../models/Subject.js';
import User from '../models/User.js';
import { AuthRequest } from '../middleware/auth.js';

// Helper function to check for conflicts
const checkScheduleConflict = async (
  scheduleData: {
    class?: string;
    teacher: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    academicYear: string;
  },
  excludeId?: string
) => {
  const query: any = {
    $or: [
      { teacher: scheduleData.teacher },
      { class: scheduleData.class },
    ],
    dayOfWeek: scheduleData.dayOfWeek,
    academicYear: scheduleData.academicYear,
    isActive: true,
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const existingSchedules = await Schedule.find(query);

  // Check for time overlap
  for (const existing of existingSchedules) {
    const existingStart = existing.startTime.split(':').map(Number);
    const existingEnd = existing.endTime.split(':').map(Number);
    const newStart = scheduleData.startTime.split(':').map(Number);
    const newEnd = scheduleData.endTime.split(':').map(Number);

    const existingStartMin = existingStart[0] * 60 + existingStart[1];
    const existingEndMin = existingEnd[0] * 60 + existingEnd[1];
    const newStartMin = newStart[0] * 60 + newStart[1];
    const newEndMin = newEnd[0] * 60 + newEnd[1];

    // Check if there's an overlap
    if (
      (newStartMin >= existingStartMin && newStartMin < existingEndMin) ||
      (newEndMin > existingStartMin && newEndMin <= existingEndMin) ||
      (newStartMin <= existingStartMin && newEndMin >= existingEndMin)
    ) {
      return existing;
    }
  }

  return null;
};

export const createSchedule = async (req: AuthRequest, res: Response) => {
  try {
    const {
      class: classId,
      subject,
      teacher,
      dayOfWeek,
      startTime,
      endTime,
      room,
      academicYear,
      isRecurring,
      notes,
    } = req.body;

    // Verify class exists
    const classExists = await Class.findById(classId);
    if (!classExists) {
      return res.status(404).json({ message: 'Classe non trouvée' });
    }

    // Verify subject exists
    const subjectExists = await Subject.findById(subject);
    if (!subjectExists) {
      return res.status(404).json({ message: 'Matière non trouvée' });
    }

    // Verify teacher exists
    const teacherExists = await User.findById(teacher);
    if (!teacherExists || teacherExists.role !== 'teacher') {
      return res.status(404).json({ message: 'Enseignant non trouvé' });
    }

    // Check for conflicts
    const conflict = await checkScheduleConflict({
      class: classId,
      teacher,
      dayOfWeek,
      startTime,
      endTime,
      academicYear,
    });

    if (conflict) {
      return res.status(400).json({
        message: 'Conflit d\'horaire détecté',
        conflict: {
          class: conflict.class,
          teacher: conflict.teacher,
          time: `${conflict.startTime} - ${conflict.endTime}`,
        },
      });
    }

    const newSchedule = await Schedule.create({
      class: classId,
      subject,
      teacher,
      dayOfWeek,
      startTime,
      endTime,
      room,
      academicYear,
      isRecurring: isRecurring !== undefined ? isRecurring : true,
      notes,
      isActive: true,
    });

    await newSchedule.populate([
      { path: 'class', select: 'name level' },
      { path: 'subject', select: 'name code color' },
      { path: 'teacher', select: 'firstName lastName' },
    ]);

    res.status(201).json({
      message: 'Emploi du temps créé avec succès',
      schedule: newSchedule,
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Erreur lors de la création de l\'emploi du temps',
      error: error.message,
    });
  }
};

export const getSchedules = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const skip = (page - 1) * limit;

    const query: any = {};

    // Filter by class
    if (req.query.class) {
      query.class = req.query.class;
    }

    // Filter by teacher
    if (req.query.teacher) {
      query.teacher = req.query.teacher;
    }

    // Filter by day of week
    if (req.query.dayOfWeek) {
      query.dayOfWeek = req.query.dayOfWeek;
    }

    // Filter by academic year
    if (req.query.academicYear) {
      query.academicYear = req.query.academicYear;
    }

    // Filter by active status
    if (req.query.isActive !== undefined) {
      query.isActive = req.query.isActive === 'true';
    }

    const total = await Schedule.countDocuments(query);
    const schedules = await Schedule.find(query)
      .populate('class', 'name level')
      .populate('subject', 'name code color')
      .populate('teacher', 'firstName lastName')
      .sort({ dayOfWeek: 1, startTime: 1 })
      .limit(limit)
      .skip(skip);

    res.json({
      schedules,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Erreur lors de la récupération des emplois du temps',
      error: error.message,
    });
  }
};

export const getSchedule = async (req: AuthRequest, res: Response) => {
  try {
    const schedule = await Schedule.findById(req.params.id)
      .populate('class', 'name level')
      .populate('subject', 'name code color')
      .populate('teacher', 'firstName lastName email');

    if (!schedule) {
      return res.status(404).json({ message: 'Emploi du temps non trouvé' });
    }

    res.json({ schedule });
  } catch (error: any) {
    res.status(500).json({
      message: 'Erreur lors de la récupération de l\'emploi du temps',
      error: error.message,
    });
  }
};

export const updateSchedule = async (req: AuthRequest, res: Response) => {
  try {
    const {
      class: classId,
      subject,
      teacher,
      dayOfWeek,
      startTime,
      endTime,
      room,
      academicYear,
      isRecurring,
      notes,
      isActive,
    } = req.body;

    // Verify entities exist if provided
    if (classId) {
      const classExists = await Class.findById(classId);
      if (!classExists) {
        return res.status(404).json({ message: 'Classe non trouvée' });
      }
    }

    if (subject) {
      const subjectExists = await Subject.findById(subject);
      if (!subjectExists) {
        return res.status(404).json({ message: 'Matière non trouvée' });
      }
    }

    if (teacher) {
      const teacherExists = await User.findById(teacher);
      if (!teacherExists || teacherExists.role !== 'teacher') {
        return res.status(404).json({ message: 'Enseignant non trouvé' });
      }
    }

    // Check for conflicts if time or day is being updated
    if (teacher || dayOfWeek || startTime || endTime) {
      const currentSchedule = await Schedule.findById(req.params.id);
      if (!currentSchedule) {
        return res.status(404).json({ message: 'Emploi du temps non trouvé' });
      }

      const conflict = await checkScheduleConflict(
        {
          class: classId || currentSchedule.class.toString(),
          teacher: teacher || currentSchedule.teacher.toString(),
          dayOfWeek: dayOfWeek || currentSchedule.dayOfWeek,
          startTime: startTime || currentSchedule.startTime,
          endTime: endTime || currentSchedule.endTime,
          academicYear: academicYear || currentSchedule.academicYear,
        },
        req.params.id
      );

      if (conflict) {
        return res.status(400).json({
          message: 'Conflit d\'horaire détecté',
          conflict: {
            class: conflict.class,
            teacher: conflict.teacher,
            time: `${conflict.startTime} - ${conflict.endTime}`,
          },
        });
      }
    }

    const updatedSchedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      {
        class: classId,
        subject,
        teacher,
        dayOfWeek,
        startTime,
        endTime,
        room,
        academicYear,
        isRecurring,
        notes,
        isActive,
      },
      { new: true, runValidators: true }
    )
      .populate('class', 'name level')
      .populate('subject', 'name code color')
      .populate('teacher', 'firstName lastName');

    if (!updatedSchedule) {
      return res.status(404).json({ message: 'Emploi du temps non trouvé' });
    }

    res.json({
      message: 'Emploi du temps mis à jour avec succès',
      schedule: updatedSchedule,
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Erreur lors de la mise à jour de l\'emploi du temps',
      error: error.message,
    });
  }
};

export const deleteSchedule = async (req: AuthRequest, res: Response) => {
  try {
    const schedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!schedule) {
      return res.status(404).json({ message: 'Emploi du temps non trouvé' });
    }

    res.json({
      message: 'Emploi du temps désactivé avec succès',
      schedule,
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Erreur lors de la désactivation de l\'emploi du temps',
      error: error.message,
    });
  }
};

export const getClassSchedule = async (req: AuthRequest, res: Response) => {
  try {
    const { classId } = req.params;
    const academicYear = req.query.academicYear as string || '2024-2025';

    const schedules = await Schedule.find({
      class: classId,
      academicYear,
      isActive: true,
    })
      .populate('subject', 'name code color')
      .populate('teacher', 'firstName lastName')
      .sort({ dayOfWeek: 1, startTime: 1 });

    res.json({
      classId,
      academicYear,
      schedules,
      count: schedules.length,
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Erreur lors de la récupération de l\'emploi du temps de la classe',
      error: error.message,
    });
  }
};

export const getTeacherSchedule = async (req: AuthRequest, res: Response) => {
  try {
    const { teacherId } = req.params;
    const academicYear = req.query.academicYear as string || '2024-2025';

    const schedules = await Schedule.find({
      teacher: teacherId,
      academicYear,
      isActive: true,
    })
      .populate('class', 'name level')
      .populate('subject', 'name code color')
      .sort({ dayOfWeek: 1, startTime: 1 });

    res.json({
      teacherId,
      academicYear,
      schedules,
      count: schedules.length,
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Erreur lors de la récupération de l\'emploi du temps de l\'enseignant',
      error: error.message,
    });
  }
};
