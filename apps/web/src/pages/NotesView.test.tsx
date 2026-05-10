import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import NotesView from './NotesView';

vi.mock('../lib/api-client', () => ({
  apiClient: vi.fn((endpoint: string, options?: any) => {
    if (endpoint === '/trips/t1') {
      return Promise.resolve({ data: { id: 't1', title: 'Japan Trip' } });
    }
    if (endpoint === '/trips/t1/notes' && !options?.method) {
      return Promise.resolve({
        data: [
          { id: '1', title: 'Arrival Details', content: 'Land at NRT at 4PM.', dayNumber: 1, createdAt: '2026-05-01' },
          { id: '2', title: 'Food List', content: 'Try sushi and ramen.', createdAt: '2026-05-02' },
        ]
      });
    }
    if (options?.method === 'POST') {
      const body = JSON.parse(options.body);
      return Promise.resolve({ data: { id: '3', title: body.title, content: body.content, createdAt: new Date().toISOString() } });
    }
    return Promise.resolve({ data: null });
  }),
}));

describe('NotesView Component', () => {
  it('renders notes list', async () => {
    render(
      <MemoryRouter initialEntries={['/trips/t1/notes']}>
        <Routes>
          <Route path="/trips/:id/notes" element={<NotesView />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Trip Journal & Notes')).toBeInTheDocument();
      expect(screen.getByText('Arrival Details')).toBeInTheDocument();
      expect(screen.getByText('Food List')).toBeInTheDocument();
    });

    expect(screen.getByText('Day 1')).toBeInTheDocument();
  });

  it('can create a new note', async () => {
    render(
      <MemoryRouter initialEntries={['/trips/t1/notes']}>
        <Routes>
          <Route path="/trips/:id/notes" element={<NotesView />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Arrival Details')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /new note/i }));

    await waitFor(() => {
      expect(screen.getByText('Create Note')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'New Test Note' } });
    fireEvent.change(screen.getByLabelText(/content/i), { target: { value: 'Test content here.' } });
    
    fireEvent.click(screen.getByRole('button', { name: /save note/i }));

    await waitFor(() => {
      expect(screen.getByText('New Test Note')).toBeInTheDocument();
      expect(screen.getByText('Test content here.')).toBeInTheDocument();
    });
  });
});
