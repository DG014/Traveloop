import { Request, Response, NextFunction } from 'express';
import { err, ErrorCodes } from '../lib/response';

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json(err(ErrorCodes.UNAUTHORIZED, 'Authentication required'));
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json(err(ErrorCodes.FORBIDDEN, 'Insufficient permissions'));
      return;
    }
    next();
  };
}
