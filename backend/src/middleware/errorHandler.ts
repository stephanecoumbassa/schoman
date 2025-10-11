import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import logger from '../utils/logger.js';

// Error response interface
interface ErrorResponse {
  status: 'error';
  message: string;
  statusCode?: number;
  stack?: string;
  errors?: any[];
}

// Handle Mongoose validation errors
const handleValidationError = (err: any): AppError => {
  const errors = Object.values(err.errors).map((e: any) => ({
    field: e.path,
    message: e.message
  }));
  
  const message = `Validation error: ${errors.map(e => e.message).join(', ')}`;
  const error = new AppError(message, 400);
  (error as any).errors = errors;
  return error;
};

// Handle Mongoose duplicate key errors
const handleDuplicateKeyError = (err: any): AppError => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `${field} '${value}' already exists`;
  return new AppError(message, 409);
};

// Handle Mongoose cast errors
const handleCastError = (err: any): AppError => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

// Handle JWT errors
const handleJWTError = (): AppError => {
  return new AppError('Invalid token. Please log in again', 401);
};

const handleJWTExpiredError = (): AppError => {
  return new AppError('Your token has expired. Please log in again', 401);
};

// Send error response in development
const sendErrorDev = (err: AppError, res: Response) => {
  const response: ErrorResponse = {
    status: 'error',
    message: err.message,
    statusCode: err.statusCode,
    stack: err.stack,
    ...(err as any).errors && { errors: (err as any).errors }
  };
  
  res.status(err.statusCode).json(response);
};

// Send error response in production
const sendErrorProd = (err: AppError, res: Response) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    const response: ErrorResponse = {
      status: 'error',
      message: err.message,
      ...(err as any).errors && { errors: (err as any).errors }
    };
    
    res.status(err.statusCode).json(response);
  } 
  // Programming or unknown error: don't leak error details
  else {
    // Log error
    logger.error('ERROR 💥', err);
    
    // Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong. Please try again later.'
    });
  }
};

// Global error handling middleware
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;
  error.isOperational = err.isOperational || false;

  // Log error
  logger.error({
    message: err.message,
    statusCode: error.statusCode,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userId: (req as any).user?.id
  });

  // Handle specific error types
  if (err.name === 'ValidationError') {
    error = handleValidationError(err);
  }
  
  if (err.code === 11000) {
    error = handleDuplicateKeyError(err);
  }
  
  if (err.name === 'CastError') {
    error = handleCastError(err);
  }
  
  if (err.name === 'JsonWebTokenError') {
    error = handleJWTError();
  }
  
  if (err.name === 'TokenExpiredError') {
    error = handleJWTExpiredError();
  }

  // Send response
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

// Async error wrapper to catch errors in async route handlers
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};
