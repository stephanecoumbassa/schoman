import { Response } from 'express';
import Student from '../models/Student';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

export const getStudents = async (req: AuthRequest, res: Response) => {
  try {
    const { schoolId } = req.query;
    const filter: any = {};
    
    if (schoolId) {
      filter.schoolId = schoolId;
    } else if (req.user?.schoolId) {
      filter.schoolId = req.user.schoolId;
    }

    const students = await Student.find(filter)
      .populate('userId', '-password')
      .populate('classId')
      .populate('parentId', '-password');

    res.json({ students });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getStudent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id)
      .populate('userId', '-password')
      .populate('classId')
      .populate('parentId', '-password');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ student });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createStudent = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, firstName, lastName, studentId, dateOfBirth, classId, parentId, medicalInfo, emergencyContact, schoolId } = req.body;

    // Create user account first
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      role: 'student',
      schoolId,
    });
    await user.save();

    // Create student profile
    const student = new Student({
      userId: user._id,
      studentId,
      dateOfBirth,
      classId,
      parentId,
      medicalInfo,
      emergencyContact,
      schoolId,
    });

    await student.save();

    const populatedStudent = await Student.findById(student._id)
      .populate('userId', '-password')
      .populate('classId');

    res.status(201).json({ message: 'Student created successfully', student: populatedStudent });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateStudent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const student = await Student.findByIdAndUpdate(id, updates, { new: true })
      .populate('userId', '-password')
      .populate('classId');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ message: 'Student updated successfully', student });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteStudent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Soft delete: deactivate user instead of deleting
    await User.findByIdAndUpdate(student.userId, { isActive: false });
    
    res.json({ message: 'Student deactivated successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
