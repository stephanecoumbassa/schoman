import { Response } from 'express';
import Invoice from '../models/Invoice.js';
import Student from '../models/Student.js';
import { AuthRequest } from '../middleware/auth.js';

// Generate unique invoice number
const generateInvoiceNumber = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const count = await Invoice.countDocuments({
    invoiceNumber: new RegExp(`^INV-${year}-`)
  });
  const nextNumber = (count + 1).toString().padStart(5, '0');
  return `INV-${year}-${nextNumber}`;
};

export const createInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const { student, items, taxRate, dueDate, notes } = req.body;

    // Verify student exists
    const studentDoc = await Student.findById(student);
    if (!studentDoc) {
      return res.status(404).json({ message: 'Élève non trouvé' });
    }

    // Calculate amounts
    const subtotal = items.reduce((sum: number, item: any) => {
      item.totalPrice = item.quantity * item.unitPrice;
      return sum + item.totalPrice;
    }, 0);

    const taxAmount = (subtotal * (taxRate || 0)) / 100;
    const totalAmount = subtotal + taxAmount;

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber();

    // Create invoice
    const newInvoice = await Invoice.create({
      invoiceNumber,
      student,
      items,
      subtotal,
      taxRate: taxRate || 0,
      taxAmount,
      totalAmount,
      issueDate: new Date(),
      dueDate: new Date(dueDate),
      status: 'draft',
      notes,
    });

    await newInvoice.populate({
      path: 'student',
      populate: { path: 'userId', select: 'firstName lastName' }
    });

    res.status(201).json({
      message: 'Facture créée avec succès',
      invoice: newInvoice,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la création de la facture', error: error.message });
  }
};

export const getInvoices = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    const skip = (page - 1) * limit;

    const query: any = {};
    
    // Filter by student
    if (req.query.student) {
      query.student = req.query.student;
    }

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by date range
    if (req.query.startDate || req.query.endDate) {
      query.issueDate = {};
      if (req.query.startDate) {
        query.issueDate.$gte = new Date(req.query.startDate as string);
      }
      if (req.query.endDate) {
        query.issueDate.$lte = new Date(req.query.endDate as string);
      }
    }

    const total = await Invoice.countDocuments(query);
    const invoices = await Invoice.find(query)
      .populate({
        path: 'student',
        populate: { path: 'userId', select: 'firstName lastName' }
      })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({
      invoices,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la récupération des factures', error: error.message });
  }
};

export const getInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate({
        path: 'student',
        populate: { path: 'userId', select: 'firstName lastName email' }
      });

    if (!invoice) {
      return res.status(404).json({ message: 'Facture non trouvée' });
    }

    res.json({ invoice });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la récupération de la facture', error: error.message });
  }
};

export const updateInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const { items, taxRate, dueDate, status, notes } = req.body;

    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Facture non trouvée' });
    }

    // Cannot modify paid or cancelled invoices
    if (invoice.status === 'paid' || invoice.status === 'cancelled') {
      return res.status(400).json({ 
        message: 'Impossible de modifier une facture payée ou annulée' 
      });
    }

    // Recalculate if items changed
    if (items) {
      const subtotal = items.reduce((sum: number, item: any) => {
        item.totalPrice = item.quantity * item.unitPrice;
        return sum + item.totalPrice;
      }, 0);

      const rate = taxRate !== undefined ? taxRate : invoice.taxRate;
      const taxAmount = (subtotal * rate) / 100;
      const totalAmount = subtotal + taxAmount;

      invoice.items = items;
      invoice.subtotal = subtotal;
      invoice.taxRate = rate;
      invoice.taxAmount = taxAmount;
      invoice.totalAmount = totalAmount;
    }

    if (dueDate) invoice.dueDate = new Date(dueDate);
    if (status) invoice.status = status;
    if (notes !== undefined) invoice.notes = notes;

    await invoice.save();
    await invoice.populate({
      path: 'student',
      populate: { path: 'userId', select: 'firstName lastName' }
    });

    res.json({
      message: 'Facture mise à jour avec succès',
      invoice,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la facture', error: error.message });
  }
};

export const recordPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { paymentDate, paymentMethod, paymentReference } = req.body;

    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Facture non trouvée' });
    }

    if (invoice.status === 'paid') {
      return res.status(400).json({ message: 'Cette facture est déjà payée' });
    }

    if (invoice.status === 'cancelled') {
      return res.status(400).json({ message: 'Impossible de payer une facture annulée' });
    }

    invoice.status = 'paid';
    invoice.paymentDate = paymentDate ? new Date(paymentDate) : new Date();
    invoice.paymentMethod = paymentMethod;
    invoice.paymentReference = paymentReference;

    await invoice.save();
    await invoice.populate({
      path: 'student',
      populate: { path: 'userId', select: 'firstName lastName' }
    });

    res.json({
      message: 'Paiement enregistré avec succès',
      invoice,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de l\'enregistrement du paiement', error: error.message });
  }
};

export const deleteInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({ message: 'Facture non trouvée' });
    }

    // Cannot delete paid invoices
    if (invoice.status === 'paid') {
      return res.status(400).json({ 
        message: 'Impossible de supprimer une facture payée. Vous pouvez l\'annuler.' 
      });
    }

    await Invoice.findByIdAndDelete(req.params.id);

    res.json({ message: 'Facture supprimée avec succès' });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la suppression de la facture', error: error.message });
  }
};

export const getInvoiceStats = async (req: AuthRequest, res: Response) => {
  try {
    const stats = await Invoice.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
        },
      },
    ]);

    const totalInvoices = await Invoice.countDocuments();
    const totalRevenue = await Invoice.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    const overdueInvoices = await Invoice.countDocuments({
      status: { $in: ['sent', 'overdue'] },
      dueDate: { $lt: new Date() },
    });

    res.json({
      stats,
      totalInvoices,
      totalRevenue: totalRevenue[0]?.total || 0,
      overdueInvoices,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques', error: error.message });
  }
};
