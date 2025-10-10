import { Response } from 'express';
import Subject from '../models/Subject.js';
import { AuthRequest } from '../middleware/auth.js';

export const createSubject = async (req: AuthRequest, res: Response) => {
  try {
    const { name, code, description, level, defaultCoefficient, color } = req.body;

    // Check if subject with same code already exists
    const existingSubject = await Subject.findOne({ code });
    if (existingSubject) {
      return res.status(400).json({ message: 'Une matière avec ce code existe déjà' });
    }

    const newSubject = await Subject.create({
      name,
      code: code.toUpperCase(),
      description,
      level,
      defaultCoefficient: defaultCoefficient || 1,
      color,
      isActive: true,
    });

    res.status(201).json({
      message: 'Matière créée avec succès',
      subject: newSubject,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la création de la matière', error: error.message });
  }
};

export const getSubjects = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const skip = (page - 1) * limit;

    const query: any = {};

    // Filter by level
    if (req.query.level) {
      query.level = req.query.level;
    }

    // Filter by active status
    if (req.query.isActive !== undefined) {
      query.isActive = req.query.isActive === 'true';
    }

    // Search by name or code
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { code: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const total = await Subject.countDocuments(query);
    const subjects = await Subject.find(query)
      .sort({ level: 1, name: 1 })
      .limit(limit)
      .skip(skip);

    res.json({
      subjects,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la récupération des matières', error: error.message });
  }
};

export const getSubject = async (req: AuthRequest, res: Response) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({ message: 'Matière non trouvée' });
    }

    res.json({ subject });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la récupération de la matière', error: error.message });
  }
};

export const updateSubject = async (req: AuthRequest, res: Response) => {
  try {
    const { name, code, description, level, defaultCoefficient, color, isActive } = req.body;

    // If code is being updated, check if it's unique
    if (code) {
      const existingSubject = await Subject.findOne({ 
        code: code.toUpperCase(),
        _id: { $ne: req.params.id }
      });
      if (existingSubject) {
        return res.status(400).json({ message: 'Une matière avec ce code existe déjà' });
      }
    }

    const updatedSubject = await Subject.findByIdAndUpdate(
      req.params.id,
      {
        name,
        code: code ? code.toUpperCase() : undefined,
        description,
        level,
        defaultCoefficient,
        color,
        isActive,
      },
      { new: true, runValidators: true }
    );

    if (!updatedSubject) {
      return res.status(404).json({ message: 'Matière non trouvée' });
    }

    res.json({
      message: 'Matière mise à jour avec succès',
      subject: updatedSubject,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la matière', error: error.message });
  }
};

export const deleteSubject = async (req: AuthRequest, res: Response) => {
  try {
    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!subject) {
      return res.status(404).json({ message: 'Matière non trouvée' });
    }

    res.json({
      message: 'Matière désactivée avec succès',
      subject,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la désactivation de la matière', error: error.message });
  }
};

export const getSubjectsByLevel = async (req: AuthRequest, res: Response) => {
  try {
    const { level } = req.params;

    const subjects = await Subject.find({
      level,
      isActive: true,
    }).sort({ name: 1 });

    res.json({
      level,
      subjects,
      count: subjects.length,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la récupération des matières', error: error.message });
  }
};
