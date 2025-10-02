import { Response } from 'express';
import Book from '../models/Book.js';
import { AuthRequest } from '../middleware/auth.js';

export const createBook = async (req: AuthRequest, res: Response) => {
  try {
    const { 
      title, author, isbn, category, publisher, 
      publishedYear, description, totalQuantity, location 
    } = req.body;

    const newBook = await Book.create({
      title,
      author,
      isbn,
      category,
      publisher,
      publishedYear,
      description,
      totalQuantity: totalQuantity || 1,
      availableQuantity: totalQuantity || 1,
      location,
      isActive: true,
    });

    res.status(201).json({
      message: 'Livre créé avec succès',
      book: newBook,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la création du livre', error: error.message });
  }
};

export const getBooks = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    const skip = (page - 1) * limit;

    const query: any = {};
    
    // Filter by category
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Filter by availability
    if (req.query.available === 'true') {
      query.availableQuantity = { $gt: 0 };
    }

    // Filter by active status
    if (req.query.isActive !== undefined) {
      query.isActive = req.query.isActive === 'true';
    }

    // Search by title, author, or ISBN
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { author: { $regex: req.query.search, $options: 'i' } },
        { isbn: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const total = await Book.countDocuments(query);
    const books = await Book.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({
      books,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la récupération des livres', error: error.message });
  }
};

export const getBook = async (req: AuthRequest, res: Response) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: 'Livre non trouvé' });
    }

    res.json({ book });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la récupération du livre', error: error.message });
  }
};

export const updateBook = async (req: AuthRequest, res: Response) => {
  try {
    const { 
      title, author, isbn, category, publisher, 
      publishedYear, description, totalQuantity, 
      availableQuantity, location, isActive 
    } = req.body;

    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Livre non trouvé' });
    }

    // Validate quantity logic
    if (totalQuantity !== undefined && availableQuantity !== undefined) {
      if (availableQuantity > totalQuantity) {
        return res.status(400).json({ 
          message: 'La quantité disponible ne peut pas dépasser la quantité totale' 
        });
      }
    }

    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      {
        title,
        author,
        isbn,
        category,
        publisher,
        publishedYear,
        description,
        totalQuantity,
        availableQuantity,
        location,
        isActive,
      },
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Livre mis à jour avec succès',
      book: updatedBook,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du livre', error: error.message });
  }
};

export const deleteBook = async (req: AuthRequest, res: Response) => {
  try {
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!book) {
      return res.status(404).json({ message: 'Livre non trouvé' });
    }

    res.json({
      message: 'Livre désactivé avec succès',
      book,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la désactivation du livre', error: error.message });
  }
};

export const getBookStatistics = async (req: AuthRequest, res: Response) => {
  try {
    const totalBooks = await Book.countDocuments({ isActive: true });
    const totalCopies = await Book.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: '$totalQuantity' } } }
    ]);
    const availableCopies = await Book.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: '$availableQuantity' } } }
    ]);
    const booksByCategory = await Book.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      totalBooks,
      totalCopies: totalCopies[0]?.total || 0,
      availableCopies: availableCopies[0]?.total || 0,
      borrowedCopies: (totalCopies[0]?.total || 0) - (availableCopies[0]?.total || 0),
      booksByCategory,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques', error: error.message });
  }
};
