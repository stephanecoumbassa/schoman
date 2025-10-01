import { Response } from 'express';
import Student from '../models/Student';
import Teacher from '../models/Teacher';
import Attendance from '../models/Attendance';
import Invoice from '../models/Invoice';
import Payment from '../models/Payment';
import Expense from '../models/Expense';
import { AuthRequest } from '../middleware/auth';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      return res.status(400).json({ message: 'School ID not found' });
    }

    // Get counts
    const totalStudents = await Student.countDocuments({ schoolId });
    const totalTeachers = await Teacher.countDocuments({ schoolId });

    // Calculate attendance rate for current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const attendanceRecords = await Attendance.find({
      schoolId,
      date: { $gte: startOfMonth },
    });

    const presentCount = attendanceRecords.filter(a => a.status === 'present').length;
    const attendanceRate = attendanceRecords.length > 0 
      ? (presentCount / attendanceRecords.length * 100).toFixed(2)
      : 0;

    // Calculate financial stats
    const totalRevenue = await Payment.aggregate([
      { $match: { schoolId } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalExpenses = await Expense.aggregate([
      { $match: { schoolId, status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const pendingInvoices = await Invoice.countDocuments({ 
      schoolId, 
      status: { $in: ['pending', 'overdue'] } 
    });

    const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;
    const expenses = totalExpenses.length > 0 ? totalExpenses[0].total : 0;

    res.json({
      stats: {
        totalStudents,
        totalTeachers,
        attendanceRate: parseFloat(attendanceRate as string),
        revenue,
        expenses,
        netIncome: revenue - expenses,
        pendingInvoices,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
