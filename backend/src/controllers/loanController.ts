import { Response } from 'express';
import Loan from '../models/Loan.js';
import Book from '../models/Book.js';
import Student from '../models/Student.js';
import { AuthRequest } from '../middleware/auth.js';

export const createLoan = async (req: AuthRequest, res: Response) => {
  try {
    const { book, student, dueDate, notes } = req.body;

    // Verify book exists and is available
    const bookDoc = await Book.findById(book);
    if (!bookDoc) {
      return res.status(404).json({ message: 'Livre non trouvé' });
    }

    if (bookDoc.availableQuantity <= 0) {
      return res.status(400).json({ message: 'Livre non disponible' });
    }

    // Verify student exists
    const studentDoc = await Student.findById(student);
    if (!studentDoc) {
      return res.status(404).json({ message: 'Élève non trouvé' });
    }

    // Create loan
    const newLoan = await Loan.create({
      book,
      student,
      borrowDate: new Date(),
      dueDate: new Date(dueDate),
      status: 'borrowed',
      notes,
    });

    // Update book availability
    await Book.findByIdAndUpdate(book, {
      $inc: { availableQuantity: -1 }
    });

    await newLoan.populate([
      { path: 'book', select: 'title author isbn' },
      { path: 'student', populate: { path: 'userId', select: 'firstName lastName' } }
    ]);

    res.status(201).json({
      message: 'Emprunt enregistré avec succès',
      loan: newLoan,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de l\'enregistrement de l\'emprunt', error: error.message });
  }
};

export const getLoans = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    const skip = (page - 1) * limit;

    const query: any = {};
    
    // Filter by student
    if (req.query.student) {
      query.student = req.query.student;
    }

    // Filter by book
    if (req.query.book) {
      query.book = req.query.book;
    }

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    const total = await Loan.countDocuments(query);
    const loans = await Loan.find(query)
      .populate('book', 'title author isbn')
      .populate({
        path: 'student',
        populate: { path: 'userId', select: 'firstName lastName' }
      })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({
      loans,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la récupération des emprunts', error: error.message });
  }
};

export const getLoan = async (req: AuthRequest, res: Response) => {
  try {
    const loan = await Loan.findById(req.params.id)
      .populate('book', 'title author isbn')
      .populate({
        path: 'student',
        populate: { path: 'userId', select: 'firstName lastName email' }
      });

    if (!loan) {
      return res.status(404).json({ message: 'Emprunt non trouvé' });
    }

    res.json({ loan });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'emprunt', error: error.message });
  }
};

export const returnLoan = async (req: AuthRequest, res: Response) => {
  try {
    const loan = await Loan.findById(req.params.id);
    
    if (!loan) {
      return res.status(404).json({ message: 'Emprunt non trouvé' });
    }

    if (loan.status === 'returned') {
      return res.status(400).json({ message: 'Ce livre a déjà été retourné' });
    }

    // Update loan status
    loan.returnDate = new Date();
    loan.status = 'returned';
    await loan.save();

    // Update book availability
    await Book.findByIdAndUpdate(loan.book, {
      $inc: { availableQuantity: 1 }
    });

    await loan.populate([
      { path: 'book', select: 'title author isbn' },
      { path: 'student', populate: { path: 'userId', select: 'firstName lastName' } }
    ]);

    res.json({
      message: 'Livre retourné avec succès',
      loan,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors du retour du livre', error: error.message });
  }
};

export const updateLoan = async (req: AuthRequest, res: Response) => {
  try {
    const { dueDate, notes, status } = req.body;
    
    const loan = await Loan.findById(req.params.id);
    if (!loan) {
      return res.status(404).json({ message: 'Emprunt non trouvé' });
    }

    // Update fields
    if (dueDate) loan.dueDate = new Date(dueDate);
    if (notes !== undefined) loan.notes = notes;
    if (status) loan.status = status;

    await loan.save();
    await loan.populate([
      { path: 'book', select: 'title author isbn' },
      { path: 'student', populate: { path: 'userId', select: 'firstName lastName' } }
    ]);

    res.json({
      message: 'Emprunt mis à jour avec succès',
      loan,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'emprunt', error: error.message });
  }
};

export const deleteLoan = async (req: AuthRequest, res: Response) => {
  try {
    const loan = await Loan.findById(req.params.id);
    
    if (!loan) {
      return res.status(404).json({ message: 'Emprunt non trouvé' });
    }

    // If loan is not returned, return the book first
    if (loan.status !== 'returned') {
      await Book.findByIdAndUpdate(loan.book, {
        $inc: { availableQuantity: 1 }
      });
    }

    await Loan.findByIdAndDelete(req.params.id);

    res.json({ message: 'Emprunt supprimé avec succès' });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'emprunt', error: error.message });
  }
};

export const getStudentLoans = async (req: AuthRequest, res: Response) => {
  try {
    const { studentId } = req.params;
    
    const currentLoans = await Loan.find({ 
      student: studentId, 
      status: 'borrowed' 
    }).populate('book', 'title author dueDate');

    const loanHistory = await Loan.find({ 
      student: studentId, 
      status: 'returned' 
    })
      .populate('book', 'title author')
      .sort({ returnDate: -1 })
      .limit(10);

    const overdueLoans = await Loan.find({
      student: studentId,
      status: 'borrowed',
      dueDate: { $lt: new Date() }
    }).populate('book', 'title author dueDate');

    res.json({
      currentLoans,
      loanHistory,
      overdueLoans,
      stats: {
        currentLoansCount: currentLoans.length,
        totalLoansCount: await Loan.countDocuments({ student: studentId }),
        overdueCount: overdueLoans.length,
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la récupération des emprunts de l\'élève', error: error.message });
  }
};

export const updateOverdueLoans = async (req: AuthRequest, res: Response) => {
  try {
    // Update all borrowed loans that are past due date to overdue status
    const result = await Loan.updateMany(
      {
        status: 'borrowed',
        dueDate: { $lt: new Date() }
      },
      {
        $set: { status: 'overdue' }
      }
    );

    res.json({
      message: 'Statuts des emprunts en retard mis à jour',
      updated: result.modifiedCount
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour des statuts', error: error.message });
  }
};
