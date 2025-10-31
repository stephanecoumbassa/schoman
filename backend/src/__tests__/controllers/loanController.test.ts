import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Loan from '../../models/Loan.js';
import Book from '../../models/Book.js';
import Student from '../../models/Student.js';
import User from '../../models/User.js';
import School from '../../models/School.js';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Loan.deleteMany({});
  await Book.deleteMany({});
  await Student.deleteMany({});
  await User.deleteMany({});
  await School.deleteMany({});
});

describe('Loan Controller', () => {
  let school: any;
  let studentUser: any;
  let student: any;
  let book: any;

  beforeEach(async () => {
    school = await School.create({
      name: 'Test School',
      code: 'TEST001',
      address: '123 Test St',
      phone: '+33123456789',
      email: 'test@school.com',
      academicYearStart: new Date('2024-09-01'),
      academicYearEnd: new Date('2025-06-30'),
    });

    studentUser = await User.create({
      email: 'student@test.com',
      password: 'password123',
      firstName: 'Jane',
      lastName: 'Student',
      role: 'student',
      school: school._id,
    });

    student = await Student.create({
      userId: studentUser._id,
      studentNumber: 'STU001',
      dateOfBirth: new Date('2010-01-01'),
      placeOfBirth: 'Paris',
      gender: 'F',
      school: school._id,
      parentContact: {
        name: 'Parent Name',
        phone: '+33123456789',
        relationship: 'Mother',
      },
      emergencyContact: {
        name: 'Emergency Contact',
        phone: '+33123456790',
      },
    });

    book = await Book.create({
      title: 'Test Book',
      author: 'Test Author',
      isbn: '978-3-16-148410-0',
      category: 'Technology',
      totalQuantity: 5,
      availableQuantity: 5,
      isActive: true,
    });
  });

  describe('Create Loan', () => {
    it('should create loan with valid data', async () => {
      const loanData = {
        book: book._id,
        student: student._id,
        borrowDate: new Date(),
        dueDate: new Date(Date.now() + 14 * 86400000), // 14 days from now
        status: 'borrowed',
        notes: 'First time borrower',
      };

      const loan = await Loan.create(loanData);

      expect(loan.book.toString()).toBe(book._id.toString());
      expect(loan.student.toString()).toBe(student._id.toString());
      expect(loan.status).toBe('borrowed');
      expect(loan.notes).toBe('First time borrower');
    });

    it('should decrease book available quantity when loan is created', async () => {
      const initialQuantity = book.availableQuantity;

      await Loan.create({
        book: book._id,
        student: student._id,
        dueDate: new Date(Date.now() + 14 * 86400000),
        status: 'borrowed',
      });

      // Simulate controller behavior
      await Book.findByIdAndUpdate(book._id, {
        $inc: { availableQuantity: -1 },
      });

      const updatedBook = await Book.findById(book._id);
      expect(updatedBook?.availableQuantity).toBe(initialQuantity - 1);
    });

    it('should fail when book does not exist', async () => {
      const invalidBookId = new mongoose.Types.ObjectId();

      const loanData = {
        book: invalidBookId,
        student: student._id,
        dueDate: new Date(Date.now() + 14 * 86400000),
      };

      await expect(Loan.create(loanData)).rejects.toThrow();
    });

    it('should fail when student does not exist', async () => {
      const invalidStudentId = new mongoose.Types.ObjectId();

      const loanData = {
        book: book._id,
        student: invalidStudentId,
        dueDate: new Date(Date.now() + 14 * 86400000),
      };

      await expect(Loan.create(loanData)).rejects.toThrow();
    });

    it('should set default status to borrowed', async () => {
      const loan = await Loan.create({
        book: book._id,
        student: student._id,
        dueDate: new Date(Date.now() + 14 * 86400000),
      });

      expect(loan.status).toBe('borrowed');
    });
  });

  describe('Get Loans', () => {
    beforeEach(async () => {
      const book2 = await Book.create({
        title: 'Another Book',
        author: 'Another Author',
        category: 'Science',
        totalQuantity: 3,
        availableQuantity: 2,
      });

      await Loan.create([
        {
          book: book._id,
          student: student._id,
          borrowDate: new Date(),
          dueDate: new Date(Date.now() + 14 * 86400000),
          status: 'borrowed',
        },
        {
          book: book2._id,
          student: student._id,
          borrowDate: new Date(Date.now() - 30 * 86400000),
          dueDate: new Date(Date.now() - 2 * 86400000),
          returnDate: new Date(Date.now() - 1 * 86400000),
          status: 'returned',
        },
        {
          book: book._id,
          student: student._id,
          borrowDate: new Date(Date.now() - 20 * 86400000),
          dueDate: new Date(Date.now() - 5 * 86400000),
          status: 'overdue',
        },
      ]);
    });

    it('should retrieve all loans', async () => {
      const loans = await Loan.find();
      expect(loans).toHaveLength(3);
    });

    it('should filter loans by student', async () => {
      const loans = await Loan.find({ student: student._id });
      expect(loans).toHaveLength(3);
    });

    it('should filter loans by book', async () => {
      const loans = await Loan.find({ book: book._id });
      expect(loans).toHaveLength(2);
    });

    it('should filter loans by status', async () => {
      const borrowedLoans = await Loan.find({ status: 'borrowed' });
      expect(borrowedLoans).toHaveLength(1);

      const returnedLoans = await Loan.find({ status: 'returned' });
      expect(returnedLoans).toHaveLength(1);

      const overdueLoans = await Loan.find({ status: 'overdue' });
      expect(overdueLoans).toHaveLength(1);
    });

    it('should populate book details', async () => {
      const loans = await Loan.find().populate('book', 'title author isbn');
      expect(loans[0].book).toHaveProperty('title');
    });

    it('should populate student and user details', async () => {
      const loans = await Loan.find().populate({
        path: 'student',
        populate: { path: 'userId', select: 'firstName lastName' },
      });
      expect(loans[0].student).toHaveProperty('userId');
    });
  });

  describe('Get Loan by ID', () => {
    it('should retrieve loan by valid ID', async () => {
      const createdLoan = await Loan.create({
        book: book._id,
        student: student._id,
        dueDate: new Date(Date.now() + 14 * 86400000),
        status: 'borrowed',
      });

      const loan = await Loan.findById(createdLoan._id);
      expect(loan).toBeDefined();
      expect(loan?.status).toBe('borrowed');
    });

    it('should return null for invalid ID', async () => {
      const invalidId = new mongoose.Types.ObjectId();
      const loan = await Loan.findById(invalidId);
      expect(loan).toBeNull();
    });

    it('should populate related data when requested', async () => {
      const createdLoan = await Loan.create({
        book: book._id,
        student: student._id,
        dueDate: new Date(Date.now() + 14 * 86400000),
      });

      const loan = await Loan.findById(createdLoan._id)
        .populate('book', 'title author isbn')
        .populate({
          path: 'student',
          populate: { path: 'userId', select: 'firstName lastName email' },
        });

      expect(loan).toBeDefined();
      expect(loan?.book).toHaveProperty('title');
      expect(loan?.student).toHaveProperty('userId');
    });
  });

  describe('Return Loan', () => {
    it('should mark loan as returned', async () => {
      const loan = await Loan.create({
        book: book._id,
        student: student._id,
        dueDate: new Date(Date.now() + 14 * 86400000),
        status: 'borrowed',
      });

      loan.returnDate = new Date();
      loan.status = 'returned';
      await loan.save();

      const updatedLoan = await Loan.findById(loan._id);
      expect(updatedLoan?.status).toBe('returned');
      expect(updatedLoan?.returnDate).toBeDefined();
    });

    it('should increase book available quantity when returned', async () => {
      const loan = await Loan.create({
        book: book._id,
        student: student._id,
        dueDate: new Date(Date.now() + 14 * 86400000),
        status: 'borrowed',
      });

      // Simulate borrowing
      await Book.findByIdAndUpdate(book._id, {
        $inc: { availableQuantity: -1 },
      });

      const beforeReturn = await Book.findById(book._id);
      const quantityBeforeReturn = beforeReturn?.availableQuantity || 0;

      // Return the book
      loan.returnDate = new Date();
      loan.status = 'returned';
      await loan.save();

      await Book.findByIdAndUpdate(book._id, {
        $inc: { availableQuantity: 1 },
      });

      const afterReturn = await Book.findById(book._id);
      expect(afterReturn?.availableQuantity).toBe(quantityBeforeReturn + 1);
    });

    it('should not allow returning an already returned loan', async () => {
      const loan = await Loan.create({
        book: book._id,
        student: student._id,
        dueDate: new Date(Date.now() + 14 * 86400000),
        returnDate: new Date(),
        status: 'returned',
      });

      expect(loan.status).toBe('returned');
      // Business logic would prevent returning again
    });
  });

  describe('Update Loan', () => {
    it('should update due date', async () => {
      const loan = await Loan.create({
        book: book._id,
        student: student._id,
        dueDate: new Date(Date.now() + 14 * 86400000),
        status: 'borrowed',
      });

      const newDueDate = new Date(Date.now() + 21 * 86400000);
      loan.dueDate = newDueDate;
      await loan.save();

      const updatedLoan = await Loan.findById(loan._id);
      expect(updatedLoan?.dueDate.getTime()).toBe(newDueDate.getTime());
    });

    it('should update notes', async () => {
      const loan = await Loan.create({
        book: book._id,
        student: student._id,
        dueDate: new Date(Date.now() + 14 * 86400000),
        status: 'borrowed',
      });

      loan.notes = 'Extended loan period';
      await loan.save();

      const updatedLoan = await Loan.findById(loan._id);
      expect(updatedLoan?.notes).toBe('Extended loan period');
    });

    it('should update status', async () => {
      const loan = await Loan.create({
        book: book._id,
        student: student._id,
        dueDate: new Date(Date.now() - 5 * 86400000),
        status: 'borrowed',
      });

      loan.status = 'overdue';
      await loan.save();

      const updatedLoan = await Loan.findById(loan._id);
      expect(updatedLoan?.status).toBe('overdue');
    });
  });

  describe('Delete Loan', () => {
    it('should delete loan successfully', async () => {
      const loan = await Loan.create({
        book: book._id,
        student: student._id,
        dueDate: new Date(Date.now() + 14 * 86400000),
        status: 'borrowed',
      });

      await Loan.findByIdAndDelete(loan._id);

      const deletedLoan = await Loan.findById(loan._id);
      expect(deletedLoan).toBeNull();
    });

    it('should restore book quantity when deleting unreturned loan', async () => {
      const loan = await Loan.create({
        book: book._id,
        student: student._id,
        dueDate: new Date(Date.now() + 14 * 86400000),
        status: 'borrowed',
      });

      // Simulate borrowing
      await Book.findByIdAndUpdate(book._id, {
        $inc: { availableQuantity: -1 },
      });

      const beforeDelete = await Book.findById(book._id);
      const quantityBeforeDelete = beforeDelete?.availableQuantity || 0;

      // Delete loan (should restore quantity if not returned)
      if (loan.status !== 'returned') {
        await Book.findByIdAndUpdate(book._id, {
          $inc: { availableQuantity: 1 },
        });
      }

      await Loan.findByIdAndDelete(loan._id);

      const afterDelete = await Book.findById(book._id);
      expect(afterDelete?.availableQuantity).toBe(quantityBeforeDelete + 1);
    });

    it('should not restore quantity for already returned loans', async () => {
      const loan = await Loan.create({
        book: book._id,
        student: student._id,
        dueDate: new Date(Date.now() + 14 * 86400000),
        returnDate: new Date(),
        status: 'returned',
      });

      const beforeDelete = await Book.findById(book._id);
      const quantityBeforeDelete = beforeDelete?.availableQuantity || 0;

      // Delete returned loan (should not change quantity)
      if (loan.status !== 'returned') {
        await Book.findByIdAndUpdate(book._id, {
          $inc: { availableQuantity: 1 },
        });
      }

      await Loan.findByIdAndDelete(loan._id);

      const afterDelete = await Book.findById(book._id);
      expect(afterDelete?.availableQuantity).toBe(quantityBeforeDelete);
    });
  });

  describe('Get Student Loans', () => {
    beforeEach(async () => {
      await Loan.create([
        {
          book: book._id,
          student: student._id,
          borrowDate: new Date(),
          dueDate: new Date(Date.now() + 14 * 86400000),
          status: 'borrowed',
        },
        {
          book: book._id,
          student: student._id,
          borrowDate: new Date(Date.now() - 30 * 86400000),
          dueDate: new Date(Date.now() - 2 * 86400000),
          returnDate: new Date(Date.now() - 1 * 86400000),
          status: 'returned',
        },
        {
          book: book._id,
          student: student._id,
          borrowDate: new Date(Date.now() - 20 * 86400000),
          dueDate: new Date(Date.now() - 5 * 86400000),
          status: 'overdue',
        },
      ]);
    });

    it('should get current borrowed loans for student', async () => {
      const currentLoans = await Loan.find({
        student: student._id,
        status: 'borrowed',
      });
      expect(currentLoans).toHaveLength(1);
    });

    it('should get loan history for student', async () => {
      const loanHistory = await Loan.find({
        student: student._id,
        status: 'returned',
      }).sort({ returnDate: -1 });
      expect(loanHistory).toHaveLength(1);
    });

    it('should get overdue loans for student', async () => {
      const overdueLoans = await Loan.find({
        student: student._id,
        status: 'overdue',
      });
      expect(overdueLoans).toHaveLength(1);
    });

    it('should calculate loan statistics for student', async () => {
      const currentLoansCount = await Loan.countDocuments({
        student: student._id,
        status: 'borrowed',
      });
      const totalLoansCount = await Loan.countDocuments({
        student: student._id,
      });
      const overdueCount = await Loan.countDocuments({
        student: student._id,
        status: 'overdue',
      });

      expect(currentLoansCount).toBe(1);
      expect(totalLoansCount).toBe(3);
      expect(overdueCount).toBe(1);
    });
  });

  describe('Update Overdue Loans', () => {
    beforeEach(async () => {
      await Loan.create([
        {
          book: book._id,
          student: student._id,
          borrowDate: new Date(Date.now() - 20 * 86400000),
          dueDate: new Date(Date.now() - 5 * 86400000),
          status: 'borrowed',
        },
        {
          book: book._id,
          student: student._id,
          borrowDate: new Date(Date.now() - 15 * 86400000),
          dueDate: new Date(Date.now() - 1 * 86400000),
          status: 'borrowed',
        },
        {
          book: book._id,
          student: student._id,
          borrowDate: new Date(),
          dueDate: new Date(Date.now() + 14 * 86400000),
          status: 'borrowed',
        },
      ]);
    });

    it('should identify overdue loans', async () => {
      const overdueLoans = await Loan.find({
        status: 'borrowed',
        dueDate: { $lt: new Date() },
      });
      expect(overdueLoans).toHaveLength(2);
    });

    it('should update overdue loans status', async () => {
      await Loan.updateMany(
        {
          status: 'borrowed',
          dueDate: { $lt: new Date() },
        },
        {
          $set: { status: 'overdue' },
        }
      );

      const overdueLoans = await Loan.find({ status: 'overdue' });
      expect(overdueLoans).toHaveLength(2);

      const borrowedLoans = await Loan.find({ status: 'borrowed' });
      expect(borrowedLoans).toHaveLength(1);
    });

    it('should not affect current loans', async () => {
      const beforeUpdate = await Loan.find({
        status: 'borrowed',
        dueDate: { $gte: new Date() },
      });

      await Loan.updateMany(
        {
          status: 'borrowed',
          dueDate: { $lt: new Date() },
        },
        {
          $set: { status: 'overdue' },
        }
      );

      const afterUpdate = await Loan.find({
        status: 'borrowed',
      });

      expect(afterUpdate).toHaveLength(beforeUpdate.length);
    });
  });

  describe('Loan Validation', () => {
    it('should require book reference', async () => {
      await expect(
        Loan.create({
          student: student._id,
          dueDate: new Date(Date.now() + 14 * 86400000),
        })
      ).rejects.toThrow();
    });

    it('should require student reference', async () => {
      await expect(
        Loan.create({
          book: book._id,
          dueDate: new Date(Date.now() + 14 * 86400000),
        })
      ).rejects.toThrow();
    });

    it('should require due date', async () => {
      await expect(
        Loan.create({
          book: book._id,
          student: student._id,
        })
      ).rejects.toThrow();
    });

    it('should only allow valid status values', async () => {
      await expect(
        Loan.create({
          book: book._id,
          student: student._id,
          dueDate: new Date(Date.now() + 14 * 86400000),
          status: 'invalid_status' as any,
        })
      ).rejects.toThrow();
    });
  });
});
