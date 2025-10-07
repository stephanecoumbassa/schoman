import { Response } from 'express';
import Budget from '../models/Budget.js';
import Transaction from '../models/Transaction.js';
import { AuthRequest } from '../middleware/auth.js';

export const createBudget = async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      fiscalYear,
      startDate,
      endDate,
      totalBudget,
      incomeItems,
      expenseItems,
      status,
      notes,
    } = req.body;

    const newBudget = await Budget.create({
      name,
      fiscalYear,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      totalBudget,
      incomeItems: incomeItems || [],
      expenseItems: expenseItems || [],
      status: status || 'draft',
      notes,
      createdBy: req.user?.id,
    });

    await newBudget.populate('createdBy', 'firstName lastName email');

    res.status(201).json({
      message: 'Budget créé avec succès',
      budget: newBudget,
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Erreur lors de la création du budget',
      error: error.message,
    });
  }
};

export const getBudgets = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    const skip = (page - 1) * limit;

    const query: any = {};

    // Filter by fiscal year
    if (req.query.fiscalYear) {
      query.fiscalYear = req.query.fiscalYear;
    }

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    const total = await Budget.countDocuments(query);
    const budgets = await Budget.find(query)
      .populate('createdBy', 'firstName lastName email')
      .skip(skip)
      .limit(limit)
      .sort({ fiscalYear: -1, createdAt: -1 });

    res.json({
      budgets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Erreur lors de la récupération des budgets',
      error: error.message,
    });
  }
};

export const getBudget = async (req: AuthRequest, res: Response) => {
  try {
    const budget = await Budget.findById(req.params.id).populate(
      'createdBy',
      'firstName lastName email'
    );

    if (!budget) {
      return res.status(404).json({ message: 'Budget non trouvé' });
    }

    res.json({ budget });
  } catch (error: any) {
    res.status(500).json({
      message: 'Erreur lors de la récupération du budget',
      error: error.message,
    });
  }
};

export const updateBudget = async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      fiscalYear,
      startDate,
      endDate,
      totalBudget,
      incomeItems,
      expenseItems,
      status,
      notes,
    } = req.body;

    const updatedBudget = await Budget.findByIdAndUpdate(
      req.params.id,
      {
        name,
        fiscalYear,
        startDate,
        endDate,
        totalBudget,
        incomeItems,
        expenseItems,
        status,
        notes,
      },
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName lastName email');

    if (!updatedBudget) {
      return res.status(404).json({ message: 'Budget non trouvé' });
    }

    res.json({
      message: 'Budget mis à jour avec succès',
      budget: updatedBudget,
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Erreur lors de la mise à jour du budget',
      error: error.message,
    });
  }
};

export const deleteBudget = async (req: AuthRequest, res: Response) => {
  try {
    const budget = await Budget.findByIdAndDelete(req.params.id);

    if (!budget) {
      return res.status(404).json({ message: 'Budget non trouvé' });
    }

    res.json({ message: 'Budget supprimé avec succès' });
  } catch (error: any) {
    res.status(500).json({
      message: 'Erreur lors de la suppression du budget',
      error: error.message,
    });
  }
};

export const getBudgetComparison = async (req: AuthRequest, res: Response) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({ message: 'Budget non trouvé' });
    }

    // Get actual transactions for the budget period
    const transactions = await Transaction.find({
      fiscalYear: budget.fiscalYear,
      transactionDate: {
        $gte: budget.startDate,
        $lte: budget.endDate,
      },
    });

    // Calculate actual amounts by category
    const actualIncome: Record<string, number> = {};
    const actualExpenses: Record<string, number> = {};

    transactions.forEach((t) => {
      if (t.type === 'income') {
        actualIncome[t.category] = (actualIncome[t.category] || 0) + t.amount;
      } else {
        actualExpenses[t.category] = (actualExpenses[t.category] || 0) + t.amount;
      }
    });

    // Update budget items with spent amounts
    const updatedIncomeItems = budget.incomeItems.map((item) => ({
      category: item.category,
      allocatedAmount: item.allocatedAmount,
      spentAmount: item.spentAmount,
      description: item.description,
      actualAmount: actualIncome[item.category] || 0,
      variance: (actualIncome[item.category] || 0) - item.allocatedAmount,
    }));

    const updatedExpenseItems = budget.expenseItems.map((item) => ({
      category: item.category,
      allocatedAmount: item.allocatedAmount,
      spentAmount: item.spentAmount,
      description: item.description,
      actualAmount: actualExpenses[item.category] || 0,
      variance: item.allocatedAmount - (actualExpenses[item.category] || 0),
    }));

    const totalAllocatedIncome = budget.incomeItems.reduce(
      (sum, item) => sum + item.allocatedAmount,
      0
    );
    const totalActualIncome = Object.values(actualIncome).reduce((sum, val) => sum + val, 0);
    const totalAllocatedExpenses = budget.expenseItems.reduce(
      (sum, item) => sum + item.allocatedAmount,
      0
    );
    const totalActualExpenses = Object.values(actualExpenses).reduce((sum, val) => sum + val, 0);

    res.json({
      budget,
      incomeItems: updatedIncomeItems,
      expenseItems: updatedExpenseItems,
      summary: {
        totalAllocatedIncome,
        totalActualIncome,
        incomeVariance: totalActualIncome - totalAllocatedIncome,
        totalAllocatedExpenses,
        totalActualExpenses,
        expenseVariance: totalAllocatedExpenses - totalActualExpenses,
        projectedBalance: totalAllocatedIncome - totalAllocatedExpenses,
        actualBalance: totalActualIncome - totalActualExpenses,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Erreur lors de la comparaison du budget',
      error: error.message,
    });
  }
};
