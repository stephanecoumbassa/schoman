import { Response } from 'express';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Class from '../models/Class.js';
import { AuthRequest } from '../middleware/auth.js';

export const getStats = async (req: AuthRequest, res: Response) => {
  try {
    // Count users by role
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalStudents = await User.countDocuments({ role: 'student', isActive: true });
    const totalTeachers = await User.countDocuments({ role: 'teacher', isActive: true });
    const totalParents = await User.countDocuments({ role: 'parent', isActive: true });

    // Count active students
    const activeStudents = await Student.countDocuments({ isActive: true });

    // Count classes
    const totalClasses = await Class.countDocuments({ isActive: true });

    // Get recent students
    const recentStudents = await Student.find({ isActive: true })
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(5);

    // Calculate enrollment by level (if applicable)
    const enrollmentByLevel = await Student.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$level', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      stats: {
        totalUsers,
        totalStudents,
        totalTeachers,
        totalParents,
        activeStudents,
        totalClasses,
      },
      recentStudents,
      enrollmentByLevel,
    });
  } catch (error: any) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques', error: error.message });
  }
};
