import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ApiErrorType } from './types';
declare const asyncHandler: (fn: RequestHandler) => RequestHandler;
declare const globalErrorHandler: (err: ApiErrorType, req: Request, res: Response, next: NextFunction) => void;
export { asyncHandler, globalErrorHandler };
