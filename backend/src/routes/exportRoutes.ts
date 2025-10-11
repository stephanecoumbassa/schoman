import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import Student from '../models/Student.js';
import Grade from '../models/Grade.js';
import Transaction from '../models/Transaction.js';
import Attendance from '../models/Attendance.js';
import Invoice from '../models/Invoice.js';
import {
  generateStudentListPDF,
  generateGradeReportPDF,
  generateInvoicePDF,
  generateAttendanceReportPDF
} from '../services/pdfService.js';
import {
  generateStudentListExcel,
  generateGradesExcel,
  generateTransactionsExcel,
  generateAttendanceExcel
} from '../services/excelService.js';

const router = Router();

// Export students list as PDF
router.get('/students/pdf', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const students = await Student.find()
      .populate('userId', 'firstName lastName email phone')
      .populate('class', 'name')
      .lean();
    
    const studentData = students.map(s => ({
      firstName: (s.userId as any)?.firstName || '',
      lastName: (s.userId as any)?.lastName || '',
      studentNumber: s.studentNumber,
      class: (s.class as any)?.name || '',
      level: s.level || '',
      email: (s.userId as any)?.email || '',
      phone: (s.userId as any)?.phone || ''
    }));
    
    generateStudentListPDF(studentData, res);
  } catch (error) {
    res.status(500).json({ message: 'PDF generation failed', error });
  }
});

// Export students list as Excel
router.get('/students/excel', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const students = await Student.find()
      .populate('userId', 'firstName lastName email phone')
      .populate('class', 'name')
      .lean();
    
    const studentData = students.map(s => ({
      firstName: (s.userId as any)?.firstName || '',
      lastName: (s.userId as any)?.lastName || '',
      studentNumber: s.studentNumber,
      class: (s.class as any)?.name || '',
      level: s.level || '',
      email: (s.userId as any)?.email || '',
      phone: (s.userId as any)?.phone || ''
    }));
    
    generateStudentListExcel(studentData, res);
  } catch (error) {
    res.status(500).json({ message: 'Excel generation failed', error });
  }
});

// Export grades as PDF
router.get('/grades/:studentId/pdf', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;
    
    const student = await Student.findById(studentId).populate('userId', 'firstName lastName');
    if (!student) {
      res.status(404).json({ message: 'Student not found' });
      return;
    }
    
    const grades = await Grade.find({ student: studentId })
      .populate('subject', 'name')
      .lean();
    
    const gradeData = grades.map(g => ({
      student: `${(student.userId as any)?.firstName} ${(student.userId as any)?.lastName}`,
      subject: (g.subject as any)?.name || g.subject,
      grade: g.grade,
      maxGrade: g.maxGrade,
      date: g.date.toISOString()
    }));
    
    const studentName = `${(student.userId as any)?.firstName} ${(student.userId as any)?.lastName}`;
    generateGradeReportPDF(gradeData, studentName, res);
  } catch (error) {
    res.status(500).json({ message: 'PDF generation failed', error });
  }
});

// Export grades as Excel
router.get('/grades/excel', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const grades = await Grade.find()
      .populate('student')
      .populate('subject', 'name')
      .lean();
    
    const gradeData = await Promise.all(
      grades.map(async (g) => {
        const student = await Student.findById(g.student).populate('userId', 'firstName lastName');
        return {
          student: student ? `${(student.userId as any)?.firstName} ${(student.userId as any)?.lastName}` : 'Unknown',
          subject: (g.subject as any)?.name || g.subject,
          grade: g.grade,
          maxGrade: g.maxGrade,
          coefficient: g.coefficient,
          date: g.date.toISOString()
        };
      })
    );
    
    generateGradesExcel(gradeData, res);
  } catch (error) {
    res.status(500).json({ message: 'Excel generation failed', error });
  }
});

// Export transactions as Excel
router.get('/transactions/excel', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const transactions = await Transaction.find().lean();
    
    const transactionData = transactions.map(t => ({
      date: t.transactionDate.toISOString(),
      type: t.type,
      category: t.category,
      amount: t.amount,
      description: t.description
    }));
    
    generateTransactionsExcel(transactionData, res);
  } catch (error) {
    res.status(500).json({ message: 'Excel generation failed', error });
  }
});

// Export attendance as PDF
router.get('/attendance/pdf', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;
    const query: any = {};
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }
    
    const attendance = await Attendance.find(query)
      .populate({
        path: 'student',
        populate: { path: 'userId', select: 'firstName lastName' }
      })
      .lean();
    
    const attendanceData = attendance.map(a => ({
      student: (a.student as any)?.userId 
        ? `${(a.student as any).userId.firstName} ${(a.student as any).userId.lastName}`
        : 'Unknown',
      date: a.date.toISOString(),
      status: a.status,
      remarks: a.comments || ''
    }));
    
    const period = startDate && endDate 
      ? `${new Date(startDate as string).toLocaleDateString('fr-FR')} - ${new Date(endDate as string).toLocaleDateString('fr-FR')}`
      : 'Toutes les dates';
    
    generateAttendanceReportPDF(attendanceData, period, res);
  } catch (error) {
    res.status(500).json({ message: 'PDF generation failed', error });
  }
});

// Export attendance as Excel
router.get('/attendance/excel', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;
    const query: any = {};
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }
    
    const attendance = await Attendance.find(query)
      .populate({
        path: 'student',
        populate: { path: 'userId', select: 'firstName lastName' }
      })
      .lean();
    
    const attendanceData = attendance.map(a => ({
      student: (a.student as any)?.userId 
        ? `${(a.student as any).userId.firstName} ${(a.student as any).userId.lastName}`
        : 'Unknown',
      date: a.date.toISOString(),
      status: a.status,
      type: a.status,
      remarks: a.comments || ''
    }));
    
    generateAttendanceExcel(attendanceData, res);
  } catch (error) {
    res.status(500).json({ message: 'Excel generation failed', error });
  }
});

// Export invoice as PDF
router.get('/invoices/:id/pdf', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate({
        path: 'student',
        populate: { path: 'userId', select: 'firstName lastName' }
      })
      .lean();
    
    if (!invoice) {
      res.status(404).json({ message: 'Invoice not found' });
      return;
    }
    
    const invoiceData = {
      invoiceNumber: invoice.invoiceNumber,
      student: (invoice.student as any)?.userId 
        ? `${(invoice.student as any).userId.firstName} ${(invoice.student as any).userId.lastName}`
        : 'Unknown',
      amount: invoice.totalAmount,
      dueDate: invoice.dueDate.toISOString(),
      status: invoice.status
    };
    
    generateInvoicePDF(invoiceData, res);
  } catch (error) {
    res.status(500).json({ message: 'PDF generation failed', error });
  }
});

export default router;
