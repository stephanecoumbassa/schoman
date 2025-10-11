import PDFDocument from 'pdfkit';
import { Response } from 'express';

interface StudentData {
  firstName: string;
  lastName: string;
  studentNumber: string;
  class?: string;
  level?: string;
  [key: string]: any;
}

interface GradeData {
  student: string;
  subject: string;
  grade: number;
  maxGrade: number;
  date: string;
  [key: string]: any;
}

interface InvoiceData {
  invoiceNumber: string;
  student: string;
  amount: number;
  dueDate: string;
  status: string;
  [key: string]: any;
}

/**
 * Generate PDF for student list
 */
export function generateStudentListPDF(students: StudentData[], res: Response): void {
  const doc = new PDFDocument({ margin: 50 });
  
  // Set response headers
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=students-list.pdf');
  
  // Pipe to response
  doc.pipe(res);
  
  // Title
  doc.fontSize(20).text('Liste des Élèves', { align: 'center' });
  doc.moveDown();
  doc.fontSize(10).text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, { align: 'center' });
  doc.moveDown(2);
  
  // Table header
  const tableTop = doc.y;
  doc.fontSize(12).font('Helvetica-Bold');
  doc.text('Numéro', 50, tableTop);
  doc.text('Nom', 150, tableTop);
  doc.text('Classe', 300, tableTop);
  doc.text('Niveau', 400, tableTop);
  
  doc.moveTo(50, tableTop + 20).lineTo(550, tableTop + 20).stroke();
  
  // Table rows
  doc.font('Helvetica').fontSize(10);
  let yPosition = tableTop + 30;
  
  students.forEach((student, index) => {
    if (yPosition > 700) {
      doc.addPage();
      yPosition = 50;
    }
    
    doc.text(student.studentNumber, 50, yPosition);
    doc.text(`${student.firstName} ${student.lastName}`, 150, yPosition);
    doc.text(student.class || '-', 300, yPosition);
    doc.text(student.level || '-', 400, yPosition);
    
    yPosition += 25;
  });
  
  // Footer
  doc.fontSize(8).text(
    `Total: ${students.length} élève(s)`,
    50,
    doc.page.height - 50,
    { align: 'center' }
  );
  
  doc.end();
}

/**
 * Generate PDF for grade report
 */
export function generateGradeReportPDF(grades: GradeData[], studentName: string, res: Response): void {
  const doc = new PDFDocument({ margin: 50 });
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=bulletin-${studentName.replace(/\s+/g, '-')}.pdf`);
  
  doc.pipe(res);
  
  // Title
  doc.fontSize(20).text('Bulletin Scolaire', { align: 'center' });
  doc.moveDown();
  doc.fontSize(14).text(studentName, { align: 'center' });
  doc.moveDown();
  doc.fontSize(10).text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, { align: 'center' });
  doc.moveDown(2);
  
  // Table header
  const tableTop = doc.y;
  doc.fontSize(12).font('Helvetica-Bold');
  doc.text('Matière', 50, tableTop);
  doc.text('Note', 300, tableTop);
  doc.text('Note Max', 400, tableTop);
  doc.text('Date', 480, tableTop);
  
  doc.moveTo(50, tableTop + 20).lineTo(550, tableTop + 20).stroke();
  
  // Table rows
  doc.font('Helvetica').fontSize(10);
  let yPosition = tableTop + 30;
  let totalGrade = 0;
  let totalMax = 0;
  
  grades.forEach((grade) => {
    if (yPosition > 700) {
      doc.addPage();
      yPosition = 50;
    }
    
    doc.text(grade.subject, 50, yPosition);
    doc.text(grade.grade.toString(), 300, yPosition);
    doc.text(grade.maxGrade.toString(), 400, yPosition);
    doc.text(new Date(grade.date).toLocaleDateString('fr-FR'), 480, yPosition);
    
    totalGrade += grade.grade;
    totalMax += grade.maxGrade;
    yPosition += 25;
  });
  
  // Average
  doc.moveDown(2);
  doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
  yPosition += 10;
  doc.fontSize(12).font('Helvetica-Bold');
  const average = totalMax > 0 ? ((totalGrade / totalMax) * 20).toFixed(2) : '0';
  doc.text(`Moyenne générale: ${average}/20`, 50, yPosition);
  
  doc.end();
}

/**
 * Generate PDF for invoice
 */
export function generateInvoicePDF(invoice: InvoiceData, res: Response): void {
  const doc = new PDFDocument({ margin: 50 });
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=facture-${invoice.invoiceNumber}.pdf`);
  
  doc.pipe(res);
  
  // Header
  doc.fontSize(24).text('FACTURE', { align: 'center' });
  doc.moveDown();
  doc.fontSize(10).text(`N° ${invoice.invoiceNumber}`, { align: 'center' });
  doc.moveDown(2);
  
  // Invoice details
  doc.fontSize(12).font('Helvetica-Bold').text('Détails de la facture:');
  doc.moveDown();
  doc.font('Helvetica').fontSize(10);
  doc.text(`Élève: ${invoice.student}`);
  doc.text(`Montant: ${invoice.amount.toLocaleString('fr-FR')} FCFA`);
  doc.text(`Date d'échéance: ${new Date(invoice.dueDate).toLocaleDateString('fr-FR')}`);
  doc.text(`Statut: ${invoice.status}`);
  doc.moveDown(2);
  
  // Footer
  doc.fontSize(8).text(
    `Document généré le ${new Date().toLocaleDateString('fr-FR')}`,
    50,
    doc.page.height - 50,
    { align: 'center' }
  );
  
  doc.end();
}

/**
 * Generate attendance report PDF
 */
export function generateAttendanceReportPDF(
  attendanceData: any[],
  period: string,
  res: Response
): void {
  const doc = new PDFDocument({ margin: 50 });
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=presence-${period}.pdf`);
  
  doc.pipe(res);
  
  // Title
  doc.fontSize(20).text('Rapport de Présence', { align: 'center' });
  doc.moveDown();
  doc.fontSize(10).text(`Période: ${period}`, { align: 'center' });
  doc.moveDown();
  doc.fontSize(10).text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, { align: 'center' });
  doc.moveDown(2);
  
  // Table header
  const tableTop = doc.y;
  doc.fontSize(12).font('Helvetica-Bold');
  doc.text('Élève', 50, tableTop);
  doc.text('Date', 250, tableTop);
  doc.text('Statut', 350, tableTop);
  doc.text('Remarque', 450, tableTop);
  
  doc.moveTo(50, tableTop + 20).lineTo(550, tableTop + 20).stroke();
  
  // Table rows
  doc.font('Helvetica').fontSize(10);
  let yPosition = tableTop + 30;
  
  attendanceData.forEach((record) => {
    if (yPosition > 700) {
      doc.addPage();
      yPosition = 50;
    }
    
    doc.text(record.student || '-', 50, yPosition, { width: 180 });
    doc.text(new Date(record.date).toLocaleDateString('fr-FR'), 250, yPosition);
    doc.text(record.status || '-', 350, yPosition);
    doc.text(record.remarks || '-', 450, yPosition, { width: 100 });
    
    yPosition += 25;
  });
  
  doc.end();
}
