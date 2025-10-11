import { Response } from 'express';
import * as XLSX from 'xlsx';
import PDFDocument from 'pdfkit';
import Report, { IReport } from '../models/Report.js';
import Student from '../models/Student.js';
import Grade from '../models/Grade.js';
import Attendance from '../models/Attendance.js';
import Invoice from '../models/Invoice.js';
import Transaction from '../models/Transaction.js';
import { logger } from '../middleware/errorHandler.js';

interface ReportData {
  [key: string]: any;
}

/**
 * Build MongoDB query from filters
 */
function buildQuery(filters: IReport['filters'], schoolId: string): any {
  const query: any = { school: schoolId };

  filters.forEach((filter) => {
    const { field, operator, value } = filter;

    switch (operator) {
      case 'equals':
        query[field] = value;
        break;
      case 'contains':
        query[field] = { $regex: value, $options: 'i' };
        break;
      case 'gt':
        query[field] = { $gt: value };
        break;
      case 'lt':
        query[field] = { $lt: value };
        break;
      case 'gte':
        query[field] = { $gte: value };
        break;
      case 'lte':
        query[field] = { $lte: value };
        break;
      case 'in':
        query[field] = { $in: Array.isArray(value) ? value : [value] };
        break;
      case 'between':
        if (Array.isArray(value) && value.length === 2) {
          query[field] = { $gte: value[0], $lte: value[1] };
        }
        break;
    }
  });

  return query;
}

/**
 * Fetch data based on report type
 */
async function fetchReportData(
  type: IReport['type'],
  query: any,
  fields: string[],
  sortBy?: string,
  sortOrder?: 'asc' | 'desc'
): Promise<ReportData[]> {
  let Model;
  let populateFields: any[] = [];

  switch (type) {
    case 'students':
      Model = Student;
      populateFields = [
        { path: 'class', select: 'name level' },
        { path: 'parent', select: 'firstName lastName email' },
      ];
      break;
    case 'grades':
      Model = Grade;
      populateFields = [
        { path: 'student', select: 'firstName lastName studentNumber' },
        { path: 'class', select: 'name level' },
      ];
      break;
    case 'attendance':
      Model = Attendance;
      populateFields = [
        { path: 'student', select: 'firstName lastName studentNumber' },
        { path: 'class', select: 'name' },
      ];
      break;
    case 'finances':
      Model = Invoice;
      populateFields = [
        { path: 'student', select: 'firstName lastName studentNumber' },
      ];
      break;
    case 'custom':
      Model = Transaction;
      break;
    default:
      throw new Error(`Unsupported report type: ${type}`);
  }

  // Build sort object
  const sort: any = {};
  if (sortBy) {
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
  }

  // Fetch data
  let queryBuilder = Model.find(query).select(fields.join(' ')).sort(sort);

  // Apply population
  populateFields.forEach((populate) => {
    queryBuilder = queryBuilder.populate(populate);
  });

  const data = await queryBuilder.lean().exec();
  return data as ReportData[];
}

/**
 * Generate Excel report
 */
export async function generateExcelReport(
  report: IReport,
  schoolId: string,
  res: Response
): Promise<void> {
  try {
    // Build query and fetch data
    const query = buildQuery(report.filters, schoolId);
    const data = await fetchReportData(
      report.type,
      query,
      report.fields,
      report.sortBy,
      report.sortOrder
    );

    // Prepare data for Excel
    const excelData = data.map((item) => {
      const row: any = {};
      report.fields.forEach((field) => {
        const value = getNestedValue(item, field);
        row[formatFieldName(field)] = formatValue(value);
      });
      return row;
    });

    // Create workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const columnWidths = report.fields.map(() => ({ wch: 20 }));
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, report.name.substring(0, 31));

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Update last run
    report.lastRun = new Date();
    await report.save();

    // Set response headers
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${sanitizeFilename(report.name)}.xlsx`
    );
    res.send(buffer);

    logger.info(`Excel report generated: ${report.name}`, { reportId: report._id });
  } catch (error) {
    logger.error('Error generating Excel report', { error, reportId: report._id });
    throw error;
  }
}

/**
 * Generate PDF report
 */
export async function generatePDFReport(
  report: IReport,
  schoolId: string,
  res: Response
): Promise<void> {
  try {
    // Build query and fetch data
    const query = buildQuery(report.filters, schoolId);
    const data = await fetchReportData(
      report.type,
      query,
      report.fields,
      report.sortBy,
      report.sortOrder
    );

    const doc = new PDFDocument({ margin: 50 });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${sanitizeFilename(report.name)}.pdf`
    );

    // Pipe to response
    doc.pipe(res);

    // Title
    doc.fontSize(20).text(report.name, { align: 'center' });
    doc.moveDown();

    if (report.description) {
      doc.fontSize(12).text(report.description, { align: 'center' });
      doc.moveDown();
    }

    doc.fontSize(10).text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, {
      align: 'center',
    });
    doc.moveDown(2);

    // Table header
    const tableTop = doc.y;
    const columnWidth = 500 / report.fields.length;
    doc.fontSize(10).font('Helvetica-Bold');

    report.fields.forEach((field, index) => {
      doc.text(formatFieldName(field), 50 + index * columnWidth, tableTop, {
        width: columnWidth - 10,
      });
    });

    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    // Table rows
    doc.font('Helvetica').fontSize(9);
    let yPosition = tableTop + 25;

    data.forEach((item) => {
      if (yPosition > 700) {
        doc.addPage();
        yPosition = 50;
      }

      report.fields.forEach((field, index) => {
        const value = getNestedValue(item, field);
        doc.text(formatValue(value).toString(), 50 + index * columnWidth, yPosition, {
          width: columnWidth - 10,
        });
      });

      yPosition += 20;
    });

    // Footer
    doc.fontSize(8).text(`Total: ${data.length} enregistrement(s)`, 50, doc.page.height - 50, {
      align: 'center',
    });

    // Update last run
    report.lastRun = new Date();
    await report.save();

    doc.end();

    logger.info(`PDF report generated: ${report.name}`, { reportId: report._id });
  } catch (error) {
    logger.error('Error generating PDF report', { error, reportId: report._id });
    throw error;
  }
}

/**
 * Generate CSV report
 */
export async function generateCSVReport(
  report: IReport,
  schoolId: string,
  res: Response
): Promise<void> {
  try {
    // Build query and fetch data
    const query = buildQuery(report.filters, schoolId);
    const data = await fetchReportData(
      report.type,
      query,
      report.fields,
      report.sortBy,
      report.sortOrder
    );

    // Create CSV header
    const header = report.fields.map((field) => formatFieldName(field)).join(',');

    // Create CSV rows
    const rows = data
      .map((item) => {
        return report.fields
          .map((field) => {
            const value = getNestedValue(item, field);
            const formatted = formatValue(value).toString();
            // Escape commas and quotes
            return formatted.includes(',') || formatted.includes('"')
              ? `"${formatted.replace(/"/g, '""')}"`
              : formatted;
          })
          .join(',');
      })
      .join('\n');

    const csv = `${header}\n${rows}`;

    // Update last run
    report.lastRun = new Date();
    await report.save();

    // Set response headers
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${sanitizeFilename(report.name)}.csv`
    );
    res.send('\uFEFF' + csv); // Add BOM for UTF-8

    logger.info(`CSV report generated: ${report.name}`, { reportId: report._id });
  } catch (error) {
    logger.error('Error generating CSV report', { error, reportId: report._id });
    throw error;
  }
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : '-';
  }, obj);
}

/**
 * Format field name for display
 */
function formatFieldName(field: string): string {
  const fieldNames: { [key: string]: string } = {
    firstName: 'Prénom',
    lastName: 'Nom',
    studentNumber: 'Numéro',
    email: 'Email',
    phone: 'Téléphone',
    class: 'Classe',
    level: 'Niveau',
    grade: 'Note',
    subject: 'Matière',
    date: 'Date',
    status: 'Statut',
    amount: 'Montant',
    type: 'Type',
    description: 'Description',
  };

  return fieldNames[field] || field.charAt(0).toUpperCase() + field.slice(1);
}

/**
 * Format value for display
 */
function formatValue(value: any): string | number {
  if (value === null || value === undefined) {
    return '-';
  }

  if (value instanceof Date) {
    return value.toLocaleDateString('fr-FR');
  }

  if (typeof value === 'object') {
    if (value.firstName && value.lastName) {
      return `${value.firstName} ${value.lastName}`;
    }
    if (value.name) {
      return value.name;
    }
    return JSON.stringify(value);
  }

  return value;
}

/**
 * Sanitize filename for download
 */
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-z0-9]/gi, '-')
    .replace(/-+/g, '-')
    .toLowerCase();
}

/**
 * Get report templates
 */
export function getReportTemplates(): any[] {
  return [
    {
      name: 'Liste des élèves',
      type: 'students',
      fields: ['studentNumber', 'firstName', 'lastName', 'class', 'level', 'email'],
      filters: [],
      sortBy: 'lastName',
    },
    {
      name: 'Notes par matière',
      type: 'grades',
      fields: ['student', 'subject', 'grade', 'maxGrade', 'date'],
      filters: [],
      sortBy: 'date',
      sortOrder: 'desc',
    },
    {
      name: 'Présences mensuelles',
      type: 'attendance',
      fields: ['student', 'date', 'status', 'class'],
      filters: [],
      sortBy: 'date',
      sortOrder: 'desc',
    },
    {
      name: 'Factures impayées',
      type: 'finances',
      fields: ['invoiceNumber', 'student', 'amount', 'dueDate', 'status'],
      filters: [{ field: 'status', operator: 'equals', value: 'pending' }],
      sortBy: 'dueDate',
    },
    {
      name: 'Transactions du mois',
      type: 'finances',
      fields: ['date', 'type', 'category', 'amount', 'description'],
      filters: [],
      sortBy: 'date',
      sortOrder: 'desc',
    },
  ];
}
