import { Response } from 'express';
import Expense from '../models/Expense.js';
import { AuthRequest } from '../middleware/auth.js';

// Generate unique expense number
const generateExpenseNumber = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const count = await Expense.countDocuments({
    expenseNumber: new RegExp(`^EXP-${year}-`)
  });
  const nextNumber = (count + 1).toString().padStart(5, '0');
  return `EXP-${year}-${nextNumber}`;
};

export const createExpense = async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      description,
      category,
      amount,
      expenseDate,
      supplier,
      supplierContact,
      notes,
    } = req.body;

    // Generate expense number
    const expenseNumber = await generateExpenseNumber();

    // Create expense
    const newExpense = await Expense.create({
      expenseNumber,
      title,
      description,
      category,
      amount,
      expenseDate: new Date(expenseDate),
      supplier,
      supplierContact,
      status: 'pending',
      notes,
      createdBy: req.user!.id,
    });

    await newExpense.populate([
      { path: 'createdBy', select: 'firstName lastName email' },
      { path: 'approvedBy', select: 'firstName lastName email' },
    ]);

    res.status(201).json({
      message: 'Dépense créée avec succès',
      expense: newExpense,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la création de la dépense', error: error.message });
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

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
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

    // Search by title or description
    if (req.query.search) {
      query.$text = { $search: req.query.search as string };
    }

    const [expenses, total] = await Promise.all([
      Expense.find(query)
        .populate('createdBy', 'firstName lastName email')
        .populate('approvedBy', 'firstName lastName email')
        .sort({ expenseDate: -1 })
        .skip(skip)
        .limit(limit),
      Expense.countDocuments(query),
    ]);

    res.json({
      expenses,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la récupération des dépenses', error: error.message });
  }
};

export const getExpenseById = async (req: AuthRequest, res: Response) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate('createdBy', 'firstName lastName email phone')
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
      title,
      description,
      category,
      amount,
      expenseDate,
      supplier,
      supplierContact,
      status,
      notes,
    } = req.body;

    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        category,
        amount,
        expenseDate,
        supplier,
        supplierContact,
        status,
        notes,
      },
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName email');

    if (!expense) {
      return res.status(404).json({ message: 'Dépense non trouvée' });
    }

    res.json({
      message: 'Dépense mise à jour avec succès',
      expense,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la dépense', error: error.message });
  }
};

export const approveExpense = async (req: AuthRequest, res: Response) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Dépense non trouvée' });
    }

    if (expense.status !== 'pending') {
      return res.status(400).json({ message: 'Seules les dépenses en attente peuvent être approuvées' });
    }

    expense.status = 'approved';
    expense.approvedBy = req.user!.id as any;
    expense.approvalDate = new Date();
    await expense.save();

    await expense.populate([
      { path: 'createdBy', select: 'firstName lastName email' },
      { path: 'approvedBy', select: 'firstName lastName email' },
    ]);

    res.json({
      message: 'Dépense approuvée avec succès',
      expense,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de l\'approbation de la dépense', error: error.message });
  }
};

export const recordPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { paymentDate, paymentMethod, paymentReference } = req.body;

    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Dépense non trouvée' });
    }

    if (expense.status !== 'approved') {
      return res.status(400).json({ message: 'Seules les dépenses approuvées peuvent être payées' });
    }

    expense.status = 'paid';
    expense.paymentDate = new Date(paymentDate);
    expense.paymentMethod = paymentMethod;
    expense.paymentReference = paymentReference;
    await expense.save();

    await expense.populate([
      { path: 'createdBy', select: 'firstName lastName email' },
      { path: 'approvedBy', select: 'firstName lastName email' },
    ]);

    res.json({
      message: 'Paiement enregistré avec succès',
      expense,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de l\'enregistrement du paiement', error: error.message });
  }
};

export const deleteExpense = async (req: AuthRequest, res: Response) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Dépense non trouvée' });
    }

    // Only allow deletion of pending or rejected expenses
    if (expense.status === 'paid') {
      return res.status(400).json({ message: 'Impossible de supprimer une dépense payée' });
    }

    await expense.deleteOne();

    res.json({ message: 'Dépense supprimée avec succès' });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la suppression de la dépense', error: error.message });
  }
};

export const getExpenseStats = async (req: AuthRequest, res: Response) => {
  try {
    const [
      totalExpenses,
      pendingExpenses,
      approvedExpenses,
      paidExpenses,
      totalAmount,
      paidAmount,
      expensesByCategory,
    ] = await Promise.all([
      Expense.countDocuments({ status: { $ne: 'rejected' } }),
      Expense.countDocuments({ status: 'pending' }),
      Expense.countDocuments({ status: 'approved' }),
      Expense.countDocuments({ status: 'paid' }),
      Expense.aggregate([
        { $match: { status: { $ne: 'rejected' } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Expense.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Expense.aggregate([
        { $match: { status: { $ne: 'rejected' } } },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
          },
        },
      ]),
    ]);

    res.json({
      totalExpenses,
      pendingExpenses,
      approvedExpenses,
      paidExpenses,
      totalAmount: totalAmount[0]?.total || 0,
      paidAmount: paidAmount[0]?.total || 0,
      expensesByCategory,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques', error: error.message });
  }
};
