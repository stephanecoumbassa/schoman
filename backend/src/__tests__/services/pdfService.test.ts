import { Response } from 'express';
import { 
  generateStudentListPDF, 
  generateGradeReportPDF, 
  generateInvoicePDF 
} from '../../services/pdfService.js';

// Mock PDFKit
jest.mock('pdfkit', () => {
  return jest.fn().mockImplementation(() => {
    const mockDoc = {
      fontSize: jest.fn().mockReturnThis(),
      font: jest.fn().mockReturnThis(),
      text: jest.fn().mockReturnThis(),
      moveDown: jest.fn().mockReturnThis(),
      moveTo: jest.fn().mockReturnThis(),
      lineTo: jest.fn().mockReturnThis(),
      stroke: jest.fn().mockReturnThis(),
      addPage: jest.fn().mockReturnThis(),
      pipe: jest.fn().mockReturnThis(),
      end: jest.fn(),
      y: 100,
      page: { height: 800 },
    };
    return mockDoc;
  });
});

describe('PDF Service', () => {
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockResponse = {
      setHeader: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('generateStudentListPDF', () => {
    it('should generate PDF with student data', () => {
      const students = [
        {
          studentNumber: 'STU001',
          firstName: 'Alice',
          lastName: 'Smith',
          class: 'CP-A',
          level: 'CP',
        },
        {
          studentNumber: 'STU002',
          firstName: 'Bob',
          lastName: 'Johnson',
          class: 'CP-B',
          level: 'CP',
        },
      ];

      generateStudentListPDF(students, mockResponse as Response);

      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment; filename=students-list.pdf'
      );
    });

    it('should handle empty student list', () => {
      const students: any[] = [];

      generateStudentListPDF(students, mockResponse as Response);

      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
    });

    it('should handle students with missing optional fields', () => {
      const students = [
        {
          studentNumber: 'STU001',
          firstName: 'Alice',
          lastName: 'Smith',
        },
      ];

      expect(() => {
        generateStudentListPDF(students, mockResponse as Response);
      }).not.toThrow();
    });

    it('should set correct PDF filename', () => {
      const students = [
        {
          studentNumber: 'STU001',
          firstName: 'Test',
          lastName: 'Student',
          class: 'CP-A',
          level: 'CP',
        },
      ];

      generateStudentListPDF(students, mockResponse as Response);

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        expect.stringContaining('students-list.pdf')
      );
    });

    it('should generate PDF for large student lists', () => {
      // Generate 100 students
      const students = Array.from({ length: 100 }, (_, i) => ({
        studentNumber: `STU${String(i + 1).padStart(3, '0')}`,
        firstName: `Student${i}`,
        lastName: `Name${i}`,
        class: `Class${i % 10}`,
        level: 'CP',
      }));

      expect(() => {
        generateStudentListPDF(students, mockResponse as Response);
      }).not.toThrow();
    });
  });

  describe('generateGradeReportPDF', () => {
    it('should generate grade report PDF', () => {
      const grades = [
        {
          student: 'Alice Smith',
          subject: 'Mathématiques',
          grade: 15,
          maxGrade: 20,
          date: '2025-01-15',
        },
        {
          student: 'Alice Smith',
          subject: 'Français',
          grade: 17,
          maxGrade: 20,
          date: '2025-01-15',
        },
      ];

      generateGradeReportPDF(grades, 'Alice Smith', mockResponse as Response);

      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        expect.stringContaining('bulletin-Alice-Smith.pdf')
      );
    });

    it('should handle student name with spaces correctly', () => {
      const grades = [
        {
          student: 'Jean Pierre Dupont',
          subject: 'Mathématiques',
          grade: 15,
          maxGrade: 20,
          date: '2025-01-15',
        },
      ];

      generateGradeReportPDF(grades, 'Jean Pierre Dupont', mockResponse as Response);

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        expect.stringContaining('bulletin-Jean-Pierre-Dupont.pdf')
      );
    });

    it('should handle empty grades list', () => {
      const grades: any[] = [];

      expect(() => {
        generateGradeReportPDF(grades, 'Test Student', mockResponse as Response);
      }).not.toThrow();
    });

    it('should generate PDF for multiple subjects', () => {
      const grades = Array.from({ length: 10 }, (_, i) => ({
        student: 'Test Student',
        subject: `Subject ${i + 1}`,
        grade: Math.floor(Math.random() * 20) + 1,
        maxGrade: 20,
        date: '2025-01-15',
      }));

      expect(() => {
        generateGradeReportPDF(grades, 'Test Student', mockResponse as Response);
      }).not.toThrow();
    });

    it('should handle special characters in student name', () => {
      const grades = [
        {
          student: 'François Müller',
          subject: 'Mathématiques',
          grade: 15,
          maxGrade: 20,
          date: '2025-01-15',
        },
      ];

      expect(() => {
        generateGradeReportPDF(grades, 'François Müller', mockResponse as Response);
      }).not.toThrow();
    });
  });

  describe('generateInvoicePDF', () => {
    it('should generate invoice PDF', () => {
      const invoice = {
        invoiceNumber: 'INV-2025-001',
        student: 'Alice Smith',
        amount: 500,
        dueDate: '2025-02-28',
        status: 'pending',
      };

      generateInvoicePDF(invoice, mockResponse as Response);

      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        expect.stringContaining('invoice-INV-2025-001.pdf')
      );
    });

    it('should handle invoice with all fields', () => {
      const invoice = {
        invoiceNumber: 'INV-2025-001',
        student: 'Alice Smith',
        amount: 1000,
        dueDate: '2025-02-28',
        status: 'paid',
        paidDate: '2025-01-15',
        description: 'Frais de scolarité Q1',
        items: [
          { description: 'Scolarité', amount: 800 },
          { description: 'Cantine', amount: 200 },
        ],
      };

      expect(() => {
        generateInvoicePDF(invoice, mockResponse as Response);
      }).not.toThrow();
    });

    it('should handle invoice with minimal fields', () => {
      const invoice = {
        invoiceNumber: 'INV-2025-002',
        student: 'Bob Johnson',
        amount: 250,
        dueDate: '2025-03-31',
        status: 'pending',
      };

      expect(() => {
        generateInvoicePDF(invoice, mockResponse as Response);
      }).not.toThrow();
    });

    it('should format invoice number in filename correctly', () => {
      const invoice = {
        invoiceNumber: 'INV-2025-001',
        student: 'Test Student',
        amount: 500,
        dueDate: '2025-02-28',
        status: 'pending',
      };

      generateInvoicePDF(invoice, mockResponse as Response);

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment; filename=invoice-INV-2025-001.pdf'
      );
    });
  });

  describe('PDF Format Validation', () => {
    it('should set correct Content-Type header for all PDFs', () => {
      const students = [{ studentNumber: 'STU001', firstName: 'Test', lastName: 'User' }];
      const grades = [{ student: 'Test', subject: 'Math', grade: 15, maxGrade: 20, date: '2025-01-15' }];
      const invoice = { invoiceNumber: 'INV-001', student: 'Test', amount: 100, dueDate: '2025-02-28', status: 'pending' };

      generateStudentListPDF(students, mockResponse as Response);
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');

      jest.clearAllMocks();
      generateGradeReportPDF(grades, 'Test', mockResponse as Response);
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');

      jest.clearAllMocks();
      generateInvoicePDF(invoice, mockResponse as Response);
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
    });

    it('should set Content-Disposition as attachment for all PDFs', () => {
      const students = [{ studentNumber: 'STU001', firstName: 'Test', lastName: 'User' }];
      const grades = [{ student: 'Test', subject: 'Math', grade: 15, maxGrade: 20, date: '2025-01-15' }];
      const invoice = { invoiceNumber: 'INV-001', student: 'Test', amount: 100, dueDate: '2025-02-28', status: 'pending' };

      generateStudentListPDF(students, mockResponse as Response);
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        expect.stringContaining('attachment;')
      );

      jest.clearAllMocks();
      generateGradeReportPDF(grades, 'Test', mockResponse as Response);
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        expect.stringContaining('attachment;')
      );

      jest.clearAllMocks();
      generateInvoicePDF(invoice, mockResponse as Response);
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        expect.stringContaining('attachment;')
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle missing required fields gracefully', () => {
      const invalidStudents: any = [{ firstName: 'Alice' }]; // Missing required fields

      expect(() => {
        generateStudentListPDF(invalidStudents, mockResponse as Response);
      }).not.toThrow();
    });

    it('should handle null or undefined values', () => {
      const studentsWithNulls = [
        {
          studentNumber: 'STU001',
          firstName: 'Alice',
          lastName: 'Smith',
          class: null,
          level: undefined,
        },
      ];

      expect(() => {
        generateStudentListPDF(studentsWithNulls, mockResponse as Response);
      }).not.toThrow();
    });

    it('should handle numeric values as strings', () => {
      const grades = [
        {
          student: 'Test Student',
          subject: 'Math',
          grade: '15' as any, // Should be number
          maxGrade: '20' as any,
          date: '2025-01-15',
        },
      ];

      expect(() => {
        generateGradeReportPDF(grades, 'Test Student', mockResponse as Response);
      }).not.toThrow();
    });
  });

  describe('Data Formatting', () => {
    it('should handle long student names', () => {
      const students = [
        {
          studentNumber: 'STU001',
          firstName: 'VeryLongFirstNameThatMightCauseLayoutIssues',
          lastName: 'VeryLongLastNameThatMightAlsoCauseProblems',
          class: 'CP-A',
          level: 'CP',
        },
      ];

      expect(() => {
        generateStudentListPDF(students, mockResponse as Response);
      }).not.toThrow();
    });

    it('should handle special characters in text', () => {
      const students = [
        {
          studentNumber: 'STU001',
          firstName: 'François',
          lastName: 'O\'Brien',
          class: 'Première S',
          level: 'Lycée',
        },
      ];

      expect(() => {
        generateStudentListPDF(students, mockResponse as Response);
      }).not.toThrow();
    });

    it('should handle dates in various formats', () => {
      const grades = [
        {
          student: 'Test Student',
          subject: 'Math',
          grade: 15,
          maxGrade: 20,
          date: '2025-01-15T10:30:00Z', // ISO format
        },
      ];

      expect(() => {
        generateGradeReportPDF(grades, 'Test Student', mockResponse as Response);
      }).not.toThrow();
    });
  });
});
