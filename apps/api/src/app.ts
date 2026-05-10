import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';

import { errorHandler, notFound } from './middleware/error-handler';
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/user/user.routes';
import tripRoutes from './modules/trip/trip.routes';
import cityRoutes from './modules/city/city.routes';
import communityRoutes from './modules/community/community.routes';
import adminRoutes from './modules/admin/admin.routes';

// Budget, checklist, notes route imports
import { Router } from 'express';
import { authenticate } from './middleware/auth.middleware';
import { budgetController } from './modules/budget/budget.controller';
import { checklistController } from './modules/checklist/checklist.controller';
import { notesController } from './modules/notes/notes.controller';
import { cityController } from './modules/city/city.controller';
import { createBudgetItemSchema, updateBudgetItemSchema } from './modules/budget/budget.service';
import { createChecklistItemSchema, toggleItemSchema } from './modules/checklist/checklist.service';
import { createNoteSchema, updateNoteSchema } from './modules/notes/notes.service';
import { addActivitySchema, updateActivitySchema, cityService } from './modules/city/city.service';
import { ZodError } from 'zod';
import { err, ErrorCodes } from './lib/response';

export function createApp() {
  const app = express();

  // Security middleware
  app.use(helmet({ crossOriginEmbedderPolicy: false }));
  app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  }));

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Auth rate limiter — PRD §9 (disabled in test env to prevent 429 during test suite)
  const authLimiter = process.env.NODE_ENV === 'test'
    ? (_req: any, _res: any, next: any) => next()
    : rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 10,
        standardHeaders: true,
        legacyHeaders: false,
        message: {
          success: false,
          data: null,
          error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many attempts. Try again in 15 minutes.' },
        },
      });

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ success: true, data: { status: 'ok', ts: new Date().toISOString() }, error: null });
  });

  // Core routes
  app.use('/api/auth', authLimiter, authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/trips', tripRoutes);
  app.use('/api/cities', cityRoutes);
  app.use('/api/community', communityRoutes);
  app.use('/api/admin', adminRoutes);

  // Activities direct endpoint
  app.get('/api/activities', cityController.listActivities);

  // Section activities (nested under trips/:tripId/sections/:sectionId/activities)
  app.post('/api/trips/:tripId/sections/:sectionId/activities', authenticate, async (req, res, next) => {
    try {
      const data = addActivitySchema.parse(req.body);
      const act = await cityService.addActivityToSection(req.user!.userId, req.params.tripId as string, req.params.sectionId as string, data);
      res.status(201).json({ success: true, data: act, error: null });
    } catch (e) {
      if (e instanceof ZodError) { const fe = e.errors[0]; return res.status(400).json(err(ErrorCodes.VALIDATION_ERROR, fe.message)); }
      next(e);
    }
  });
  app.patch('/api/trips/:tripId/sections/:sectionId/activities/:actId', authenticate, cityController.updateActivity);
  app.delete('/api/trips/:tripId/sections/:sectionId/activities/:actId', authenticate, cityController.removeActivity);

  // Budget + Invoice
  app.get('/api/trips/:tripId/invoice/pdf', authenticate, budgetController.getInvoicePdf);
  app.get('/api/trips/:tripId/invoice', authenticate, budgetController.getInvoice);
  app.post('/api/trips/:tripId/budget-items', authenticate, (req, res, next) => {
    try {
      createBudgetItemSchema.parse(req.body);
      budgetController.addBudgetItem(req, res, next);
    } catch (e) {
      if (e instanceof ZodError) { const fe = e.errors[0]; return res.status(400).json(err(ErrorCodes.VALIDATION_ERROR, fe.message)); }
      next(e);
    }
  });
  app.patch('/api/trips/:tripId/budget-items/:itemId', authenticate, budgetController.updateBudgetItem);
  app.delete('/api/trips/:tripId/budget-items/:itemId', authenticate, budgetController.deleteBudgetItem);
  app.patch('/api/invoices/:invoiceId', authenticate, budgetController.markPaid);

  // Checklist
  app.get('/api/trips/:tripId/checklist', authenticate, checklistController.get);
  app.post('/api/trips/:tripId/checklist/reset', authenticate, checklistController.reset);
  app.post('/api/trips/:tripId/checklist', authenticate, checklistController.add);
  app.patch('/api/trips/:tripId/checklist/:itemId', authenticate, checklistController.toggle);
  app.delete('/api/trips/:tripId/checklist/:itemId', authenticate, checklistController.remove);

  // Notes
  app.get('/api/trips/:tripId/notes', authenticate, notesController.list);
  app.post('/api/trips/:tripId/notes', authenticate, notesController.create);
  app.patch('/api/trips/:tripId/notes/:noteId', authenticate, notesController.update);
  app.delete('/api/trips/:tripId/notes/:noteId', authenticate, notesController.remove);

  // Error handling — last
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
