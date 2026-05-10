import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import InvoiceView from './InvoiceView';

const mockInvoice = {
  id: 'inv1',
  invoiceNumber: 'INV-2026-12345',
  paymentStatus: 'pending',
  budgetInsights: {
    totalBudget: 2000,
    totalSpent: 1050,
    remaining: 950
  },
  lineItems: [
    { id: 'li1', description: 'Flight to Tokyo', category: 'travel', qty: 1, unitCost: 1000, amount: 1000 }
  ],
  subtotal: 1000,
  taxRate: 5,
  taxAmount: 50,
  grandTotal: 1050
};

vi.mock('../lib/api-client', () => ({
  apiClient: vi.fn((endpoint: string, options?: any) => {
    if (endpoint === '/trips/t1') return Promise.resolve({ data: { id: 't1', title: 'Japan Trip', startDate: '2026-10-01', endDate: '2026-10-15' } });
    if (endpoint === '/trips/t1/invoice') return Promise.resolve({ data: mockInvoice });
    if (endpoint === '/invoices/inv1' && options?.method === 'PATCH') return Promise.resolve({ data: { success: true } });
    return Promise.resolve({ data: null });
  }),
}));

describe('InvoiceView Component', () => {
  it('renders invoice details', async () => {
    render(
      <MemoryRouter initialEntries={['/trips/t1/invoice']}>
        <Routes>
          <Route path="/trips/:id/invoice" element={<InvoiceView />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Japan Trip')).toBeInTheDocument();
      expect(screen.getByText('INV-2026-12345')).toBeInTheDocument();
      expect(screen.getByText('Flight to Tokyo')).toBeInTheDocument();
    });

    // Check budget insights
    expect(screen.getByText('$2000')).toBeInTheDocument();
    expect(screen.getByText('$1050')).toBeInTheDocument();

    // Check totals
    expect(screen.getByText('$1050.00')).toBeInTheDocument(); // Grand total
  });

  it('handles mark as paid', async () => {
    render(
      <MemoryRouter initialEntries={['/trips/t1/invoice']}>
        <Routes>
          <Route path="/trips/:id/invoice" element={<InvoiceView />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Mark as Paid')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Mark as Paid'));

    await waitFor(() => {
      expect(screen.getByText(/paid/i, { selector: 'span' })).toBeInTheDocument();
      expect(screen.queryByText('Mark as Paid')).not.toBeInTheDocument();
    });
  });
});
