import { Response } from 'express';
import Invoice from '../models/Invoice.js';
import Student from '../models/Student.js';
import Payment from '../models/Payment.js';
import { AuthRequest } from '../middleware/auth.js';

export const createInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const {
      student,
      academicYear,
      dueDate,
      items,
      discount,
      tax,
      notes,
    } = req.body;

    // Verify student exists
    const studentDoc = await Student.findById(student);
    if (!studentDoc) {
      return res.status(404).json({ message: 'Élève non trouvé' });
    }

    // Calculate amounts
    const subtotal = items.reduce((sum: number, item: any) => {
      const amount = item.quantity * item.unitPrice;
      return sum + amount;
    }, 0);

    const discountAmount = discount || 0;
    const taxAmount = tax || 0;
    const total = subtotal - discountAmount + taxAmount;

    // Create invoice
    const newInvoice = await Invoice.create({
      student,
      academicYear,
      dueDate: new Date(dueDate),
      items: items.map((item: any) => ({
        ...item,
        amount: item.quantity * item.unitPrice,
      })),
      subtotal,
      discount: discountAmount,
      tax: taxAmount,
      total,
      amountPaid: 0,
      balance: total,
      status: 'issued',
      notes,
      createdBy: req.user!.id,
    });

    await newInvoice.populate([
      { path: 'student', populate: { path: 'userId', select: 'firstName lastName email' } },
      { path: 'createdBy', select: 'firstName lastName' },
    ]);

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

    // Filter by academic year
    if (req.query.academicYear) {
      query.academicYear = req.query.academicYear;
    }

    const total = await Invoice.countDocuments(query);
    const invoices = await Invoice.find(query)
      .populate({
        path: 'student',
        populate: { path: 'userId', select: 'firstName lastName email' },
      })
      .populate('createdBy', 'firstName lastName')
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
        populate: { path: 'userId', select: 'firstName lastName email phone' },
      })
      .populate('createdBy', 'firstName lastName');

    if (!invoice) {
      return res.status(404).json({ message: 'Facture non trouvée' });
    }

    // Get payments for this invoice
    const payments = await Payment.find({ invoice: invoice._id })
      .populate('receivedBy', 'firstName lastName')
      .sort({ paymentDate: -1 });

    res.json({
      invoice,
      payments,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la récupération de la facture', error: error.message });
  }
};

export const updateInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const {
      dueDate,
      items,
      discount,
      tax,
      status,
      notes,
    } = req.body;

    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Facture non trouvée' });
    }

    // Recalculate amounts if items changed
    let subtotal = invoice.subtotal;
    let total = invoice.total;
    let balance = invoice.balance;

    if (items) {
      subtotal = items.reduce((sum: number, item: any) => {
        return sum + (item.quantity * item.unitPrice);
      }, 0);

      const discountAmount = discount !== undefined ? discount : invoice.discount;
      const taxAmount = tax !== undefined ? tax : invoice.tax;
      total = subtotal - discountAmount + taxAmount;
      balance = total - invoice.amountPaid;
    }

    const updatedInvoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      {
        dueDate: dueDate ? new Date(dueDate) : invoice.dueDate,
        items: items ? items.map((item: any) => ({
          ...item,
          amount: item.quantity * item.unitPrice,
        })) : invoice.items,
        subtotal,
        discount: discount !== undefined ? discount : invoice.discount,
        tax: tax !== undefined ? tax : invoice.tax,
        total,
        balance,
        status: status || invoice.status,
        notes: notes !== undefined ? notes : invoice.notes,
      },
      { new: true }
    )
      .populate({
        path: 'student',
        populate: { path: 'userId', select: 'firstName lastName email' },
      })
      .populate('createdBy', 'firstName lastName');

    res.json({
      message: 'Facture mise à jour avec succès',
      invoice: updatedInvoice,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la facture', error: error.message });
  }
};

export const deleteInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({ message: 'Facture non trouvée' });
    }

    // Check if invoice has payments
    const paymentsCount = await Payment.countDocuments({ invoice: invoice._id });
    if (paymentsCount > 0) {
      return res.status(400).json({ 
        message: 'Impossible de supprimer une facture avec des paiements. Annulez-la plutôt.' 
      });
    }

    await Invoice.findByIdAndDelete(req.params.id);

    res.json({ message: 'Facture supprimée avec succès' });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la suppression de la facture', error: error.message });
  }
};

export const getStudentInvoices = async (req: AuthRequest, res: Response) => {
  try {
    const invoices = await Invoice.find({ student: req.params.studentId })
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    const summary = {
      total: invoices.length,
      totalAmount: invoices.reduce((sum, inv) => sum + inv.total, 0),
      totalPaid: invoices.reduce((sum, inv) => sum + inv.amountPaid, 0),
      totalBalance: invoices.reduce((sum, inv) => sum + inv.balance, 0),
      byStatus: {
        draft: invoices.filter(inv => inv.status === 'draft').length,
        issued: invoices.filter(inv => inv.status === 'issued').length,
        partial: invoices.filter(inv => inv.status === 'partial').length,
        paid: invoices.filter(inv => inv.status === 'paid').length,
        overdue: invoices.filter(inv => inv.status === 'overdue').length,
        cancelled: invoices.filter(inv => inv.status === 'cancelled').length,
      },
    };

    res.json({
      invoices,
      summary,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la récupération des factures de l\'élève', error: error.message });
  }
};

export const updateOverdueInvoices = async (req: AuthRequest, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await Invoice.updateMany(
      {
        dueDate: { $lt: today },
        status: { $in: ['issued', 'partial'] },
      },
      {
        $set: { status: 'overdue' },
      }
    );

    res.json({
      message: 'Statut des factures en retard mis à jour',
      updated: result.modifiedCount,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour des factures en retard', error: error.message });
  }
};

export const getInvoiceStatistics = async (req: AuthRequest, res: Response) => {
  try {
    const total = await Invoice.countDocuments();
    const totalAmount = await Invoice.aggregate([
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);
    const totalPaid = await Invoice.aggregate([
      { $group: { _id: null, total: { $sum: '$amountPaid' } } },
    ]);
    const totalBalance = await Invoice.aggregate([
      { $group: { _id: null, total: { $sum: '$balance' } } },
    ]);

    const byStatus = await Invoice.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.json({
      total,
      totalAmount: totalAmount[0]?.total || 0,
      totalPaid: totalPaid[0]?.total || 0,
      totalBalance: totalBalance[0]?.total || 0,
      byStatus: byStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques', error: error.message });
  }
};
