import { Request, Response } from 'express';
import SchoolYear from '../models/SchoolYear.js';
import Class from '../models/Class.js';
import Student from '../models/Student.js';
import Grade from '../models/Grade.js';
import Attendance from '../models/Attendance.js';
import Invoice from '../models/Invoice.js';
import logger from '../utils/logger.js';

// @desc    Get all school years
// @route   GET /api/school-years
// @access  Private
export const getSchoolYears = async (req: Request, res: Response) => {
  try {
    const { status, school } = req.query;
    const filter: any = {};

    if (status) {
      filter.status = status;
    }
    if (school) {
      filter.school = school;
    }

    const schoolYears = await SchoolYear.find(filter)
      .populate('school', 'name')
      .sort({ startDate: -1 });

    res.json({
      success: true,
      count: schoolYears.length,
      data: schoolYears,
    });
  } catch (error: any) {
    logger.error('Error fetching school years:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching school years',
      error: error.message,
    });
  }
};

// @desc    Get current school year
// @route   GET /api/school-years/current
// @access  Private
export const getCurrentSchoolYear = async (req: Request, res: Response) => {
  try {
    const { school } = req.query;
    const filter: any = { isCurrent: true };

    if (school) {
      filter.school = school;
    }

    const schoolYear = await SchoolYear.findOne(filter).populate('school', 'name');

    if (!schoolYear) {
      return res.status(404).json({
        success: false,
        message: 'No current school year found',
      });
    }

    res.json({
      success: true,
      data: schoolYear,
    });
  } catch (error: any) {
    logger.error('Error fetching current school year:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching current school year',
      error: error.message,
    });
  }
};

// @desc    Get single school year
// @route   GET /api/school-years/:id
// @access  Private
export const getSchoolYear = async (req: Request, res: Response) => {
  try {
    const schoolYear = await SchoolYear.findById(req.params.id).populate('school', 'name');

    if (!schoolYear) {
      return res.status(404).json({
        success: false,
        message: 'School year not found',
      });
    }

    // Get statistics for this school year
    const [classCount, studentCount, gradeCount, attendanceCount, invoiceCount] = await Promise.all([
      Class.countDocuments({ schoolYear: schoolYear._id }),
      Student.countDocuments({ 'enrollmentHistory.schoolYear': schoolYear._id }),
      Grade.countDocuments({ schoolYear: schoolYear._id }),
      Attendance.countDocuments({ schoolYear: schoolYear._id }),
      Invoice.countDocuments({ schoolYear: schoolYear._id }),
    ]);

    res.json({
      success: true,
      data: {
        ...schoolYear.toObject(),
        statistics: {
          classes: classCount,
          students: studentCount,
          grades: gradeCount,
          attendances: attendanceCount,
          invoices: invoiceCount,
        },
      },
    });
  } catch (error: any) {
    logger.error('Error fetching school year:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching school year',
      error: error.message,
    });
  }
};

// @desc    Create new school year
// @route   POST /api/school-years
// @access  Private (Admin only)
export const createSchoolYear = async (req: Request, res: Response) => {
  try {
    const { name, startDate, endDate, isCurrent, status, school, description } = req.body;

    // Validate dates
    if (new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date',
      });
    }

    // Check for overlapping school years
    const overlapping = await SchoolYear.findOne({
      school: school || null,
      $or: [
        { startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } },
      ],
    });

    if (overlapping) {
      return res.status(400).json({
        success: false,
        message: 'School year overlaps with existing year',
      });
    }

    const schoolYear = await SchoolYear.create({
      name,
      startDate,
      endDate,
      isCurrent,
      status,
      school,
      description,
    });

    logger.info(`School year created: ${schoolYear.name}`);

    res.status(201).json({
      success: true,
      data: schoolYear,
    });
  } catch (error: any) {
    logger.error('Error creating school year:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating school year',
      error: error.message,
    });
  }
};

// @desc    Update school year
// @route   PUT /api/school-years/:id
// @access  Private (Admin only)
export const updateSchoolYear = async (req: Request, res: Response) => {
  try {
    const schoolYear = await SchoolYear.findById(req.params.id);

    if (!schoolYear) {
      return res.status(404).json({
        success: false,
        message: 'School year not found',
      });
    }

    const { name, startDate, endDate, isCurrent, status, description } = req.body;

    // Validate dates if both are provided
    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date',
      });
    }

    Object.assign(schoolYear, {
      name: name || schoolYear.name,
      startDate: startDate || schoolYear.startDate,
      endDate: endDate || schoolYear.endDate,
      isCurrent: isCurrent !== undefined ? isCurrent : schoolYear.isCurrent,
      status: status || schoolYear.status,
      description: description !== undefined ? description : schoolYear.description,
    });

    await schoolYear.save();

    logger.info(`School year updated: ${schoolYear.name}`);

    res.json({
      success: true,
      data: schoolYear,
    });
  } catch (error: any) {
    logger.error('Error updating school year:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating school year',
      error: error.message,
    });
  }
};

// @desc    Delete school year
// @route   DELETE /api/school-years/:id
// @access  Private (Admin only)
export const deleteSchoolYear = async (req: Request, res: Response) => {
  try {
    const schoolYear = await SchoolYear.findById(req.params.id);

    if (!schoolYear) {
      return res.status(404).json({
        success: false,
        message: 'School year not found',
      });
    }

    // Check if school year has associated data
    const [classCount, gradeCount, attendanceCount, invoiceCount] = await Promise.all([
      Class.countDocuments({ schoolYear: schoolYear._id }),
      Grade.countDocuments({ schoolYear: schoolYear._id }),
      Attendance.countDocuments({ schoolYear: schoolYear._id }),
      Invoice.countDocuments({ schoolYear: schoolYear._id }),
    ]);

    if (classCount > 0 || gradeCount > 0 || attendanceCount > 0 || invoiceCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete school year with associated data. Archive it instead.',
      });
    }

    await schoolYear.deleteOne();

    logger.info(`School year deleted: ${schoolYear.name}`);

    res.json({
      success: true,
      message: 'School year deleted successfully',
    });
  } catch (error: any) {
    logger.error('Error deleting school year:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting school year',
      error: error.message,
    });
  }
};

// @desc    Set current school year
// @route   PUT /api/school-years/:id/set-current
// @access  Private (Admin only)
export const setCurrentSchoolYear = async (req: Request, res: Response) => {
  try {
    const schoolYear = await SchoolYear.findById(req.params.id);

    if (!schoolYear) {
      return res.status(404).json({
        success: false,
        message: 'School year not found',
      });
    }

    schoolYear.isCurrent = true;
    schoolYear.status = 'active';
    await schoolYear.save();

    logger.info(`Current school year set to: ${schoolYear.name}`);

    res.json({
      success: true,
      data: schoolYear,
      message: 'Current school year updated successfully',
    });
  } catch (error: any) {
    logger.error('Error setting current school year:', error);
    res.status(500).json({
      success: false,
      message: 'Error setting current school year',
      error: error.message,
    });
  }
};

// @desc    Close school year (archive)
// @route   PUT /api/school-years/:id/close
// @access  Private (Admin only)
export const closeSchoolYear = async (req: Request, res: Response) => {
  try {
    const schoolYear = await SchoolYear.findById(req.params.id);

    if (!schoolYear) {
      return res.status(404).json({
        success: false,
        message: 'School year not found',
      });
    }

    if (schoolYear.status === 'archived') {
      return res.status(400).json({
        success: false,
        message: 'School year is already archived',
      });
    }

    schoolYear.status = 'archived';
    schoolYear.isCurrent = false;
    await schoolYear.save();

    logger.info(`School year closed: ${schoolYear.name}`);

    res.json({
      success: true,
      data: schoolYear,
      message: 'School year closed successfully',
    });
  } catch (error: any) {
    logger.error('Error closing school year:', error);
    res.status(500).json({
      success: false,
      message: 'Error closing school year',
      error: error.message,
    });
  }
};

// @desc    Promote students to next level
// @route   POST /api/school-years/:id/promote-students
// @access  Private (Admin only)
export const promoteStudents = async (req: Request, res: Response) => {
  try {
    const { studentIds, targetClassId, targetLevel, newSchoolYearId } = req.body;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Student IDs array is required',
      });
    }

    if (!targetClassId || !targetLevel || !newSchoolYearId) {
      return res.status(400).json({
        success: false,
        message: 'Target class, level, and new school year are required',
      });
    }

    const targetClass = await Class.findById(targetClassId);
    if (!targetClass) {
      return res.status(404).json({
        success: false,
        message: 'Target class not found',
      });
    }

    const newSchoolYear = await SchoolYear.findById(newSchoolYearId);
    if (!newSchoolYear) {
      return res.status(404).json({
        success: false,
        message: 'New school year not found',
      });
    }

    const promotedStudents = [];

    for (const studentId of studentIds) {
      const student = await Student.findById(studentId);
      if (student) {
        // Update current class and level
        student.class = targetClassId;
        student.level = targetLevel;

        // Add to enrollment history
        if (!student.enrollmentHistory) {
          student.enrollmentHistory = [];
        }
        student.enrollmentHistory.push({
          schoolYear: newSchoolYearId,
          class: targetClassId,
          level: targetLevel,
          enrolledAt: new Date(),
        } as any);

        await student.save();
        promotedStudents.push(student);
      }
    }

    logger.info(`Promoted ${promotedStudents.length} students to ${targetLevel}`);

    res.json({
      success: true,
      message: `Successfully promoted ${promotedStudents.length} students`,
      data: {
        promotedCount: promotedStudents.length,
        targetClass: targetClass.name,
        targetLevel,
        schoolYear: newSchoolYear.name,
      },
    });
  } catch (error: any) {
    logger.error('Error promoting students:', error);
    res.status(500).json({
      success: false,
      message: 'Error promoting students',
      error: error.message,
    });
  }
};

// @desc    Get school year statistics
// @route   GET /api/school-years/:id/statistics
// @access  Private
export const getSchoolYearStatistics = async (req: Request, res: Response) => {
  try {
    const schoolYear = await SchoolYear.findById(req.params.id);

    if (!schoolYear) {
      return res.status(404).json({
        success: false,
        message: 'School year not found',
      });
    }

    const [
      totalClasses,
      totalStudents,
      totalGrades,
      totalAttendances,
      totalInvoices,
      activeClasses,
      activeStudents,
    ] = await Promise.all([
      Class.countDocuments({ schoolYear: schoolYear._id }),
      Student.countDocuments({ 'enrollmentHistory.schoolYear': schoolYear._id }),
      Grade.countDocuments({ schoolYear: schoolYear._id }),
      Attendance.countDocuments({ schoolYear: schoolYear._id }),
      Invoice.countDocuments({ schoolYear: schoolYear._id }),
      Class.countDocuments({ schoolYear: schoolYear._id, isActive: true }),
      Student.countDocuments({
        'enrollmentHistory.schoolYear': schoolYear._id,
        isActive: true,
      }),
    ]);

    res.json({
      success: true,
      data: {
        schoolYear: {
          id: schoolYear._id,
          name: schoolYear.name,
          status: schoolYear.status,
          isCurrent: schoolYear.isCurrent,
        },
        statistics: {
          classes: {
            total: totalClasses,
            active: activeClasses,
          },
          students: {
            total: totalStudents,
            active: activeStudents,
          },
          grades: totalGrades,
          attendances: totalAttendances,
          invoices: totalInvoices,
        },
      },
    });
  } catch (error: any) {
    logger.error('Error fetching school year statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching school year statistics',
      error: error.message,
    });
  }
};
