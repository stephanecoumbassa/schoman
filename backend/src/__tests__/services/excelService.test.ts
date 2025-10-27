import { Response } from 'express';
import * as XLSX from 'xlsx';
import { 
  generateStudentListExcel, 
  generateGradesExcel, 
  generateTransactionsExcel 
} from '../../services/excelService.js';

// Mock xlsx
jest.mock('xlsx');
const mockXLSX = XLSX as jest.Mocked<typeof XLSX>;

describe('Excel Service', () => {
  let mockResponse: Partial<Response>;
  let mockWorkbook: any;
  let mockWorksheet: any;

  beforeEach(() => {
    mockWorksheet = {
      '!cols': [],
    };

    mockWorkbook = {
      Sheets: {},
      SheetNames: [],
    };

    mockResponse = {
      setHeader: jest.fn(),
      send: jest.fn(),
    };

    mockXLSX.utils = {
      book_new: jest.fn(() => mockWorkbook),
      json_to_sheet: jest.fn(() => mockWorksheet),
      book_append_sheet: jest.fn(),
    } as any;

    mockXLSX.write = jest.fn(() => Buffer.from('test'));

    jest.clearAllMocks();
  });

  describe('generateStudentListExcel', () => {
    it('should generate Excel file with student data', () => {
      const students = [
        {
          studentNumber: 'STU001',
          firstName: 'Alice',
          lastName: 'Smith',
          class: 'CP-A',
          level: 'CP',
          email: 'alice@test.com',
          phone: '0123456789',
        },
        {
          studentNumber: 'STU002',
          firstName: 'Bob',
          lastName: 'Johnson',
          class: 'CP-B',
          level: 'CP',
          email: 'bob@test.com',
          phone: '0987654321',
        },
      ];

      generateStudentListExcel(students, mockResponse as Response);

      expect(mockXLSX.utils.book_new).toHaveBeenCalled();
      expect(mockXLSX.utils.json_to_sheet).toHaveBeenCalled();
      expect(mockXLSX.utils.book_append_sheet).toHaveBeenCalledWith(
        mockWorkbook,
        mockWorksheet,
        'Élèves'
      );
    });

    it('should set correct Excel headers', () => {
      const students = [
        {
          studentNumber: 'STU001',
          firstName: 'Alice',
          lastName: 'Smith',
        },
      ];

      generateStudentListExcel(students, mockResponse as Response);

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment; filename=etudiants-liste.xlsx'
      );
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
        generateStudentListExcel(students, mockResponse as Response);
      }).not.toThrow();

      const jsonToSheetCall = mockXLSX.utils.json_to_sheet.mock.calls[0][0];
      expect(jsonToSheetCall[0]).toHaveProperty('Classe', '-');
      expect(jsonToSheetCall[0]).toHaveProperty('Email', '-');
      expect(jsonToSheetCall[0]).toHaveProperty('Téléphone', '-');
    });

    it('should handle empty student list', () => {
      const students: any[] = [];

      expect(() => {
        generateStudentListExcel(students, mockResponse as Response);
      }).not.toThrow();
    });

    it('should set column widths correctly', () => {
      const students = [
        {
          studentNumber: 'STU001',
          firstName: 'Alice',
          lastName: 'Smith',
        },
      ];

      generateStudentListExcel(students, mockResponse as Response);

      expect(mockWorksheet['!cols']).toHaveLength(7);
      expect(mockWorksheet['!cols'][0]).toEqual({ wch: 15 }); // Numéro
      expect(mockWorksheet['!cols'][5]).toEqual({ wch: 25 }); // Email
    });

    it('should generate workbook with .xlsx format', () => {
      const students = [
        {
          studentNumber: 'STU001',
          firstName: 'Test',
          lastName: 'User',
        },
      ];

      generateStudentListExcel(students, mockResponse as Response);

      expect(mockXLSX.write).toHaveBeenCalledWith(
        mockWorkbook,
        expect.objectContaining({ type: 'buffer', bookType: 'xlsx' })
      );
    });

    it('should send buffer in response', () => {
      const students = [
        {
          studentNumber: 'STU001',
          firstName: 'Test',
          lastName: 'User',
        },
      ];

      generateStudentListExcel(students, mockResponse as Response);

      expect(mockResponse.send).toHaveBeenCalledWith(expect.any(Buffer));
    });

    it('should map student data to French column names', () => {
      const students = [
        {
          studentNumber: 'STU001',
          firstName: 'Alice',
          lastName: 'Smith',
          class: 'CP-A',
          level: 'CP',
          email: 'alice@test.com',
          phone: '0123456789',
        },
      ];

      generateStudentListExcel(students, mockResponse as Response);

      const jsonToSheetCall = mockXLSX.utils.json_to_sheet.mock.calls[0][0];
      expect(jsonToSheetCall[0]).toHaveProperty('Numéro', 'STU001');
      expect(jsonToSheetCall[0]).toHaveProperty('Nom', 'Smith');
      expect(jsonToSheetCall[0]).toHaveProperty('Prénom', 'Alice');
      expect(jsonToSheetCall[0]).toHaveProperty('Classe', 'CP-A');
      expect(jsonToSheetCall[0]).toHaveProperty('Niveau', 'CP');
      expect(jsonToSheetCall[0]).toHaveProperty('Email', 'alice@test.com');
      expect(jsonToSheetCall[0]).toHaveProperty('Téléphone', '0123456789');
    });
  });

  describe('generateGradesExcel', () => {
    it('should generate Excel file with grades data', () => {
      const grades = [
        {
          student: 'Alice Smith',
          subject: 'Mathématiques',
          grade: 15,
          maxGrade: 20,
          date: '2025-01-15',
        },
        {
          student: 'Bob Johnson',
          subject: 'Français',
          grade: 17,
          maxGrade: 20,
          date: '2025-01-15',
        },
      ];

      generateGradesExcel(grades, mockResponse as Response);

      expect(mockXLSX.utils.book_new).toHaveBeenCalled();
      expect(mockXLSX.utils.json_to_sheet).toHaveBeenCalled();
      expect(mockXLSX.utils.book_append_sheet).toHaveBeenCalledWith(
        mockWorkbook,
        mockWorksheet,
        'Notes'
      );
    });

    it('should set correct Excel headers for grades', () => {
      const grades = [
        {
          student: 'Test Student',
          subject: 'Math',
          grade: 15,
          maxGrade: 20,
          date: '2025-01-15',
        },
      ];

      generateGradesExcel(grades, mockResponse as Response);

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment; filename=notes-export.xlsx'
      );
    });

    it('should calculate percentage correctly', () => {
      const grades = [
        {
          student: 'Test Student',
          subject: 'Math',
          grade: 15,
          maxGrade: 20,
          date: '2025-01-15',
        },
      ];

      generateGradesExcel(grades, mockResponse as Response);

      const jsonToSheetCall = mockXLSX.utils.json_to_sheet.mock.calls[0][0];
      expect(jsonToSheetCall[0]).toHaveProperty('Pourcentage', '75.00%');
    });

    it('should handle coefficient field', () => {
      const grades = [
        {
          student: 'Test Student',
          subject: 'Math',
          grade: 15,
          maxGrade: 20,
          coefficient: 2,
          date: '2025-01-15',
        },
      ];

      generateGradesExcel(grades, mockResponse as Response);

      const jsonToSheetCall = mockXLSX.utils.json_to_sheet.mock.calls[0][0];
      expect(jsonToSheetCall[0]).toHaveProperty('Coefficient', 2);
    });

    it('should default coefficient to 1 if not provided', () => {
      const grades = [
        {
          student: 'Test Student',
          subject: 'Math',
          grade: 15,
          maxGrade: 20,
          date: '2025-01-15',
        },
      ];

      generateGradesExcel(grades, mockResponse as Response);

      const jsonToSheetCall = mockXLSX.utils.json_to_sheet.mock.calls[0][0];
      expect(jsonToSheetCall[0]).toHaveProperty('Coefficient', 1);
    });

    it('should format dates to French locale', () => {
      const grades = [
        {
          student: 'Test Student',
          subject: 'Math',
          grade: 15,
          maxGrade: 20,
          date: '2025-01-15',
        },
      ];

      generateGradesExcel(grades, mockResponse as Response);

      const jsonToSheetCall = mockXLSX.utils.json_to_sheet.mock.calls[0][0];
      expect(jsonToSheetCall[0]).toHaveProperty('Date');
      expect(jsonToSheetCall[0].Date).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it('should handle empty grades list', () => {
      const grades: any[] = [];

      expect(() => {
        generateGradesExcel(grades, mockResponse as Response);
      }).not.toThrow();
    });

    it('should map grades data to French column names', () => {
      const grades = [
        {
          student: 'Alice Smith',
          subject: 'Mathématiques',
          grade: 18,
          maxGrade: 20,
          coefficient: 3,
          date: '2025-01-15',
        },
      ];

      generateGradesExcel(grades, mockResponse as Response);

      const jsonToSheetCall = mockXLSX.utils.json_to_sheet.mock.calls[0][0];
      expect(jsonToSheetCall[0]).toHaveProperty('Élève', 'Alice Smith');
      expect(jsonToSheetCall[0]).toHaveProperty('Matière', 'Mathématiques');
      expect(jsonToSheetCall[0]).toHaveProperty('Note', 18);
      expect(jsonToSheetCall[0]).toHaveProperty('Note Maximale', 20);
      expect(jsonToSheetCall[0]).toHaveProperty('Coefficient', 3);
    });
  });

  describe('generateTransactionsExcel', () => {
    it('should generate Excel file with transaction data', () => {
      const transactions = [
        {
          date: '2025-01-15',
          type: 'income',
          category: 'Scolarité',
          amount: 500,
          description: 'Frais de scolarité Q1',
        },
        {
          date: '2025-01-20',
          type: 'expense',
          category: 'Fournitures',
          amount: 150,
          description: 'Achat de fournitures',
        },
      ];

      generateTransactionsExcel(transactions, mockResponse as Response);

      expect(mockXLSX.utils.book_new).toHaveBeenCalled();
      expect(mockXLSX.utils.json_to_sheet).toHaveBeenCalled();
      expect(mockXLSX.utils.book_append_sheet).toHaveBeenCalledWith(
        mockWorkbook,
        mockWorksheet,
        'Transactions'
      );
    });

    it('should set correct Excel headers for transactions', () => {
      const transactions = [
        {
          date: '2025-01-15',
          type: 'income',
          category: 'Test',
          amount: 100,
          description: 'Test transaction',
        },
      ];

      generateTransactionsExcel(transactions, mockResponse as Response);

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment; filename=transactions-export.xlsx'
      );
    });

    it('should format amounts correctly', () => {
      const transactions = [
        {
          date: '2025-01-15',
          type: 'income',
          category: 'Scolarité',
          amount: 1234.56,
          description: 'Test',
        },
      ];

      generateTransactionsExcel(transactions, mockResponse as Response);

      const jsonToSheetCall = mockXLSX.utils.json_to_sheet.mock.calls[0][0];
      expect(jsonToSheetCall[0]).toHaveProperty('Montant');
    });

    it('should handle empty transactions list', () => {
      const transactions: any[] = [];

      expect(() => {
        generateTransactionsExcel(transactions, mockResponse as Response);
      }).not.toThrow();
    });

    it('should map transaction data to French column names', () => {
      const transactions = [
        {
          date: '2025-01-15',
          type: 'income',
          category: 'Scolarité',
          amount: 500,
          description: 'Frais de scolarité',
        },
      ];

      generateTransactionsExcel(transactions, mockResponse as Response);

      const jsonToSheetCall = mockXLSX.utils.json_to_sheet.mock.calls[0][0];
      expect(jsonToSheetCall[0]).toHaveProperty('Date');
      expect(jsonToSheetCall[0]).toHaveProperty('Type');
      expect(jsonToSheetCall[0]).toHaveProperty('Catégorie', 'Scolarité');
      expect(jsonToSheetCall[0]).toHaveProperty('Montant', 500);
      expect(jsonToSheetCall[0]).toHaveProperty('Description', 'Frais de scolarité');
    });
  });

  describe('Excel Format Validation', () => {
    it('should set correct MIME type for all exports', () => {
      const students = [{ studentNumber: 'STU001', firstName: 'Test', lastName: 'User' }];
      const grades = [{ student: 'Test', subject: 'Math', grade: 15, maxGrade: 20, date: '2025-01-15' }];
      const transactions = [{ date: '2025-01-15', type: 'income', category: 'Test', amount: 100, description: 'Test' }];

      generateStudentListExcel(students, mockResponse as Response);
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );

      jest.clearAllMocks();
      generateGradesExcel(grades, mockResponse as Response);
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );

      jest.clearAllMocks();
      generateTransactionsExcel(transactions, mockResponse as Response);
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
    });

    it('should use .xlsx extension for all files', () => {
      const students = [{ studentNumber: 'STU001', firstName: 'Test', lastName: 'User' }];
      const grades = [{ student: 'Test', subject: 'Math', grade: 15, maxGrade: 20, date: '2025-01-15' }];
      const transactions = [{ date: '2025-01-15', type: 'income', category: 'Test', amount: 100, description: 'Test' }];

      generateStudentListExcel(students, mockResponse as Response);
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        expect.stringContaining('.xlsx')
      );

      jest.clearAllMocks();
      generateGradesExcel(grades, mockResponse as Response);
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        expect.stringContaining('.xlsx')
      );

      jest.clearAllMocks();
      generateTransactionsExcel(transactions, mockResponse as Response);
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        expect.stringContaining('.xlsx')
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle special characters in data', () => {
      const students = [
        {
          studentNumber: 'STU001',
          firstName: 'François',
          lastName: 'O\'Brien',
          class: 'Première S',
          email: 'françois.obrien@école.fr',
        },
      ];

      expect(() => {
        generateStudentListExcel(students, mockResponse as Response);
      }).not.toThrow();
    });

    it('should handle very large datasets', () => {
      const students = Array.from({ length: 1000 }, (_, i) => ({
        studentNumber: `STU${String(i + 1).padStart(3, '0')}`,
        firstName: `Student${i}`,
        lastName: `Name${i}`,
        class: `Class${i % 10}`,
        level: 'CP',
      }));

      expect(() => {
        generateStudentListExcel(students, mockResponse as Response);
      }).not.toThrow();
    });

    it('should handle null or undefined values', () => {
      const students = [
        {
          studentNumber: 'STU001',
          firstName: 'Alice',
          lastName: 'Smith',
          class: null,
          level: undefined,
        } as any,
      ];

      expect(() => {
        generateStudentListExcel(students, mockResponse as Response);
      }).not.toThrow();
    });
  });
});
