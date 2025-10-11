import * as XLSX from 'xlsx';
import { Response } from 'express';

interface StudentData {
  firstName: string;
  lastName: string;
  studentNumber: string;
  class?: string;
  level?: string;
  email?: string;
  phone?: string;
  [key: string]: any;
}

interface GradeData {
  student: string;
  subject: string;
  grade: number;
  maxGrade: number;
  coefficient?: number;
  date: string;
  [key: string]: any;
}

interface TransactionData {
  date: string;
  type: string;
  category: string;
  amount: number;
  description: string;
  [key: string]: any;
}

/**
 * Generate Excel file for student list
 */
export function generateStudentListExcel(students: StudentData[], res: Response): void {
  // Prepare data for Excel
  const data = students.map(student => ({
    'Numéro': student.studentNumber,
    'Nom': student.lastName,
    'Prénom': student.firstName,
    'Classe': student.class || '-',
    'Niveau': student.level || '-',
    'Email': student.email || '-',
    'Téléphone': student.phone || '-'
  }));
  
  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Set column widths
  const columnWidths = [
    { wch: 15 }, // Numéro
    { wch: 20 }, // Nom
    { wch: 20 }, // Prénom
    { wch: 15 }, // Classe
    { wch: 15 }, // Niveau
    { wch: 25 }, // Email
    { wch: 15 }  // Téléphone
  ];
  worksheet['!cols'] = columnWidths;
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Élèves');
  
  // Generate buffer
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  
  // Set response headers
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=etudiants-liste.xlsx');
  res.send(buffer);
}

/**
 * Generate Excel file for grades
 */
export function generateGradesExcel(grades: GradeData[], res: Response): void {
  // Prepare data for Excel
  const data = grades.map(grade => ({
    'Élève': grade.student,
    'Matière': grade.subject,
    'Note': grade.grade,
    'Note Maximale': grade.maxGrade,
    'Coefficient': grade.coefficient || 1,
    'Pourcentage': `${((grade.grade / grade.maxGrade) * 100).toFixed(2)}%`,
    'Date': new Date(grade.date).toLocaleDateString('fr-FR')
  }));
  
  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Set column widths
  const columnWidths = [
    { wch: 25 }, // Élève
    { wch: 20 }, // Matière
    { wch: 10 }, // Note
    { wch: 15 }, // Note Maximale
    { wch: 12 }, // Coefficient
    { wch: 12 }, // Pourcentage
    { wch: 15 }  // Date
  ];
  worksheet['!cols'] = columnWidths;
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Notes');
  
  // Calculate statistics
  const totalGrade = grades.reduce((sum, g) => sum + g.grade, 0);
  const totalMax = grades.reduce((sum, g) => sum + g.maxGrade, 0);
  const average = totalMax > 0 ? ((totalGrade / totalMax) * 20).toFixed(2) : '0';
  
  const statsData = [
    { 'Statistique': 'Total Notes', 'Valeur': totalGrade },
    { 'Statistique': 'Total Maximum', 'Valeur': totalMax },
    { 'Statistique': 'Moyenne /20', 'Valeur': average },
    { 'Statistique': 'Nombre de notes', 'Valeur': grades.length }
  ];
  
  const statsSheet = XLSX.utils.json_to_sheet(statsData);
  XLSX.utils.book_append_sheet(workbook, statsSheet, 'Statistiques');
  
  // Generate buffer
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  
  // Set response headers
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=notes.xlsx');
  res.send(buffer);
}

/**
 * Generate Excel file for transactions
 */
export function generateTransactionsExcel(transactions: TransactionData[], res: Response): void {
  // Prepare data for Excel
  const data = transactions.map(transaction => ({
    'Date': new Date(transaction.date).toLocaleDateString('fr-FR'),
    'Type': transaction.type,
    'Catégorie': transaction.category,
    'Montant (FCFA)': transaction.amount,
    'Description': transaction.description
  }));
  
  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Set column widths
  const columnWidths = [
    { wch: 15 }, // Date
    { wch: 15 }, // Type
    { wch: 20 }, // Catégorie
    { wch: 15 }, // Montant
    { wch: 40 }  // Description
  ];
  worksheet['!cols'] = columnWidths;
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
  
  // Calculate totals by type
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const expense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = income - expense;
  
  const summaryData = [
    { 'Type': 'Revenus', 'Montant (FCFA)': income },
    { 'Type': 'Dépenses', 'Montant (FCFA)': expense },
    { 'Type': 'Solde', 'Montant (FCFA)': balance }
  ];
  
  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Résumé');
  
  // Generate buffer
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  
  // Set response headers
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=transactions.xlsx');
  res.send(buffer);
}

/**
 * Generate Excel file for attendance
 */
export function generateAttendanceExcel(attendanceData: any[], res: Response): void {
  // Prepare data for Excel
  const data = attendanceData.map(record => ({
    'Élève': record.student,
    'Date': new Date(record.date).toLocaleDateString('fr-FR'),
    'Statut': record.status,
    'Type': record.type || '-',
    'Remarque': record.remarks || '-'
  }));
  
  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Set column widths
  const columnWidths = [
    { wch: 25 }, // Élève
    { wch: 15 }, // Date
    { wch: 15 }, // Statut
    { wch: 15 }, // Type
    { wch: 40 }  // Remarque
  ];
  worksheet['!cols'] = columnWidths;
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Présences');
  
  // Calculate statistics
  const present = attendanceData.filter(r => r.status === 'present').length;
  const absent = attendanceData.filter(r => r.status === 'absent').length;
  const late = attendanceData.filter(r => r.status === 'late').length;
  
  const statsData = [
    { 'Statut': 'Présent', 'Nombre': present },
    { 'Statut': 'Absent', 'Nombre': absent },
    { 'Statut': 'Retard', 'Nombre': late },
    { 'Statut': 'Total', 'Nombre': attendanceData.length }
  ];
  
  const statsSheet = XLSX.utils.json_to_sheet(statsData);
  XLSX.utils.book_append_sheet(workbook, statsSheet, 'Statistiques');
  
  // Generate buffer
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  
  // Set response headers
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=presences.xlsx');
  res.send(buffer);
}
