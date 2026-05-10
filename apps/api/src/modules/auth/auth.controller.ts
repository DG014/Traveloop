import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { authService, registerSchema, loginSchema } from './auth.service';
import { ok, err, ErrorCodes } from '../../lib/response';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data = registerSchema.parse(req.body);
      const { user, token } = await authService.register(data);
      res.cookie('token', token, COOKIE_OPTIONS);
      res.status(201).json(ok(user));
    } catch (error) {
      if (error instanceof ZodError) {
        const firstError = error.errors[0];
        return res.status(400).json(
          err(ErrorCodes.VALIDATION_ERROR, firstError.message, firstError.path[0] as string),
        );
      }
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data = loginSchema.parse(req.body);
      const { user, token } = await authService.login(data.email, data.password);
      res.cookie('token', token, COOKIE_OPTIONS);
      res.status(200).json(ok(user));
    } catch (error) {
      if (error instanceof ZodError) {
        const firstError = error.errors[0];
        return res.status(400).json(
          err(ErrorCodes.VALIDATION_ERROR, firstError.message, firstError.path[0] as string),
        );
      }
      next(error);
    }
  },

  async logout(_req: Request, res: Response) {
    res.clearCookie('token');
    res.status(200).json(ok({ message: 'Logged out' }));
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.getMe(req.user!.userId);
      res.status(200).json(ok(user));
    } catch (error) {
      next(error);
    }
  },
};
