import { Response } from 'express';
import Expense from '../models/Expense.js';
import { AuthRequest } from '../middleware/auth.js';

export const createExpense = async (req: AuthRequest, res: Response) => {
  try {
    const {
      description,
      category,
      amount,
      date,
      vendor,
      paymentMethod,
      paymentReference,
      receiptNumber,
      notes,
    } = req.body;

    const newExpense = await Expense.create({
      description,
      category,
      amount,
      date: date ? new Date(date) : new Date(),
      vendor,
      paymentMethod,
      paymentReference,
      receiptNumber,
      recordedBy: req.user?.id,
      notes,
      isActive: true,
    });

    await newExpense.populate('recordedBy', 'firstName lastName email');

    res.status(201).json({
      message: 'Dépense enregistrée avec succès',
      expense: newExpense,
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Erreur lors de l\'enregistrement de la dépense',
      error: error.message,
    });
  }
};

export const getExpenses = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    const skip = (page - 1) * limit;

    const query: any = { isActive: true };

    // Filter by category
    if (req.query.category) {
      query.category = req.query.category;
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

    // Filter by vendor
    if (req.query.vendor) {
      query.vendor = new RegExp(req.query.vendor as string, 'i');
    }

    const total = await Expense.countDocuments(query);
    const expenses = await Expense.find(query)
      .populate('recordedBy', 'firstName lastName email')
      .skip(skip)
      .limit(limit)
      .sort({ date: -1 });

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
    res.status(500).json({
      message: 'Erreur lors de la récupération des dépenses',
      error: error.message,
    });
  }
};

export const getExpense = async (req: AuthRequest, res: Response) => {
  try {
    const expense = await Expense.findById(req.params.id).populate(
      'recordedBy',
      'firstName lastName email'
    );

    if (!expense) {
      return res.status(404).json({ message: 'Dépense non trouvée' });
    }

    res.json({ expense });
  } catch (error: any) {
    res.status(500).json({
      message: 'Erreur lors de la récupération de la dépense',
      error: error.message,
    });
  }
};

export const updateExpense = async (req: AuthRequest, res: Response) => {
  try {
    const {
      description,
      category,
      amount,
      date,
      vendor,
      paymentMethod,
      paymentReference,
      receiptNumber,
      notes,
    } = req.body;

    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      {
        description,
        category,
        amount,
        date: date ? new Date(date) : undefined,
        vendor,
        paymentMethod,
        paymentReference,
        receiptNumber,
        notes,
      },
      { new: true }
    ).populate('recordedBy', 'firstName lastName email');

    if (!updatedExpense) {
      return res.status(404).json({ message: 'Dépense non trouvée' });
    }

    res.json({
      message: 'Dépense modifiée avec succès',
      expense: updatedExpense,
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Erreur lors de la modification de la dépense',
      error: error.message,
    });
  }
};

export const deleteExpense = async (req: AuthRequest, res: Response) => {
  try {
    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!expense) {
      return res.status(404).json({ message: 'Dépense non trouvée' });
    }

    res.json({ message: 'Dépense supprimée avec succès' });
  } catch (error: any) {
    res.status(500).json({
      message: 'Erreur lors de la suppression de la dépense',
      error: error.message,
    });
  }
};

export const getExpenseStats = async (req: AuthRequest, res: Response) => {
  try {
    // Get date range from query or default to current month
    const startDate = req.query.startDate
      ? new Date(req.query.startDate as string)
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endDate = req.query.endDate
      ? new Date(req.query.endDate as string)
      : new Date();

    const stats = await Expense.aggregate([
      {
        $match: {
          isActive: true,
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
      {
        $sort: { totalAmount: -1 },
      },
    ]);

    const totalExpenses = await Expense.countDocuments({
      isActive: true,
      date: { $gte: startDate, $lte: endDate },
    });

    const totalAmount = stats.reduce((sum, stat) => sum + stat.totalAmount, 0);

    res.json({
      totalExpenses,
      totalAmount,
      byCategory: stats,
      period: {
        startDate,
        endDate,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message,
    });
  }
};
