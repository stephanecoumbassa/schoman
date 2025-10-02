import { Response } from 'express';
import Grade from '../models/Grade.js';
import Student from '../models/Student.js';
import Class from '../models/Class.js';
import { AuthRequest } from '../middleware/auth.js';

export const createGrade = async (req: AuthRequest, res: Response) => {
  try {
    const { 
      student, subject, class: classId, evaluationType, 
      grade, maxGrade, coefficient, date, academicYear, 
      semester, comments 
    } = req.body;

    // Verify student exists
    const studentExists = await Student.findById(student);
    if (!studentExists) {
      return res.status(404).json({ message: 'Élève non trouvé' });
    }

    // Verify class exists
    const classExists = await Class.findById(classId);
    if (!classExists) {
      return res.status(404).json({ message: 'Classe non trouvée' });
    }

    // Verify grade is not greater than maxGrade
    if (grade > maxGrade) {
      return res.status(400).json({ message: 'La note ne peut pas être supérieure à la note maximale' });
    }

    const newGrade = await Grade.create({
      student,
      subject,
      class: classId,
      evaluationType,
      grade,
      maxGrade: maxGrade || 20,
      coefficient: coefficient || 1,
      date: date || new Date(),
      academicYear,
      semester,
      comments,
      teacher: req.user!.id,
    });

    await newGrade.populate([
      { path: 'student', select: 'userId', populate: { path: 'userId', select: 'firstName lastName' } },
      { path: 'class', select: 'name level' },
      { path: 'teacher', select: 'firstName lastName' },
    ]);
    
    res.status(201).json({
      message: 'Note créée avec succès',
      grade: newGrade,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la création de la note', error: error.message });
  }
};

export const getGrades = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    const skip = (page - 1) * limit;

    const query: any = {};
    
    // Filter by student
    if (req.query.student) {
      query.student = req.query.student;
    }

    // Filter by class
    if (req.query.class) {
      query.class = req.query.class;
    }

    // Filter by subject
    if (req.query.subject) {
      query.subject = req.query.subject;
    }

    // Filter by academic year
    if (req.query.academicYear) {
      query.academicYear = req.query.academicYear;
    }

    // Filter by semester
    if (req.query.semester) {
      query.semester = req.query.semester;
    }

    const total = await Grade.countDocuments(query);
    const grades = await Grade.find(query)
      .populate('student', 'userId')
      .populate('class', 'name level')
      .populate('teacher', 'firstName lastName')
      .sort({ date: -1 })
      .limit(limit)
      .skip(skip);

    // Populate nested userId in student
    await Student.populate(grades, { path: 'student.userId', select: 'firstName lastName' });

    res.json({
      grades,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la récupération des notes', error: error.message });
  }
};

export const getGrade = async (req: AuthRequest, res: Response) => {
  try {
    const grade = await Grade.findById(req.params.id)
      .populate('student', 'userId')
      .populate('class', 'name level')
      .populate('teacher', 'firstName lastName');

    if (!grade) {
      return res.status(404).json({ message: 'Note non trouvée' });
    }

    // Populate nested userId in student
    await Student.populate(grade, { path: 'student.userId', select: 'firstName lastName email' });

    res.json({ grade });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la récupération de la note', error: error.message });
  }
};

export const updateGrade = async (req: AuthRequest, res: Response) => {
  try {
    const { 
      grade, maxGrade, coefficient, evaluationType,
      date, comments 
    } = req.body;

    // Verify grade is not greater than maxGrade
    if (maxGrade && grade > maxGrade) {
      return res.status(400).json({ message: 'La note ne peut pas être supérieure à la note maximale' });
    }

    const updatedGrade = await Grade.findByIdAndUpdate(
      req.params.id,
      {
        grade,
        maxGrade,
        coefficient,
        evaluationType,
        date,
        comments,
      },
      { new: true, runValidators: true }
    ).populate([
      { path: 'student', select: 'userId', populate: { path: 'userId', select: 'firstName lastName' } },
      { path: 'class', select: 'name level' },
      { path: 'teacher', select: 'firstName lastName' },
    ]);

    if (!updatedGrade) {
      return res.status(404).json({ message: 'Note non trouvée' });
    }

    res.json({
      message: 'Note mise à jour avec succès',
      grade: updatedGrade,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la note', error: error.message });
  }
};

export const deleteGrade = async (req: AuthRequest, res: Response) => {
  try {
    const grade = await Grade.findByIdAndDelete(req.params.id);

    if (!grade) {
      return res.status(404).json({ message: 'Note non trouvée' });
    }

    res.json({
      message: 'Note supprimée avec succès',
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la suppression de la note', error: error.message });
  }
};

export const getStudentGradesSummary = async (req: AuthRequest, res: Response) => {
  try {
    const { studentId } = req.params;
    const { academicYear, semester } = req.query;

    const query: any = { student: studentId };
    if (academicYear) query.academicYear = academicYear;
    if (semester) query.semester = semester;

    const grades = await Grade.find(query)
      .populate('class', 'name level')
      .populate('teacher', 'firstName lastName')
      .sort({ subject: 1, date: -1 });

    // Calculate average by subject
    const subjectAverages: { [key: string]: { sum: number; count: number; grades: any[] } } = {};
    
    grades.forEach(grade => {
      if (!subjectAverages[grade.subject]) {
        subjectAverages[grade.subject] = { sum: 0, count: 0, grades: [] };
      }
      const normalizedGrade = (grade.grade / grade.maxGrade) * 20 * grade.coefficient;
      subjectAverages[grade.subject].sum += normalizedGrade;
      subjectAverages[grade.subject].count += grade.coefficient;
      subjectAverages[grade.subject].grades.push(grade);
    });

    const summary = Object.entries(subjectAverages).map(([subject, data]) => ({
      subject,
      average: (data.sum / data.count).toFixed(2),
      gradesCount: data.grades.length,
      grades: data.grades,
    }));

    // Calculate overall average
    let totalSum = 0;
    let totalCoeff = 0;
    Object.values(subjectAverages).forEach(data => {
      totalSum += data.sum;
      totalCoeff += data.count;
    });
    const overallAverage = totalCoeff > 0 ? (totalSum / totalCoeff).toFixed(2) : '0.00';

    res.json({
      summary,
      overallAverage,
      totalGrades: grades.length,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur lors de la récupération du bulletin', error: error.message });
  }
};
