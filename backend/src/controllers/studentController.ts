import type { Response } from 'express';
import Student from '../models/Student.js';
import User from '../models/User.js';
import type { AuthRequest } from '../middleware/auth.js';

export const getStudents = async (req: AuthRequest, res: Response) => {
  try {
    const students = await Student.find()
      .populate('userId', 'firstName lastName email phone')
      .populate('classId', 'name level');
    
    res.json({ students });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la récupération des étudiants', error: error.message });
  }
};

export const getStudent = async (req: AuthRequest, res: Response) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('userId', 'firstName lastName email phone address')
      .populate('classId', 'name level');
    
    if (!student) {
      return res.status(404).json({ message: 'Étudiant non trouvé' });
    }

    res.json({ student });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'étudiant', error: error.message });
  }
};

export const createStudent = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, firstName, lastName, phone, address, dateOfBirth, gender, parentInfo, classId } = req.body;

    // Create user account for student
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      phone,
      address,
      role: 'student',
    });

    await user.save();

    // Generate student ID
    const studentCount = await Student.countDocuments();
    const studentId = `STD${String(studentCount + 1).padStart(5, '0')}`;

    // Create student record
    const student = new Student({
      userId: user._id,
      studentId,
      dateOfBirth,
      gender,
      parentInfo,
      classId,
    });

    await student.save();

    const populatedStudent = await Student.findById(student._id)
      .populate('userId', 'firstName lastName email phone address')
      .populate('classId', 'name level');

    res.status(201).json({
      message: 'Étudiant créé avec succès',
      student: populatedStudent,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la création de l\'étudiant', error: error.message });
  }
};

export const updateStudent = async (req: AuthRequest, res: Response) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('userId', 'firstName lastName email phone address')
      .populate('classId', 'name level');

    if (!student) {
      return res.status(404).json({ message: 'Étudiant non trouvé' });
    }

    res.json({ message: 'Étudiant mis à jour avec succès', student });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'étudiant', error: error.message });
  }
};

export const deleteStudent = async (req: AuthRequest, res: Response) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Étudiant non trouvé' });
    }

    // Optionally delete the associated user account
    await User.findByIdAndDelete(student.userId);

    res.json({ message: 'Étudiant supprimé avec succès' });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'étudiant', error: error.message });
  }
};
