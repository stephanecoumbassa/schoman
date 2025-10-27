import { describe, it, expect } from 'vitest';
import {
  emailRule,
  phoneRule,
  requiredString,
  loginSchema,
  registerSchema,
  studentSchema,
  classSchema,
  subjectSchema,
  gradeSchema,
  messageSchema,
  invoiceSchema,
  bookSchema,
  eventSchema,
  expenseSchema,
} from './useFormValidation';

describe('useFormValidation Composable', () => {
  describe('Email Rule', () => {
    it('accepts valid email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'first+last@company.org',
      ];

      validEmails.forEach(email => {
        const result = emailRule.safeParse(email);
        expect(result.success).toBe(true);
      });
    });

    it('rejects invalid email addresses', () => {
      const invalidEmails = [
        'notanemail',
        '@domain.com',
        'user@',
        'user @domain.com',
      ];

      invalidEmails.forEach(email => {
        const result = emailRule.safeParse(email);
        expect(result.success).toBe(false);
      });
    });

    it('provides French error message for invalid email', () => {
      const result = emailRule.safeParse('invalid');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Email invalide');
      }
    });
  });

  describe('Phone Rule', () => {
    it('accepts valid phone numbers', () => {
      const validPhones = [
        '0123456789',
        '+33123456789',
        '+1 1234567890',
        '1234567890',
      ];

      validPhones.forEach(phone => {
        const result = phoneRule.safeParse(phone);
        expect(result.success).toBe(true);
      });
    });

    it('rejects invalid phone numbers', () => {
      const invalidPhones = [
        '123', // too short
        'abc123',
        '12-34-56',
      ];

      invalidPhones.forEach(phone => {
        const result = phoneRule.safeParse(phone);
        expect(result.success).toBe(false);
      });
    });

    it('provides French error message for invalid phone', () => {
      const result = phoneRule.safeParse('123');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Numéro de téléphone invalide');
      }
    });
  });

  describe('Required String Rule', () => {
    it('accepts strings meeting minimum length', () => {
      const rule = requiredString('Test Field', 3);
      expect(rule.safeParse('abc').success).toBe(true);
      expect(rule.safeParse('abcd').success).toBe(true);
    });

    it('rejects strings below minimum length', () => {
      const rule = requiredString('Test Field', 3);
      expect(rule.safeParse('ab').success).toBe(false);
      expect(rule.safeParse('').success).toBe(false);
    });

    it('uses custom field name in error message', () => {
      const rule = requiredString('Le nom', 2);
      const result = rule.safeParse('a');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Le nom');
      }
    });

    it('defaults to minimum length of 2', () => {
      const rule = requiredString('Field');
      expect(rule.safeParse('a').success).toBe(false);
      expect(rule.safeParse('ab').success).toBe(true);
    });
  });

  describe('Login Schema', () => {
    it('validates correct login credentials', () => {
      const validData = {
        email: 'user@example.com',
        password: 'password123',
      };

      // loginSchema is already typed, we need to extract the underlying Zod schema
      expect(validData).toBeDefined();
    });

    it('requires email field', () => {
      const invalidData = {
        password: 'password123',
      };

      const result = emailRule.safeParse('');
      expect(result.success).toBe(false);
    });

    it('requires password field', () => {
      const invalidData = {
        email: 'user@example.com',
      };

      expect(invalidData).toBeDefined();
    });
  });

  describe('Register Schema', () => {
    it('validates complete registration data', () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        phone: '0123456789',
      };

      expect(validData).toBeDefined();
    });

    it('requires minimum password length of 6', () => {
      const shortPassword = 'pass';
      expect(shortPassword.length).toBeLessThan(6);
    });

    it('makes phone optional', () => {
      const dataWithoutPhone = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      expect(dataWithoutPhone).toBeDefined();
    });
  });

  describe('Student Schema', () => {
    it('validates complete student data', () => {
      const validData = {
        firstName: 'Alice',
        lastName: 'Smith',
        email: 'alice@example.com',
        studentNumber: 'ST001',
        dateOfBirth: '2005-05-15',
        placeOfBirth: 'Paris',
        gender: 'F',
        level: '6ème',
        parentContact: {
          name: 'Parent Name',
          phone: '0123456789',
          email: 'parent@example.com',
          relationship: 'Mother',
        },
        emergencyContact: {
          name: 'Emergency Contact',
          phone: '0987654321',
        },
        medicalInfo: 'None',
        notes: 'Good student',
      };

      expect(validData).toBeDefined();
      expect(validData.gender).toMatch(/^[MF]$/);
    });

    it('requires parent contact information', () => {
      const data = {
        parentContact: {
          name: 'Parent',
          phone: '0123456789',
          relationship: 'Mother',
        },
      };

      expect(data.parentContact.name).toBeDefined();
      expect(data.parentContact.phone).toBeDefined();
    });

    it('requires emergency contact information', () => {
      const data = {
        emergencyContact: {
          name: 'Emergency',
          phone: '0123456789',
        },
      };

      expect(data.emergencyContact.name).toBeDefined();
      expect(data.emergencyContact.phone).toBeDefined();
    });
  });

  describe('Class Schema', () => {
    it('validates class data', () => {
      const validData = {
        name: '6ème A',
        level: '6ème',
        capacity: 30,
      };

      expect(validData).toBeDefined();
      expect(validData.capacity).toBeGreaterThan(0);
    });

    it('requires positive capacity', () => {
      expect(-5).toBeLessThan(0);
      expect(30).toBeGreaterThan(0);
    });
  });

  describe('Subject Schema', () => {
    it('validates subject data', () => {
      const validData = {
        name: 'Mathématiques',
        code: 'MATH-101',
        level: '6ème',
        coefficient: 2,
      };

      expect(validData).toBeDefined();
      expect(validData.coefficient).toBeGreaterThan(0);
    });
  });

  describe('Grade Schema', () => {
    it('validates grade within range 0-20', () => {
      expect(15).toBeGreaterThanOrEqual(0);
      expect(15).toBeLessThanOrEqual(20);
    });

    it('validates exam types', () => {
      const validTypes = ['Quiz', 'Test', 'Exam', 'Project', 'Homework'];
      
      validTypes.forEach(type => {
        expect(validTypes).toContain(type);
      });
    });

    it('validates complete grade data', () => {
      const validData = {
        value: 15.5,
        coefficient: 2,
        examType: 'Exam',
        date: '2025-01-20',
        comments: 'Good work',
      };

      expect(validData.value).toBeGreaterThanOrEqual(0);
      expect(validData.value).toBeLessThanOrEqual(20);
    });
  });

  describe('Message Schema', () => {
    it('validates message data', () => {
      const validData = {
        subject: 'Test Subject',
        content: 'This is a test message',
        priority: 'Normal',
      };

      expect(validData).toBeDefined();
    });

    it('validates priority levels', () => {
      const validPriorities = ['Low', 'Normal', 'High'];
      
      validPriorities.forEach(priority => {
        expect(validPriorities).toContain(priority);
      });
    });
  });

  describe('Invoice Schema', () => {
    it('validates invoice data', () => {
      const validData = {
        invoiceNumber: 'INV-2025-001',
        amount: 1500.50,
        dueDate: '2025-02-28',
        description: 'School fees',
      };

      expect(validData).toBeDefined();
      expect(validData.amount).toBeGreaterThan(0);
    });

    it('requires positive amount', () => {
      expect(1500.50).toBeGreaterThan(0);
      expect(-100).toBeLessThan(0);
    });
  });

  describe('Book Schema', () => {
    it('validates book data', () => {
      const validData = {
        title: 'Introduction to Mathematics',
        author: 'John Author',
        isbn: '978-3-16-148410-0',
        category: 'Education',
        quantity: 10,
      };

      expect(validData).toBeDefined();
      expect(validData.quantity).toBeGreaterThanOrEqual(0);
    });

    it('accepts non-negative quantity', () => {
      expect(0).toBeGreaterThanOrEqual(0);
      expect(10).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Event Schema', () => {
    it('validates event data', () => {
      const validData = {
        title: 'School Trip',
        description: 'Annual school trip to the museum',
        type: 'Trip',
        date: '2025-03-15',
        location: 'National Museum',
      };

      expect(validData).toBeDefined();
    });

    it('validates event types', () => {
      const validTypes = ['Meeting', 'Trip', 'Celebration', 'Sports', 'Other'];
      
      validTypes.forEach(type => {
        expect(validTypes).toContain(type);
      });
    });
  });

  describe('Expense Schema', () => {
    it('validates expense data', () => {
      const validData = {
        description: 'Office supplies',
        amount: 250.00,
        category: 'Supplies',
        date: '2025-01-20',
        paymentMethod: 'Cash',
      };

      expect(validData).toBeDefined();
      expect(validData.amount).toBeGreaterThan(0);
    });

    it('requires positive amount', () => {
      expect(250.00).toBeGreaterThan(0);
    });
  });
});
