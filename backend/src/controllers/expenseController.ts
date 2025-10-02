import { Response } from 'express';
import Expense from '../models/Expense.js';
import { AuthRequest } from '../middleware/auth.js';

export const createExpense = async (req: AuthRequest, res: Response) => {
  try {
    const {
      category,
      description,
      amount,
      expenseDate,
      payee,
      paymentMethod,
      reference,
      receiptNumber,
      notes,
      approvedBy,
      academicYear,
    } = req.body;

    // Create expense
    const newExpense = await Expense.create({
      category,
      description,
      amount,
      expenseDate: expenseDate ? new Date(expenseDate) : new Date(),
      payee,
      paymentMethod,
      reference,
      receiptNumber,
      notes,
      approvedBy,
      recordedBy: req.user!.id,
      academicYear,
    });

    await newExpense.populate([
      { path: 'recordedBy', select: 'firstName lastName' },
      { path: 'approvedBy', select: 'firstName lastName' },
    ]);

    res.status(201).json({
      message: 'Dépense enregistrée avec succès',
      expense: newExpense,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de l\'enregistrement de la dépense', error: error.message });
  }
};

export const getExpenses = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    const skip = (page - 1) * limit;

    const query: any = {};

    // Filter by category
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Filter by payment method
    if (req.query.paymentMethod) {
      query.paymentMethod = req.query.paymentMethod;
    }

    // Filter by academic year
    if (req.query.academicYear) {
      query.academicYear = req.query.academicYear;
    }

    // Filter by date range
    if (req.query.startDate || req.query.endDate) {
      query.expenseDate = {};
      if (req.query.startDate) {
        query.expenseDate.$gte = new Date(req.query.startDate as string);
      }
      if (req.query.endDate) {
        query.expenseDate.$lte = new Date(req.query.endDate as string);
      }
    }

    // Search by description or payee
    if (req.query.search) {
      query.$text = { $search: req.query.search as string };
    }

    const total = await Expense.countDocuments(query);
    const expenses = await Expense.find(query)
      .populate('recordedBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName')
      .skip(skip)
      .limit(limit)
      .sort({ expenseDate: -1 });

    res.json({
      expenses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la récupération des dépenses', error: error.message });
  }
};

export const getExpense = async (req: AuthRequest, res: Response) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate('recordedBy', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName email');

    if (!expense) {
      return res.status(404).json({ message: 'Dépense non trouvée' });
    }

    res.json({ expense });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la récupération de la dépense', error: error.message });
  }
};

export const updateExpense = async (req: AuthRequest, res: Response) => {
  try {
    const {
      category,
      description,
      amount,
      expenseDate,
      payee,
      paymentMethod,
      reference,
      receiptNumber,
      notes,
      approvedBy,
      academicYear,
    } = req.body;

    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      {
        category,
        description,
        amount,
        expenseDate: expenseDate ? new Date(expenseDate) : undefined,
        payee,
        paymentMethod,
        reference,
        receiptNumber,
        notes,
        approvedBy,
        academicYear,
      },
      { new: true, runValidators: true }
    )
      .populate('recordedBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName');

    if (!updatedExpense) {
      return res.status(404).json({ message: 'Dépense non trouvée' });
    }

    res.json({
      message: 'Dépense mise à jour avec succès',
      expense: updatedExpense,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la dépense', error: error.message });
  }
};

export const deleteExpense = async (req: AuthRequest, res: Response) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Dépense non trouvée' });
    }

    res.json({ message: 'Dépense supprimée avec succès' });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la suppression de la dépense', error: error.message });
  }
};

export const getExpenseStatistics = async (req: AuthRequest, res: Response) => {
  try {
    const academicYear = req.query.academicYear as string;
    const query: any = {};

    if (academicYear) {
      query.academicYear = academicYear;
    }

    // Total expenses
    const totalExpenses = await Expense.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    // Expenses by category
    const expensesByCategory = await Expense.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Expenses by payment method
    const expensesByPaymentMethod = await Expense.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$paymentMethod',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Monthly expenses
    const monthlyExpenses = await Expense.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            year: { $year: '$expenseDate' },
            month: { $month: '$expenseDate' },
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 },
    ]);

    res.json({
      totalExpenses: totalExpenses.length > 0 ? totalExpenses[0].total : 0,
      expensesByCategory: expensesByCategory.map((item) => ({
        category: item._id,
        total: item.total,
        count: item.count,
      })),
      expensesByPaymentMethod: expensesByPaymentMethod.map((item) => ({
        paymentMethod: item._id,
        total: item.total,
        count: item.count,
      })),
      monthlyExpenses: monthlyExpenses.map((item) => ({
        year: item._id.year,
        month: item._id.month,
        total: item.total,
        count: item.count,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors du calcul des statistiques', error: error.message });
  }
};
