import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { userService, updateUserSchema } from './user.service';
import { ok, err, ErrorCodes } from '../../lib/response';

export const userController = {
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.getProfile(req.user!.userId);
      res.json(ok(user));
    } catch (error) { next(error); }
  },

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateUserSchema.parse(req.body);
      const user = await userService.updateProfile(req.user!.userId, data);
      res.json(ok(user));
    } catch (error) {
      if (error instanceof ZodError) {
        const fe = error.errors[0];
        return res.status(400).json(err(ErrorCodes.VALIDATION_ERROR, fe.message, fe.path[0] as string));
      }
      next(error);
    }
  },

  async uploadPhoto(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json(err(ErrorCodes.VALIDATION_ERROR, 'No file uploaded'));
      }
      const photoPath = `/uploads/${req.file.filename}`;
      const result = await userService.updatePhoto(req.user!.userId, photoPath);
      res.json(ok(result));
    } catch (error) { next(error); }
  },
};
