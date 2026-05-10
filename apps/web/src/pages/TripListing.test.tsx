import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TripListing from './TripListing';
import { AuthProvider } from '../lib/auth-context';

const mockTrips = [
  { id: '1', title: 'Japan Tour', status: 'planned', startDate: '2026-10-01', endDate: '2026-10-15', sectionCount: 3 },
  { id: '2', title: 'Paris Getaway', status: 'completed', startDate: '2025-05-01', endDate: '2025-05-10', sectionCount: 1 },
];

vi.mock('../lib/api-client', () => ({
  apiClient: vi.fn((endpoint: string, options?: any) => {
    if (options?.method === 'DELETE') {
      return Promise.resolve({ data: { success: true } });
    }
    return Promise.resolve({ data: mockTrips });
  }),
}));

describe('TripListing Component', () => {
  beforeEach(() => {
    vi.spyOn(window, 'confirm').mockImplementation(() => true);
  });

  it('renders trip groups correctly', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <TripListing />
        </AuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Japan Tour')).toBeInTheDocument();
    });

    expect(screen.getByText('Paris Getaway')).toBeInTheDocument();
    expect(screen.getByText(/upcoming trips/i)).toBeInTheDocument();
    expect(screen.getByText(/completed trips/i)).toBeInTheDocument();
  });

  it('handles trip deletion', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <TripListing />
        </AuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Japan Tour')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button');
    // The first button in SearchBar is Group, second is Filter, third is Sort.
    // The trash icons are within the trip cards.
    // In our component, we have a button for delete with a trash icon.
    // Let's just find by finding a button with the trash icon or using getAllByRole.
    
    // We can find the button that triggers deleteTrip.
    const container = screen.getByText('Japan Tour').closest('div.group');
    const deleteBtn = container!.querySelector('button');
    
    fireEvent.click(deleteBtn!);

    expect(window.confirm).toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.queryByText('Japan Tour')).not.toBeInTheDocument();
    });
  });
});
