import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ItineraryBuilder from './ItineraryBuilder';

const mockTrip = { id: 't1', title: 'Japan Trip', startDate: '2026-10-01', endDate: '2026-10-15', totalBudget: 2000 };
const mockSections = [
  { id: 's1', title: 'Tokyo', startDate: '2026-10-01', endDate: '2026-10-05', budget: 500, sortOrder: 0 }
];

vi.mock('../lib/api-client', () => ({
  apiClient: vi.fn((endpoint: string, options?: any) => {
    if (endpoint === '/trips/t1') return Promise.resolve({ data: mockTrip });
    if (endpoint === '/trips/t1/itinerary') return Promise.resolve({ data: { sections: mockSections } });
    if (endpoint === '/trips/t1/sections' && options?.method === 'POST') {
      return Promise.resolve({ data: { ...JSON.parse(options.body), id: 's2' } });
    }
    return Promise.resolve({ data: null });
  }),
}));

describe('ItineraryBuilder Component', () => {
  it('renders trip title and sections', async () => {
    render(
      <MemoryRouter initialEntries={['/trips/t1/builder']}>
        <Routes>
          <Route path="/trips/:id/builder" element={<ItineraryBuilder />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Japan Trip')).toBeInTheDocument();
      expect(screen.getByText('Tokyo')).toBeInTheDocument();
    });
    
    // Budget rolled up
    expect(screen.getByText('$500')).toBeInTheDocument();
    expect(screen.getByText('/ $2000')).toBeInTheDocument();
  });

  it('adds a new section', async () => {
    render(
      <MemoryRouter initialEntries={['/trips/t1/builder']}>
        <Routes>
          <Route path="/trips/:id/builder" element={<ItineraryBuilder />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Tokyo')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /add section/i }));

    await waitFor(() => {
      // It adds a blank card in edit mode
      expect(screen.getByPlaceholderText(/e.g. 3 Days in Tokyo/i)).toBeInTheDocument();
    });
  });
});
