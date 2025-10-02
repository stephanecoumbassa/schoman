import { Response } from 'express';
import Payment from '../models/Payment.js';
import Invoice from '../models/Invoice.js';
import Student from '../models/Student.js';
import { AuthRequest } from '../middleware/auth.js';

export const recordPayment = async (req: AuthRequest, res: Response) => {
  try {
    const {
      invoice: invoiceId,
      student,
      amount,
      paymentDate,
      paymentMethod,
      reference,
      notes,
    } = req.body;

    // Verify invoice exists
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ message: 'Facture non trouvée' });
    }

    // Verify student matches invoice
    if (invoice.student.toString() !== student) {
      return res.status(400).json({ message: 'L\'élève ne correspond pas à la facture' });
    }

    // Verify amount doesn't exceed balance
    if (amount > invoice.balance) {
      return res.status(400).json({ 
        message: `Le montant dépasse le solde restant (${invoice.balance})` 
      });
    }

    // Create payment
    const newPayment = await Payment.create({
      invoice: invoiceId,
      student,
      amount,
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      paymentMethod,
      reference,
      notes,
      receivedBy: req.user!.id,
    });

    // Update invoice
    const newAmountPaid = invoice.amountPaid + amount;
    const newBalance = invoice.total - newAmountPaid;
    let newStatus = invoice.status;

    if (newBalance === 0) {
      newStatus = 'paid';
    } else if (newAmountPaid > 0 && newBalance > 0) {
      newStatus = 'partial';
    }

    await Invoice.findByIdAndUpdate(invoiceId, {
      amountPaid: newAmountPaid,
      balance: newBalance,
      status: newStatus,
    });

    await newPayment.populate([
      { path: 'invoice' },
      { path: 'student', populate: { path: 'userId', select: 'firstName lastName email' } },
      { path: 'receivedBy', select: 'firstName lastName' },
    ]);

    res.status(201).json({
      message: 'Paiement enregistré avec succès',
      payment: newPayment,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de l\'enregistrement du paiement', error: error.message });
  }
};

export const getPayments = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    const skip = (page - 1) * limit;

    const query: any = {};

    // Filter by student
    if (req.query.student) {
      query.student = req.query.student;
    }

    // Filter by invoice
    if (req.query.invoice) {
      query.invoice = req.query.invoice;
    }

    // Filter by payment method
    if (req.query.paymentMethod) {
      query.paymentMethod = req.query.paymentMethod;
    }

    const total = await Payment.countDocuments(query);
    const payments = await Payment.find(query)
      .populate('invoice', 'invoiceNumber total')
      .populate({
        path: 'student',
        populate: { path: 'userId', select: 'firstName lastName email' },
      })
      .populate('receivedBy', 'firstName lastName')
      .skip(skip)
      .limit(limit)
      .sort({ paymentDate: -1 });

    res.json({
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la récupération des paiements', error: error.message });
  }
};

export const getPayment = async (req: AuthRequest, res: Response) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('invoice')
      .populate({
        path: 'student',
        populate: { path: 'userId', select: 'firstName lastName email phone' },
      })
      .populate('receivedBy', 'firstName lastName');

    if (!payment) {
      return res.status(404).json({ message: 'Paiement non trouvé' });
    }

    res.json({ payment });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la récupération du paiement', error: error.message });
  }
};

export const updatePayment = async (req: AuthRequest, res: Response) => {
  try {
    const {
      amount,
      paymentDate,
      paymentMethod,
      reference,
      notes,
    } = req.body;

    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Paiement non trouvé' });
    }

    const invoice = await Invoice.findById(payment.invoice);
    if (!invoice) {
      return res.status(404).json({ message: 'Facture associée non trouvée' });
    }

    // If amount changed, update invoice
    if (amount && amount !== payment.amount) {
      const amountDiff = amount - payment.amount;
      const newAmountPaid = invoice.amountPaid + amountDiff;
      const newBalance = invoice.total - newAmountPaid;

      // Verify new amount doesn't exceed invoice total
      if (newAmountPaid > invoice.total) {
        return res.status(400).json({ 
          message: 'Le nouveau montant dépasse le total de la facture' 
        });
      }

      let newStatus = invoice.status;
      if (newBalance === 0) {
        newStatus = 'paid';
      } else if (newAmountPaid > 0 && newBalance > 0) {
        newStatus = 'partial';
      } else if (newAmountPaid === 0) {
        newStatus = 'issued';
      }

      await Invoice.findByIdAndUpdate(invoice._id, {
        amountPaid: newAmountPaid,
        balance: newBalance,
        status: newStatus,
      });
    }

    const updatedPayment = await Payment.findByIdAndUpdate(
      req.params.id,
      {
        amount: amount || payment.amount,
        paymentDate: paymentDate ? new Date(paymentDate) : payment.paymentDate,
        paymentMethod: paymentMethod || payment.paymentMethod,
        reference: reference !== undefined ? reference : payment.reference,
        notes: notes !== undefined ? notes : payment.notes,
      },
      { new: true }
    )
      .populate('invoice')
      .populate({
        path: 'student',
        populate: { path: 'userId', select: 'firstName lastName email' },
      })
      .populate('receivedBy', 'firstName lastName');

    res.json({
      message: 'Paiement mis à jour avec succès',
      payment: updatedPayment,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du paiement', error: error.message });
  }
};

export const deletePayment = async (req: AuthRequest, res: Response) => {
  try {
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({ message: 'Paiement non trouvé' });
    }

    // Update invoice to reverse the payment
    const invoice = await Invoice.findById(payment.invoice);
    if (invoice) {
      const newAmountPaid = invoice.amountPaid - payment.amount;
      const newBalance = invoice.total - newAmountPaid;
      
      let newStatus = invoice.status;
      if (newBalance === invoice.total) {
        newStatus = 'issued';
      } else if (newAmountPaid > 0 && newBalance > 0) {
        newStatus = 'partial';
      }

      await Invoice.findByIdAndUpdate(invoice._id, {
        amountPaid: newAmountPaid,
        balance: newBalance,
        status: newStatus,
      });
    }

    await Payment.findByIdAndDelete(req.params.id);

    res.json({ message: 'Paiement supprimé avec succès' });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la suppression du paiement', error: error.message });
  }
};

export const getStudentPayments = async (req: AuthRequest, res: Response) => {
  try {
    const payments = await Payment.find({ student: req.params.studentId })
      .populate('invoice', 'invoiceNumber total')
      .populate('receivedBy', 'firstName lastName')
      .sort({ paymentDate: -1 });

    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);

    res.json({
      payments,
      summary: {
        total: payments.length,
        totalAmount: totalPaid,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la récupération des paiements de l\'élève', error: error.message });
  }
};

export const getPaymentStatistics = async (req: AuthRequest, res: Response) => {
  try {
    const total = await Payment.countDocuments();
    const totalAmount = await Payment.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const byMethod = await Payment.aggregate([
      { $group: { _id: '$paymentMethod', count: { $sum: 1 }, total: { $sum: '$amount' } } },
    ]);

    // Get payments by month for current year
    const currentYear = new Date().getFullYear();
    const byMonth = await Payment.aggregate([
      {
        $match: {
          paymentDate: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$paymentDate' },
          count: { $sum: 1 },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id': 1 } },
    ]);

    res.json({
      total,
      totalAmount: totalAmount[0]?.total || 0,
      byMethod: byMethod.reduce((acc, item) => {
        acc[item._id] = { count: item.count, total: item.total };
        return acc;
      }, {}),
      byMonth,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques', error: error.message });
  }
};
