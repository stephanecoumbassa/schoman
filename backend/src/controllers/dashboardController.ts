import { Response } from 'express';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Class from '../models/Class.js';
import Event from '../models/Event.js';
import Expense from '../models/Expense.js';
import Invoice from '../models/Invoice.js';
import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';
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

    // Get events statistics
    const now = new Date();
    const upcomingEvents = await Event.countDocuments({
      status: 'planned',
      startDate: { $gt: now },
    });

    // Get expenses statistics
    const [pendingExpenses, totalExpensesAmount] = await Promise.all([
      Expense.countDocuments({ status: 'pending' }),
      Expense.aggregate([
        { $match: { status: { $ne: 'rejected' } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    // Get invoices statistics
    const [totalRevenue, overdueInvoices] = await Promise.all([
      Invoice.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Invoice.countDocuments({
        status: { $in: ['sent', 'overdue'] },
        dueDate: { $lt: now },
      }),
    ]);

    // Get accounting statistics
    const currentYear = new Date().getFullYear().toString();
    const [transactionIncome, transactionExpenses, activeBudgets] = await Promise.all([
      Transaction.aggregate([
        { $match: { type: 'income', fiscalYear: currentYear } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Transaction.aggregate([
        { $match: { type: 'expense', fiscalYear: currentYear } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Budget.countDocuments({ status: 'active' }),
    ]);

    const accountingIncome = transactionIncome[0]?.total || 0;
    const accountingExpenses = transactionExpenses[0]?.total || 0;
    const accountingBalance = accountingIncome - accountingExpenses;

    res.json({
      stats: {
        totalUsers,
        totalStudents,
        totalTeachers,
        totalParents,
        activeStudents,
        totalClasses,
        upcomingEvents,
        pendingExpenses,
        totalExpenses: totalExpensesAmount[0]?.total || 0,
        totalRevenue: totalRevenue[0]?.total || 0,
        overdueInvoices,
        accountingIncome,
        accountingExpenses,
        accountingBalance,
        activeBudgets,
      },
      recentStudents,
      enrollmentByLevel,
    });
  } catch (error: any) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques', error: error.message });
  }
};
