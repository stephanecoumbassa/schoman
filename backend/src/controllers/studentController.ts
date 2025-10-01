import { Response } from 'express';
import Student from '../models/Student';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

export const createStudent = async (req: AuthRequest, res: Response) => {
  try {
    const { 
      email, password, firstName, lastName, 
      studentNumber, dateOfBirth, placeOfBirth, gender,
      level, parentContact, emergencyContact, medicalInfo, notes 
    } = req.body;

    // Create user account for student
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      role: 'student',
    });
    await user.save();

    // Create student profile
    const student = new Student({
      userId: user._id,
      studentNumber,
      dateOfBirth,
      placeOfBirth,
      gender,
      level,
      parentContact,
      emergencyContact,
      medicalInfo,
      notes,
    });
    await student.save();

    res.status(201).json({
      message: 'Élève créé avec succès',
      student: await student.populate('userId', '-password'),
    });
  } catch (error: any) {
    console.error('Erreur lors de la création de l\'élève:', error);
    res.status(500).json({ message: 'Erreur lors de la création de l\'élève', error: error.message });
  }
};

export const getStudents = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 10, search, level, isActive } = req.query;

    const query: any = {};
    
    if (search) {
      const users = await User.find({
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
        role: 'student',
      }).select('_id');
      
      const userIds = users.map(u => u._id);
      query.userId = { $in: userIds };
    }

    if (level) query.level = level;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const students = await Student.find(query)
      .populate('userId', '-password')
      .populate('class')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const total = await Student.countDocuments(query);

    res.json({
      students,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    console.error('Erreur lors de la récupération des élèves:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des élèves', error: error.message });
  }
};

export const getStudent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const student = await Student.findById(id)
      .populate('userId', '-password')
      .populate('class');

    if (!student) {
      return res.status(404).json({ message: 'Élève non trouvé' });
    }

    res.json({ student });
  } catch (error: any) {
    console.error('Erreur lors de la récupération de l\'élève:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'élève', error: error.message });
  }
};

export const updateStudent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ message: 'Élève non trouvé' });
    }

    // Update user info if provided
    if (updates.firstName || updates.lastName || updates.email || updates.phone || updates.address) {
      await User.findByIdAndUpdate(student.userId, {
        firstName: updates.firstName,
        lastName: updates.lastName,
        email: updates.email,
        phone: updates.phone,
        address: updates.address,
      });
    }

    // Update student info
    Object.assign(student, {
      dateOfBirth: updates.dateOfBirth,
      placeOfBirth: updates.placeOfBirth,
      gender: updates.gender,
      level: updates.level,
      class: updates.class,
      parentContact: updates.parentContact,
      emergencyContact: updates.emergencyContact,
      medicalInfo: updates.medicalInfo,
      notes: updates.notes,
      isActive: updates.isActive,
    });

    await student.save();

    res.json({
      message: 'Élève mis à jour avec succès',
      student: await student.populate('userId', '-password'),
    });
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour de l\'élève:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'élève', error: error.message });
  }
};

export const deleteStudent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ message: 'Élève non trouvé' });
    }

    // Soft delete - deactivate instead of removing
    student.isActive = false;
    await student.save();

    // Also deactivate user account
    await User.findByIdAndUpdate(student.userId, { isActive: false });

    res.json({ message: 'Élève désactivé avec succès' });
  } catch (error: any) {
    console.error('Erreur lors de la suppression de l\'élève:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'élève', error: error.message });
  }
};
