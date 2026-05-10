import { Router } from 'express';
import { budgetController } from './budget.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// Trip budget routes (mounted at /api/trips via trip.routes and also /api/budget)
// Invoice
router.get('/trips/:tripId/invoice', authenticate, budgetController.getInvoice);
router.get('/trips/:tripId/invoice/pdf', authenticate, budgetController.getInvoicePdf);

// Budget items
router.post('/trips/:tripId/budget-items', authenticate, budgetController.addBudgetItem);
router.patch('/trips/:tripId/budget-items/:itemId', authenticate, budgetController.updateBudgetItem);
router.delete('/trips/:tripId/budget-items/:itemId', authenticate, budgetController.deleteBudgetItem);

// Invoice mark paid (mounted at /api/invoices)
router.patch('/invoices/:invoiceId', authenticate, budgetController.markPaid);

export default router;
