import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import mongoose from 'mongoose';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    school?: mongoose.Types.ObjectId;
  };
  schoolId?: mongoose.Types.ObjectId;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Authentification requise' });
    }

    const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_change_in_production';
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      school: decoded.school,
    };

    next();
  } catch (error) {
    res.status(401).json({ message: 'Token invalide' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentification requise' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    next();
  };
};

// Alias for authenticate to match common naming convention
export const protect = authenticate;
