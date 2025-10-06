import { Response } from 'express';
import Transaction from '../models/Transaction.js';
import { AuthRequest } from '../middleware/auth.js';

export const createTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const {
      type,
      amount,
      category,
      description,
      transactionDate,
      paymentMethod,
      reference,
      relatedInvoice,
      relatedExpense,
      fiscalYear,
      notes,
    } = req.body;

    const newTransaction = await Transaction.create({
      type,
      amount,
      category,
      description,
      transactionDate: transactionDate ? new Date(transactionDate) : new Date(),
      paymentMethod,
      reference,
      relatedInvoice,
      relatedExpense,
      fiscalYear: fiscalYear || new Date().getFullYear().toString(),
      notes,
      createdBy: req.user?.id,
    });

    await newTransaction.populate('createdBy', 'firstName lastName email');

    res.status(201).json({
      message: 'Transaction créée avec succès',
      transaction: newTransaction,
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Erreur lors de la création de la transaction',
      error: error.message,
    });
  }
};

export const getTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;

    const query: any = {};

    // Filter by type
    if (req.query.type) {
      query.type = req.query.type;
    }

    // Filter by category
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Filter by fiscal year
    if (req.query.fiscalYear) {
      query.fiscalYear = req.query.fiscalYear;
    }

    // Filter by date range
    if (req.query.startDate || req.query.endDate) {
      query.transactionDate = {};
      if (req.query.startDate) {
        query.transactionDate.$gte = new Date(req.query.startDate as string);
      }
      if (req.query.endDate) {
        query.transactionDate.$lte = new Date(req.query.endDate as string);
      }
    }

    // Search by description or reference
    if (req.query.search) {
      query.$or = [
        { description: { $regex: req.query.search, $options: 'i' } },
        { reference: { $regex: req.query.search, $options: 'i' } },
        { transactionNumber: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .populate('createdBy', 'firstName lastName email')
      .populate('relatedInvoice', 'invoiceNumber')
      .populate('relatedExpense', 'expenseNumber')
      .skip(skip)
      .limit(limit)
      .sort({ transactionDate: -1 });

    res.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Erreur lors de la récupération des transactions',
      error: error.message,
    });
  }
};

export const getTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('createdBy', 'firstName lastName email')
      .populate('relatedInvoice', 'invoiceNumber amount')
      .populate('relatedExpense', 'expenseNumber amount');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction non trouvée' });
    }

    res.json({ transaction });
  } catch (error: any) {
    res.status(500).json({
      message: 'Erreur lors de la récupération de la transaction',
      error: error.message,
    });
  }
};

export const updateTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const {
      type,
      amount,
      category,
      description,
      transactionDate,
      paymentMethod,
      reference,
      fiscalYear,
      notes,
    } = req.body;

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      {
        type,
        amount,
        category,
        description,
        transactionDate,
        paymentMethod,
        reference,
        fiscalYear,
        notes,
      },
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName lastName email');

    if (!updatedTransaction) {
      return res.status(404).json({ message: 'Transaction non trouvée' });
    }

    res.json({
      message: 'Transaction mise à jour avec succès',
      transaction: updatedTransaction,
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Erreur lors de la mise à jour de la transaction',
      error: error.message,
    });
  }
};

export const deleteTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction non trouvée' });
    }

    res.json({ message: 'Transaction supprimée avec succès' });
  } catch (error: any) {
    res.status(500).json({
      message: 'Erreur lors de la suppression de la transaction',
      error: error.message,
    });
  }
};

export const getTransactionStats = async (req: AuthRequest, res: Response) => {
  try {
    const fiscalYear = (req.query.fiscalYear as string) || new Date().getFullYear().toString();

    // Get all transactions for the fiscal year
    const transactions = await Transaction.find({ fiscalYear });

    // Calculate totals
    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpenses;

    // Group by category
    const incomeByCategory: Record<string, number> = {};
    const expensesByCategory: Record<string, number> = {};

    transactions.forEach((t) => {
      if (t.type === 'income') {
        incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + t.amount;
      } else {
        expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
      }
    });

    // Monthly breakdown
    const monthlyData: Record<string, { income: number; expenses: number }> = {};
    transactions.forEach((t) => {
      const month = new Date(t.transactionDate).toISOString().substring(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = { income: 0, expenses: 0 };
      }
      if (t.type === 'income') {
        monthlyData[month].income += t.amount;
      } else {
        monthlyData[month].expenses += t.amount;
      }
    });

    res.json({
      fiscalYear,
      totalIncome,
      totalExpenses,
      balance,
      transactionCount: transactions.length,
      incomeByCategory,
      expensesByCategory,
      monthlyData,
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message,
    });
  }
};
