import { Request, Response, NextFunction } from 'express';
import { err, ErrorCodes } from '../lib/response';

export function errorHandler(
  error: Error & { status?: number; code?: string },
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  console.error('[ERROR]', error.message, error.stack);

  const status = error.status || 500;
  const code = error.code || ErrorCodes.INTERNAL_ERROR;
  const message = process.env.NODE_ENV === 'production'
    ? 'An unexpected error occurred'
    : error.message;

  res.status(status).json(err(code, message));
}

export function notFound(req: Request, res: Response): void {
  res.status(404).json(err(ErrorCodes.NOT_FOUND, `Route ${req.method} ${req.path} not found`));
}
