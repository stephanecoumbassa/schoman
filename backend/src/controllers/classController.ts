import { Response } from 'express';
import Class from '../models/Class.js';
import User from '../models/User.js';
import Student from '../models/Student.js';
import { AuthRequest } from '../middleware/auth.js';

export const createClass = async (req: AuthRequest, res: Response) => {
  try {
    const { 
      name, level, academicYear, maxCapacity, 
      mainTeacher, schedule, room 
    } = req.body;

    // Verify teacher exists if provided
    if (mainTeacher) {
      const teacher = await User.findById(mainTeacher);
      if (!teacher || teacher.role !== 'teacher') {
        return res.status(400).json({ message: 'Enseignant invalide' });
      }
    }

    const newClass = await Class.create({
      name,
      level,
      academicYear,
      maxCapacity: maxCapacity || 30,
      mainTeacher,
      schedule,
      room,
      currentEnrollment: 0,
      isActive: true,
    });

    await newClass.populate('mainTeacher', 'firstName lastName email');
    
    res.status(201).json({
      message: 'Classe créée avec succès',
      class: newClass,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la création de la classe', error: error.message });
  }
};

export const getClasses = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    const skip = (page - 1) * limit;

    const query: any = {};
    
    // Filter by level
    if (req.query.level) {
      query.level = req.query.level;
    }

    // Filter by academic year
    if (req.query.academicYear) {
      query.academicYear = req.query.academicYear;
    }

    // Filter by active status
    if (req.query.isActive !== undefined) {
      query.isActive = req.query.isActive === 'true';
    }

    // Search by name
    if (req.query.search) {
      query.name = { $regex: req.query.search, $options: 'i' };
    }

    const total = await Class.countDocuments(query);
    const classes = await Class.find(query)
      .populate('mainTeacher', 'firstName lastName email')
      .sort({ academicYear: -1, level: 1, name: 1 })
      .limit(limit)
      .skip(skip);

    res.json({
      classes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la récupération des classes', error: error.message });
  }
};

export const getClass = async (req: AuthRequest, res: Response) => {
  try {
    const classData = await Class.findById(req.params.id)
      .populate('mainTeacher', 'firstName lastName email');

    if (!classData) {
      return res.status(404).json({ message: 'Classe non trouvée' });
    }

    // Get students in this class
    const students = await Student.find({ 
      class: classData._id,
      isActive: true 
    }).populate('userId', 'firstName lastName email');

    res.json({
      class: classData,
      students,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la récupération de la classe', error: error.message });
  }
};

export const updateClass = async (req: AuthRequest, res: Response) => {
  try {
    const { 
      name, level, academicYear, maxCapacity, 
      mainTeacher, schedule, room, isActive 
    } = req.body;

    // Verify teacher exists if provided
    if (mainTeacher) {
      const teacher = await User.findById(mainTeacher);
      if (!teacher || teacher.role !== 'teacher') {
        return res.status(400).json({ message: 'Enseignant invalide' });
      }
    }

    const updatedClass = await Class.findByIdAndUpdate(
      req.params.id,
      {
        name,
        level,
        academicYear,
        maxCapacity,
        mainTeacher,
        schedule,
        room,
        isActive,
      },
      { new: true, runValidators: true }
    ).populate('mainTeacher', 'firstName lastName email');

    if (!updatedClass) {
      return res.status(404).json({ message: 'Classe non trouvée' });
    }

    res.json({
      message: 'Classe mise à jour avec succès',
      class: updatedClass,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la classe', error: error.message });
  }
};

export const deleteClass = async (req: AuthRequest, res: Response) => {
  try {
    const classData = await Class.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!classData) {
      return res.status(404).json({ message: 'Classe non trouvée' });
    }

    res.json({
      message: 'Classe désactivée avec succès',
      class: classData,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la désactivation de la classe', error: error.message });
  }
};

export const getClassStatistics = async (req: AuthRequest, res: Response) => {
  try {
    const classData = await Class.findById(req.params.id);

    if (!classData) {
      return res.status(404).json({ message: 'Classe non trouvée' });
    }

    const totalStudents = await Student.countDocuments({ 
      class: classData._id,
      isActive: true 
    });

    const maleStudents = await Student.countDocuments({ 
      class: classData._id,
      gender: 'M',
      isActive: true 
    });

    const femaleStudents = await Student.countDocuments({ 
      class: classData._id,
      gender: 'F',
      isActive: true 
    });

    res.json({
      classId: classData._id,
      className: classData.name,
      totalStudents,
      maleStudents,
      femaleStudents,
      maxCapacity: classData.maxCapacity,
      availableSeats: classData.maxCapacity - totalStudents,
      occupancyRate: totalStudents > 0 ? (totalStudents / classData.maxCapacity * 100).toFixed(2) : 0,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques', error: error.message });
  }
};
