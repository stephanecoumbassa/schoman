import { Response } from 'express';
import Attendance from '../models/Attendance.js';
import Student from '../models/Student.js';
import Class from '../models/Class.js';
import { AuthRequest } from '../middleware/auth.js';

export const recordAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const { 
      student, class: classId, date, status, 
      timeIn, timeOut, reason, comments 
    } = req.body;

    // Verify student exists
    const studentExists = await Student.findById(student);
    if (!studentExists) {
      return res.status(404).json({ message: 'Élève non trouvé' });
    }

    // Verify class exists
    const classExists = await Class.findById(classId);
    if (!classExists) {
      return res.status(404).json({ message: 'Classe non trouvée' });
    }

    // Check if attendance already exists for this student/class/date
    const existingAttendance = await Attendance.findOne({
      student,
      class: classId,
      date: new Date(date).setHours(0, 0, 0, 0),
    });

    if (existingAttendance) {
      return res.status(400).json({ message: 'La présence pour cet élève à cette date existe déjà' });
    }

    const newAttendance = await Attendance.create({
      student,
      class: classId,
      date: date || new Date(),
      status,
      timeIn,
      timeOut,
      reason,
      comments,
      recordedBy: req.user!.id,
    });

    await newAttendance.populate([
      { path: 'student', select: 'userId', populate: { path: 'userId', select: 'firstName lastName' } },
      { path: 'class', select: 'name level' },
      { path: 'recordedBy', select: 'firstName lastName' },
    ]);
    
    res.status(201).json({
      message: 'Présence enregistrée avec succès',
      attendance: newAttendance,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de l\'enregistrement de la présence', error: error.message });
  }
};

export const getAttendances = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    const skip = (page - 1) * limit;

    const query: any = {};
    
    // Filter by student
    if (req.query.student) {
      query.student = req.query.student;
    }

    // Filter by class
    if (req.query.class) {
      query.class = req.query.class;
    }

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by date range
    if (req.query.startDate || req.query.endDate) {
      query.date = {};
      if (req.query.startDate) {
        query.date.$gte = new Date(req.query.startDate as string);
      }
      if (req.query.endDate) {
        query.date.$lte = new Date(req.query.endDate as string);
      }
    }

    const total = await Attendance.countDocuments(query);
    const attendances = await Attendance.find(query)
      .populate('student', 'userId')
      .populate('class', 'name level')
      .populate('recordedBy', 'firstName lastName')
      .sort({ date: -1 })
      .limit(limit)
      .skip(skip);

    // Populate nested userId in student
    await Student.populate(attendances, { path: 'student.userId', select: 'firstName lastName' });

    res.json({
      attendances,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la récupération des présences', error: error.message });
  }
};

export const getAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const attendance = await Attendance.findById(req.params.id)
      .populate('student', 'userId')
      .populate('class', 'name level')
      .populate('recordedBy', 'firstName lastName');

    if (!attendance) {
      return res.status(404).json({ message: 'Présence non trouvée' });
    }

    // Populate nested userId in student
    await Student.populate(attendance, { path: 'student.userId', select: 'firstName lastName email' });

    res.json({ attendance });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la récupération de la présence', error: error.message });
  }
};

export const updateAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const { status, timeIn, timeOut, reason, comments } = req.body;

    const updatedAttendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      {
        status,
        timeIn,
        timeOut,
        reason,
        comments,
      },
      { new: true, runValidators: true }
    ).populate([
      { path: 'student', select: 'userId', populate: { path: 'userId', select: 'firstName lastName' } },
      { path: 'class', select: 'name level' },
      { path: 'recordedBy', select: 'firstName lastName' },
    ]);

    if (!updatedAttendance) {
      return res.status(404).json({ message: 'Présence non trouvée' });
    }

    res.json({
      message: 'Présence mise à jour avec succès',
      attendance: updatedAttendance,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la présence', error: error.message });
  }
};

export const deleteAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);

    if (!attendance) {
      return res.status(404).json({ message: 'Présence non trouvée' });
    }

    res.json({
      message: 'Présence supprimée avec succès',
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la suppression de la présence', error: error.message });
  }
};

export const getStudentAttendanceStats = async (req: AuthRequest, res: Response) => {
  try {
    const { studentId } = req.params;
    const { startDate, endDate } = req.query;

    const query: any = { student: studentId };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate as string);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate as string);
      }
    }

    const attendances = await Attendance.find(query);

    const stats = {
      total: attendances.length,
      present: attendances.filter(a => a.status === 'Present').length,
      absent: attendances.filter(a => a.status === 'Absent').length,
      late: attendances.filter(a => a.status === 'Late').length,
      excused: attendances.filter(a => a.status === 'Excused').length,
    };

    const attendanceRate = stats.total > 0 ? ((stats.present + stats.late) / stats.total * 100).toFixed(2) : '0.00';

    res.json({
      stats,
      attendanceRate,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques', error: error.message });
  }
};

export const getClassAttendanceForDate = async (req: AuthRequest, res: Response) => {
  try {
    const { classId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: 'La date est requise' });
    }

    const targetDate = new Date(date as string);
    targetDate.setHours(0, 0, 0, 0);

    const attendances = await Attendance.find({
      class: classId,
      date: targetDate,
    })
      .populate('student', 'userId')
      .populate('recordedBy', 'firstName lastName');

    // Populate nested userId in student
    await Student.populate(attendances, { path: 'student.userId', select: 'firstName lastName' });

    res.json({ attendances });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la récupération des présences', error: error.message });
  }
};
