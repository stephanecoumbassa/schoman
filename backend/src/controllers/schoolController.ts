import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import School from '../models/School';
import { ValidationError, NotFoundError, ConflictError } from '../utils/errors';
import logger from '../utils/logger';

// Get all schools
export const getSchools = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { isActive, search } = req.query;

    // Build query
    const query: any = {};
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
      ];
    }

    const schools = await School.find(query).sort({ createdAt: -1 });

    logger.info('Schools retrieved', { count: schools.length });
    res.json(schools);
  } catch (error) {
    next(error);
  }
};

// Get school by ID
export const getSchoolById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const school = await School.findById(req.params.id);
    
    if (!school) {
      throw new NotFoundError('School not found');
    }

    logger.info('School retrieved', { schoolId: school._id });
    res.json(school);
  } catch (error) {
    next(error);
  }
};

// Get school by code
export const getSchoolByCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const school = await School.findOne({ code: req.params.code.toUpperCase() });
    
    if (!school) {
      throw new NotFoundError('School not found');
    }

    logger.info('School retrieved by code', { schoolCode: school.code });
    res.json(school);
  } catch (error) {
    next(error);
  }
};

// Create new school
export const createSchool = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, code, address, city, country, phone, email, website, logo, director, academicYearStart, academicYearEnd, settings } = req.body;

    // Validate required fields
    if (!name || !code || !address || !city || !country || !phone || !email) {
      throw new ValidationError('All required fields must be provided');
    }

    // Check if school with same code exists
    const existingSchool = await School.findOne({ code: code.toUpperCase() });
    if (existingSchool) {
      throw new ConflictError('School with this code already exists');
    }

    const school = new School({
      name,
      code: code.toUpperCase(),
      address,
      city,
      country,
      phone,
      email,
      website,
      logo,
      director,
      academicYearStart,
      academicYearEnd,
      settings,
    });

    await school.save();
    logger.info('School created', { schoolId: school._id, code: school.code });
    res.status(201).json(school);
  } catch (error) {
    next(error);
  }
};

// Update school
export const updateSchool = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, address, city, country, phone, email, website, logo, director, academicYearStart, academicYearEnd, settings, isActive } = req.body;

    const school = await School.findById(req.params.id);
    if (!school) {
      throw new NotFoundError('School not found');
    }

    // Update fields
    if (name !== undefined) school.name = name;
    if (address !== undefined) school.address = address;
    if (city !== undefined) school.city = city;
    if (country !== undefined) school.country = country;
    if (phone !== undefined) school.phone = phone;
    if (email !== undefined) school.email = email;
    if (website !== undefined) school.website = website;
    if (logo !== undefined) school.logo = logo;
    if (director !== undefined) school.director = director;
    if (academicYearStart !== undefined) school.academicYearStart = academicYearStart;
    if (academicYearEnd !== undefined) school.academicYearEnd = academicYearEnd;
    if (settings !== undefined) school.settings = { ...school.settings, ...settings };
    if (isActive !== undefined) school.isActive = isActive;

    await school.save();
    logger.info('School updated', { schoolId: school._id });
    res.json(school);
  } catch (error) {
    next(error);
  }
};

// Delete school
export const deleteSchool = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const school = await School.findById(req.params.id);
    if (!school) {
      throw new NotFoundError('School not found');
    }

    // Soft delete by setting isActive to false
    school.isActive = false;
    await school.save();

    logger.info('School deleted (soft)', { schoolId: school._id });
    res.json({ message: 'School deleted successfully', school });
  } catch (error) {
    next(error);
  }
};

// Get school statistics
export const getSchoolStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schoolId = req.params.id;
    
    const school = await School.findById(schoolId);
    if (!school) {
      throw new NotFoundError('School not found');
    }

    // Import models dynamically to avoid circular dependencies
    const Student = (await import('../models/Student')).default;
    const User = (await import('../models/User')).default;
    const Class = (await import('../models/Class')).default;
    const Invoice = (await import('../models/Invoice')).default;

    // Get statistics
    const [
      totalStudents,
      totalTeachers,
      totalClasses,
      totalRevenue,
    ] = await Promise.all([
      Student.countDocuments({ school: schoolId, isActive: true }),
      User.countDocuments({ school: schoolId, role: 'teacher', isActive: true }),
      Class.countDocuments({ school: schoolId, isActive: true }),
      Invoice.aggregate([
        { $match: { school: new mongoose.Types.ObjectId(schoolId), status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
    ]);

    const stats = {
      school: {
        id: school._id,
        name: school.name,
        code: school.code,
      },
      statistics: {
        totalStudents,
        totalTeachers,
        totalClasses,
        totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
      },
    };

    logger.info('School statistics retrieved', { schoolId });
    res.json(stats);
  } catch (error) {
    next(error);
  }
};
