import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ChecklistView from './ChecklistView';

vi.mock('../lib/api-client', () => ({
  apiClient: vi.fn((endpoint: string, options?: any) => {
    if (endpoint === '/trips/t1') {
      return Promise.resolve({ data: { id: 't1', title: 'Japan Trip' } });
    }
    if (endpoint === '/trips/t1/checklist' && !options?.method) {
      return Promise.resolve({
        data: [
          { id: '1', itemName: 'Passport', category: 'Documents', isPacked: true },
          { id: '2', itemName: 'Camera', category: 'Electronics', isPacked: false },
        ]
      });
    }
    if (options?.method === 'POST') {
      return Promise.resolve({ data: { id: '3', itemName: JSON.parse(options.body).itemName, category: JSON.parse(options.body).category, isPacked: false } });
    }
    if (options?.method === 'PATCH') {
      return Promise.resolve({ data: { success: true } });
    }
    if (options?.method === 'DELETE') {
      return Promise.resolve({ data: { success: true } });
    }
    return Promise.resolve({ data: null });
  }),
}));

describe('ChecklistView Component', () => {
  it('renders checklist items', async () => {
    render(
      <MemoryRouter initialEntries={['/trips/t1/checklist']}>
        <Routes>
          <Route path="/trips/:id/checklist" element={<ChecklistView />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Packing Checklist')).toBeInTheDocument();
      expect(screen.getByText('Passport')).toBeInTheDocument();
      expect(screen.getByText('Camera')).toBeInTheDocument();
    });

    expect(screen.getByText('1 / 2 Packed (50%)')).toBeInTheDocument();
  });

  it('can add a new item', async () => {
    render(
      <MemoryRouter initialEntries={['/trips/t1/checklist']}>
        <Routes>
          <Route path="/trips/:id/checklist" element={<ChecklistView />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Passport')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('What to pack?');
    fireEvent.change(input, { target: { value: 'Socks' } });
    fireEvent.click(screen.getByRole('button', { name: /add/i }));

    await waitFor(() => {
      expect(screen.getByText('Socks')).toBeInTheDocument();
      expect(screen.getByText('1 / 3 Packed (33%)')).toBeInTheDocument();
    });
  });
});
