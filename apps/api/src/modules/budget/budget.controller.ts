import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { budgetService, createBudgetItemSchema, updateBudgetItemSchema } from './budget.service';
import { ok, err, ErrorCodes } from '../../lib/response';
import { p } from '../../lib/qs';

export const budgetController = {
  async getInvoice(req: Request, res: Response, next: NextFunction) {
    try { res.json(ok(await budgetService.getInvoice(req.user!.userId, p(req.params.tripId)))); } catch (e) { next(e); }
  },
  async getInvoicePdf(req: Request, res: Response, next: NextFunction) {
    try {
      const pdf = await budgetService.generatePdf(req.user!.userId, p(req.params.tripId));
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="invoice-${p(req.params.tripId)}.pdf"`);
      res.send(pdf);
    } catch (e) { next(e); }
  },
  async addBudgetItem(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createBudgetItemSchema.parse(req.body);
      res.status(201).json(ok(await budgetService.addBudgetItem(req.user!.userId, p(req.params.tripId), data)));
    } catch (e) {
      if (e instanceof ZodError) { const fe = e.errors[0]; return res.status(400).json(err(ErrorCodes.VALIDATION_ERROR, fe.message)); }
      next(e);
    }
  },
  async updateBudgetItem(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateBudgetItemSchema.parse(req.body);
      res.json(ok(await budgetService.updateBudgetItem(req.user!.userId, p(req.params.tripId), p(req.params.itemId), data)));
    } catch (e) { next(e); }
  },
  async deleteBudgetItem(req: Request, res: Response, next: NextFunction) {
    try { res.json(ok(await budgetService.deleteBudgetItem(req.user!.userId, p(req.params.tripId), p(req.params.itemId)))); } catch (e) { next(e); }
  },
  async markPaid(req: Request, res: Response, next: NextFunction) {
    try { res.json(ok(await budgetService.markInvoicePaid(req.user!.userId, p(req.params.invoiceId)))); } catch (e) { next(e); }
  },
};
