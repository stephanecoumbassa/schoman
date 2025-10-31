import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Book from '../../models/Book.js';

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
  await Book.deleteMany({});
});

describe('Book Controller', () => {
  describe('Create Book', () => {
    it('should create book with valid data', async () => {
      const bookData = {
        title: 'Introduction to TypeScript',
        author: 'John Doe',
        isbn: '978-3-16-148410-0',
        category: 'Technology',
        publisher: 'Tech Publisher',
        publishedYear: 2023,
        description: 'A comprehensive guide to TypeScript',
        totalQuantity: 5,
        location: 'Shelf A1',
      };

      const book = await Book.create(bookData);

      expect(book.title).toBe('Introduction to TypeScript');
      expect(book.author).toBe('John Doe');
      expect(book.isbn).toBe('978-3-16-148410-0');
      expect(book.category).toBe('Technology');
      expect(book.totalQuantity).toBe(5);
      expect(book.availableQuantity).toBe(5);
      expect(book.isActive).toBe(true);
    });

    it('should set default values for optional fields', async () => {
      const bookData = {
        title: 'Simple Book',
        author: 'Jane Doe',
        category: 'Fiction',
      };

      const book = await Book.create(bookData);

      expect(book.totalQuantity).toBe(1);
      expect(book.availableQuantity).toBe(1);
      expect(book.isActive).toBe(true);
    });

    it('should fail when required fields are missing', async () => {
      const bookData = {
        author: 'John Doe',
        category: 'Technology',
      };

      await expect(Book.create(bookData)).rejects.toThrow();
    });

    it('should fail when quantities are negative', async () => {
      const bookData = {
        title: 'Test Book',
        author: 'Test Author',
        category: 'Test',
        totalQuantity: -1,
      };

      await expect(Book.create(bookData)).rejects.toThrow();
    });
  });

  describe('Get Books', () => {
    beforeEach(async () => {
      await Book.create([
        {
          title: 'TypeScript Basics',
          author: 'Author A',
          category: 'Technology',
          totalQuantity: 5,
          availableQuantity: 3,
          isActive: true,
        },
        {
          title: 'JavaScript Fundamentals',
          author: 'Author B',
          category: 'Technology',
          totalQuantity: 3,
          availableQuantity: 0,
          isActive: true,
        },
        {
          title: 'Python Programming',
          author: 'Author C',
          category: 'Programming',
          totalQuantity: 4,
          availableQuantity: 4,
          isActive: true,
        },
        {
          title: 'Old Book',
          author: 'Author D',
          category: 'History',
          totalQuantity: 2,
          availableQuantity: 2,
          isActive: false,
        },
      ]);
    });

    it('should retrieve all active books', async () => {
      const books = await Book.find({ isActive: true });
      expect(books).toHaveLength(3);
    });

    it('should filter books by category', async () => {
      const books = await Book.find({ category: 'Technology' });
      expect(books).toHaveLength(2);
    });

    it('should filter available books', async () => {
      const books = await Book.find({
        availableQuantity: { $gt: 0 },
        isActive: true,
      });
      expect(books).toHaveLength(2);
    });

    it('should search books by title', async () => {
      const books = await Book.find({
        title: { $regex: 'TypeScript', $options: 'i' },
      });
      expect(books).toHaveLength(1);
      expect(books[0].title).toBe('TypeScript Basics');
    });

    it('should search books by author', async () => {
      const books = await Book.find({
        author: { $regex: 'Author B', $options: 'i' },
      });
      expect(books).toHaveLength(1);
      expect(books[0].author).toBe('Author B');
    });
  });

  describe('Get Book by ID', () => {
    it('should retrieve book by valid ID', async () => {
      const createdBook = await Book.create({
        title: 'Test Book',
        author: 'Test Author',
        category: 'Test',
        totalQuantity: 2,
      });

      const book = await Book.findById(createdBook._id);
      expect(book).toBeDefined();
      expect(book?.title).toBe('Test Book');
    });

    it('should return null for invalid ID', async () => {
      const invalidId = new mongoose.Types.ObjectId();
      const book = await Book.findById(invalidId);
      expect(book).toBeNull();
    });
  });

  describe('Update Book', () => {
    it('should update book with valid data', async () => {
      const book = await Book.create({
        title: 'Original Title',
        author: 'Original Author',
        category: 'Original',
        totalQuantity: 3,
      });

      const updatedBook = await Book.findByIdAndUpdate(
        book._id,
        {
          title: 'Updated Title',
          author: 'Updated Author',
          totalQuantity: 5,
        },
        { new: true, runValidators: true }
      );

      expect(updatedBook?.title).toBe('Updated Title');
      expect(updatedBook?.author).toBe('Updated Author');
      expect(updatedBook?.totalQuantity).toBe(5);
    });

    it('should validate quantity constraints on update', async () => {
      const book = await Book.create({
        title: 'Test Book',
        author: 'Test Author',
        category: 'Test',
        totalQuantity: 3,
      });

      await expect(
        Book.findByIdAndUpdate(
          book._id,
          { totalQuantity: -1 },
          { new: true, runValidators: true }
        )
      ).rejects.toThrow();
    });

    it('should partially update book', async () => {
      const book = await Book.create({
        title: 'Original Title',
        author: 'Original Author',
        category: 'Original',
        totalQuantity: 3,
      });

      const updatedBook = await Book.findByIdAndUpdate(
        book._id,
        { description: 'New description' },
        { new: true }
      );

      expect(updatedBook?.title).toBe('Original Title');
      expect(updatedBook?.description).toBe('New description');
    });
  });

  describe('Delete Book (Soft Delete)', () => {
    it('should soft delete book by setting isActive to false', async () => {
      const book = await Book.create({
        title: 'Book to Delete',
        author: 'Test Author',
        category: 'Test',
        totalQuantity: 2,
      });

      const deletedBook = await Book.findByIdAndUpdate(
        book._id,
        { isActive: false },
        { new: true }
      );

      expect(deletedBook?.isActive).toBe(false);
      expect(deletedBook?.title).toBe('Book to Delete');
    });

    it('should keep deleted book in database', async () => {
      const book = await Book.create({
        title: 'Book to Delete',
        author: 'Test Author',
        category: 'Test',
        totalQuantity: 2,
      });

      await Book.findByIdAndUpdate(book._id, { isActive: false });

      const stillExists = await Book.findById(book._id);
      expect(stillExists).toBeDefined();
      expect(stillExists?.isActive).toBe(false);
    });
  });

  describe('Book Statistics', () => {
    beforeEach(async () => {
      await Book.create([
        {
          title: 'Book 1',
          author: 'Author A',
          category: 'Technology',
          totalQuantity: 5,
          availableQuantity: 3,
          isActive: true,
        },
        {
          title: 'Book 2',
          author: 'Author B',
          category: 'Technology',
          totalQuantity: 3,
          availableQuantity: 1,
          isActive: true,
        },
        {
          title: 'Book 3',
          author: 'Author C',
          category: 'Science',
          totalQuantity: 4,
          availableQuantity: 4,
          isActive: true,
        },
      ]);
    });

    it('should count total active books', async () => {
      const count = await Book.countDocuments({ isActive: true });
      expect(count).toBe(3);
    });

    it('should aggregate total copies', async () => {
      const result = await Book.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, total: { $sum: '$totalQuantity' } } },
      ]);
      expect(result[0].total).toBe(12);
    });

    it('should aggregate available copies', async () => {
      const result = await Book.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, total: { $sum: '$availableQuantity' } } },
      ]);
      expect(result[0].total).toBe(8);
    });

    it('should group books by category', async () => {
      const result = await Book.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]);
      expect(result).toHaveLength(2);
      expect(result[0]._id).toBe('Technology');
      expect(result[0].count).toBe(2);
    });
  });

  describe('Book Search and Filtering', () => {
    beforeEach(async () => {
      await Book.create([
        {
          title: 'Advanced TypeScript',
          author: 'John Smith',
          isbn: '978-1-23-456789-0',
          category: 'Technology',
          totalQuantity: 5,
          availableQuantity: 3,
        },
        {
          title: 'Basic JavaScript',
          author: 'Jane Doe',
          isbn: '978-1-23-456789-1',
          category: 'Technology',
          totalQuantity: 3,
          availableQuantity: 0,
        },
        {
          title: 'Python for Beginners',
          author: 'Bob Johnson',
          isbn: '978-1-23-456789-2',
          category: 'Programming',
          totalQuantity: 4,
          availableQuantity: 4,
        },
      ]);
    });

    it('should search by multiple criteria using $or', async () => {
      const books = await Book.find({
        $or: [
          { title: { $regex: 'TypeScript', $options: 'i' } },
          { author: { $regex: 'TypeScript', $options: 'i' } },
          { isbn: { $regex: 'TypeScript', $options: 'i' } },
        ],
      });
      expect(books).toHaveLength(1);
      expect(books[0].title).toBe('Advanced TypeScript');
    });

    it('should combine category filter with search', async () => {
      const books = await Book.find({
        category: 'Technology',
        title: { $regex: 'JavaScript', $options: 'i' },
      });
      expect(books).toHaveLength(1);
      expect(books[0].title).toBe('Basic JavaScript');
    });

    it('should filter by availability and category', async () => {
      const books = await Book.find({
        category: 'Technology',
        availableQuantity: { $gt: 0 },
      });
      expect(books).toHaveLength(1);
      expect(books[0].title).toBe('Advanced TypeScript');
    });
  });

  describe('Book Pagination', () => {
    beforeEach(async () => {
      const books = [];
      for (let i = 1; i <= 25; i++) {
        books.push({
          title: `Book ${i}`,
          author: `Author ${i}`,
          category: 'Test',
          totalQuantity: 1,
        });
      }
      await Book.create(books);
    });

    it('should paginate results correctly', async () => {
      const page = 2;
      const limit = 10;
      const skip = (page - 1) * limit;

      const books = await Book.find().skip(skip).limit(limit);
      expect(books).toHaveLength(10);
    });

    it('should calculate total pages correctly', async () => {
      const limit = 10;
      const total = await Book.countDocuments();
      const pages = Math.ceil(total / limit);
      expect(pages).toBe(3);
    });

    it('should handle last page with fewer items', async () => {
      const page = 3;
      const limit = 10;
      const skip = (page - 1) * limit;

      const books = await Book.find().skip(skip).limit(limit);
      expect(books).toHaveLength(5);
    });
  });
});
