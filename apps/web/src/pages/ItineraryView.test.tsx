import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ItineraryView from './ItineraryView';

const mockItinerary = {
  sections: [
    {
      id: 's1',
      title: 'Tokyo Phase',
      activities: [
        {
          id: 'a1',
          dayNumber: 1,
          scheduledTime: '10:00',
          actualCost: 50,
          activity: {
            name: 'Tokyo Tower',
            category: 'Attraction'
          }
        }
      ]
    }
  ]
};

vi.mock('../lib/api-client', () => ({
  apiClient: vi.fn((endpoint: string, options?: any) => {
    if (endpoint === '/trips/t1') return Promise.resolve({ data: { id: 't1', title: 'Japan Trip' } });
    if (endpoint === '/trips/t1/itinerary') return Promise.resolve({ data: mockItinerary });
    if (options?.method === 'PATCH') return Promise.resolve({ data: { success: true } });
    return Promise.resolve({ data: null });
  }),
}));

describe('ItineraryView Component', () => {
  it('renders trip and activities', async () => {
    render(
      <MemoryRouter initialEntries={['/trips/t1']}>
        <Routes>
          <Route path="/trips/:id" element={<ItineraryView />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Japan Trip')).toBeInTheDocument();
      expect(screen.getByText('Tokyo Phase')).toBeInTheDocument();
      expect(screen.getByText('Tokyo Tower')).toBeInTheDocument();
    });

    // Total expense
    expect(screen.getAllByText('$50.00').length).toBeGreaterThan(0);
  });
});
