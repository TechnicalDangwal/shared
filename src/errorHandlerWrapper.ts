import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ApiErrorType } from './types';

// Async Error Handler Wrapper
const asyncHandler = (fn: RequestHandler): RequestHandler => (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(fn(req, res, next)).catch(next); // If the function throws an error, it will be passed to `next()`
};

const globalErrorHandler = (
  err: ApiErrorType,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const status = err.status || false;
  const message = err.message || 'Something went wrong!';

  res.status(statusCode).json({
    statusCode,
    status,
    message,
  });

};

export {asyncHandler , globalErrorHandler};
