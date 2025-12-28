import { Request, Response, NextFunction } from 'express';
import { ValidationError } from 'express-validator';
import logger from '../config/logger';
import { RequestWithId } from './requestLogger';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError | ValidationError[],
  req: RequestWithId,
  res: Response,
  next: NextFunction
): void => {
  if (Array.isArray(err)) {
    // Validation errors
    logger.warn('Validation error', {
      requestId: req.id,
      errors: err
    });
    res.status(400).json({
      error: 'Validation failed',
      details: err.map(e => ({
        field: e.type === 'field' ? e.path : 'unknown',
        message: e.msg
      }))
    });
    return;
  }

  if (err instanceof AppError) {
    logger.error('Application error', {
      requestId: req.id,
      statusCode: err.statusCode,
      message: err.message,
      stack: err.stack
    });
    res.status(err.statusCode).json({
      error: err.message,
      requestId: req.id
    });
    return;
  }

  // Unknown errors
  logger.error('Unhandled error', {
    requestId: req.id,
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method
  });

  res.status(500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    requestId: req.id
  });
};

