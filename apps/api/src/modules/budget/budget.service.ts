import { prisma } from '../../lib/prisma';
import { z } from 'zod';

export const createBudgetItemSchema = z.object({
  description: z.string().min(1, 'Description is required').max(255),
  unitCost: z.number().min(0, 'Unit cost must be non-negative'),
  qty: z.number().min(0).default(1),
  category: z.enum(['hotel', 'travel', 'food', 'activity', 'misc']).optional(),
  sectionId: z.string().uuid().optional(),
});

export const updateBudgetItemSchema = createBudgetItemSchema.partial();

function computeAmount(qty: number | null, unitCost: number | null): number {
  return Number(qty ?? 1) * Number(unitCost ?? 0);
}

async function assertTripOwner(userId: string, tripId: string) {
  const trip = await prisma.trip.findUnique({ where: { id: tripId, deletedAt: null } });
  if (!trip) {
    const e = new Error('Trip not found') as Error & { status: number; code: string };
    e.status = 404; e.code = 'NOT_FOUND'; throw e;
  }
  if (trip.userId !== userId) {
    const e = new Error('Access denied') as Error & { status: number; code: string };
    e.status = 403; e.code = 'FORBIDDEN'; throw e;
  }
  return trip;
}

function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const digits = String(Math.floor(10000 + Math.random() * 90000));
  return `INV-${year}-${digits}`;
}

export const budgetService = {
  async getInvoice(userId: string, tripId: string) {
    const trip = await assertTripOwner(userId, tripId);
    const items = await prisma.budgetItem.findMany({ where: { tripId } });

    const subtotal = items.reduce((sum, item) => sum + computeAmount(Number(item.qty), Number(item.unitCost)), 0);
    const taxRate = 5;
    const taxAmount = (subtotal * taxRate) / 100;
    const discount = 0; // manual override via invoice update
    const grandTotal = subtotal + taxAmount - discount;

    // Upsert invoice record — idempotent
    let invoice = await prisma.invoice.findFirst({ where: { tripId } });
    if (!invoice) {
      let invoiceNumber = generateInvoiceNumber();
      // Ensure uniqueness
      let existing = await prisma.invoice.findUnique({ where: { invoiceNumber } });
      while (existing) {
        invoiceNumber = generateInvoiceNumber();
        existing = await prisma.invoice.findUnique({ where: { invoiceNumber } });
      }
      invoice = await prisma.invoice.create({
        data: {
          tripId,
          invoiceNumber,
          subtotal,
          taxRate,
          taxAmount,
          discount,
          grandTotal,
          paymentStatus: 'pending',
        },
      });
    } else {
      invoice = await prisma.invoice.update({
        where: { id: invoice.id },
        data: { subtotal, taxAmount, grandTotal },
      });
    }

    const totalSpent = subtotal;
    const totalBudget = Number(trip.totalBudget ?? 0);
    const remaining = totalBudget - totalSpent;

    return {
      invoiceNumber: invoice.invoiceNumber,
      invoiceId: invoice.id,
      generatedAt: invoice.generatedAt,
      paymentStatus: invoice.paymentStatus,
      paidAt: invoice.paidAt,
      lineItems: items.map((item) => ({
        id: item.id,
        category: item.category,
        description: item.description,
        qty: Number(item.qty),
        unitCost: Number(item.unitCost),
        amount: computeAmount(Number(item.qty), Number(item.unitCost)),
      })),
      subtotal,
      taxRate,
      taxAmount,
      discount: Number(invoice.discount),
      grandTotal,
      budgetInsights: { totalBudget, totalSpent, remaining },
    };
  },

  async addBudgetItem(userId: string, tripId: string, data: z.infer<typeof createBudgetItemSchema>) {
    await assertTripOwner(userId, tripId);
    const item = await prisma.budgetItem.create({
      data: {
        tripId,
        description: data.description,
        unitCost: data.unitCost,
        qty: data.qty ?? 1,
        category: data.category,
        sectionId: data.sectionId,
      },
    });
    return { ...item, amount: computeAmount(Number(item.qty), Number(item.unitCost)) };
  },

  async updateBudgetItem(userId: string, tripId: string, itemId: string, data: z.infer<typeof updateBudgetItemSchema>) {
    await assertTripOwner(userId, tripId);
    const item = await prisma.budgetItem.update({
      where: { id: itemId },
      data: {
        ...(data.description && { description: data.description }),
        ...(data.unitCost !== undefined && { unitCost: data.unitCost }),
        ...(data.qty !== undefined && { qty: data.qty }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.sectionId !== undefined && { sectionId: data.sectionId }),
      },
    });
    return { ...item, amount: computeAmount(Number(item.qty), Number(item.unitCost)) };
  },

  async deleteBudgetItem(userId: string, tripId: string, itemId: string) {
    await assertTripOwner(userId, tripId);
    await prisma.budgetItem.delete({ where: { id: itemId } });
    return { message: 'Budget item deleted' };
  },

  async markInvoicePaid(userId: string, invoiceId: string) {
    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId }, include: { trip: true } });
    if (!invoice) {
      const e = new Error('Invoice not found') as Error & { status: number; code: string };
      e.status = 404; e.code = 'NOT_FOUND'; throw e;
    }
    if (invoice.trip.userId !== userId) {
      const e = new Error('Access denied') as Error & { status: number; code: string };
      e.status = 403; e.code = 'FORBIDDEN'; throw e;
    }
    return prisma.invoice.update({
      where: { id: invoiceId },
      data: { paymentStatus: 'paid', paidAt: new Date() },
    });
  },

  async generatePdf(userId: string, tripId: string): Promise<Buffer> {
    const invoiceData = await budgetService.getInvoice(userId, tripId);
    const trip = await prisma.trip.findUnique({ where: { id: tripId } });

    const fs = await import('fs/promises');
    const path = await import('path');
    
    const templatePath = path.join(__dirname, 'invoice.template.html');
    let html = await fs.readFile(templatePath, 'utf-8');

    const lineItemsHtml = invoiceData.lineItems.map((item, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${item.description}</td>
          <td>${item.category || 'misc'}</td>
          <td>${item.qty}</td>
          <td>$${Number(item.unitCost).toFixed(2)}</td>
          <td>$${Number(item.amount).toFixed(2)}</td>
        </tr>
      `).join('');

    html = html
      .replace('{{invoiceNumber}}', invoiceData.invoiceNumber)
      .replace('{{invoiceNumber}}', invoiceData.invoiceNumber)
      .replace('{{tripTitle}}', trip?.title || tripId)
      .replace('{{generatedDate}}', new Date().toLocaleDateString())
      .replace('{{paymentStatus}}', invoiceData.paymentStatus.toUpperCase())
      .replace('{{lineItemsHtml}}', lineItemsHtml)
      .replace('{{subtotal}}', invoiceData.subtotal.toFixed(2))
      .replace('{{taxRate}}', invoiceData.taxRate.toString())
      .replace('{{taxAmount}}', invoiceData.taxAmount.toFixed(2))
      .replace('{{discount}}', invoiceData.discount.toFixed(2))
      .replace('{{grandTotal}}', invoiceData.grandTotal.toFixed(2));

    // Use Puppeteer for PDF generation per PRD §7 Screen 14
    const puppeteer = await import('puppeteer');
    const browser = await puppeteer.default.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    return Buffer.from(pdf);
  },
};
