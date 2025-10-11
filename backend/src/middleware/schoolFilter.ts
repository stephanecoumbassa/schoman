import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

/**
 * Middleware to automatically filter queries by school
 * Adds school filter to queries based on authenticated user's school
 * 
 * Usage: Add this middleware after the auth middleware
 * It will add req.schoolId to the request object
 */
export const schoolFilter = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // If user has a school assigned, add it to the request
    if (req.user && req.user.school) {
      req.schoolId = req.user.school;
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to add school to query parameters
 * This will automatically filter GET requests by school
 */
export const addSchoolToQuery = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Only apply to GET requests
    if (req.method === 'GET' && req.schoolId) {
      // Add school to query params if not already present
      if (!req.query.school) {
        req.query.school = req.schoolId.toString();
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to add school to request body
 * This will automatically add school to POST/PUT requests
 */
export const addSchoolToBody = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Only apply to POST and PUT requests
    if ((req.method === 'POST' || req.method === 'PUT') && req.schoolId) {
      // Add school to body if not already present
      if (!req.body.school) {
        req.body.school = req.schoolId;
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Combined middleware that applies all school filters
 */
export const applySchoolFilter = [schoolFilter, addSchoolToQuery, addSchoolToBody];

export default {
  schoolFilter,
  addSchoolToQuery,
  addSchoolToBody,
  applySchoolFilter,
};
