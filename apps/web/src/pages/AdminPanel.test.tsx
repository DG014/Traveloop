import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminPanel from './AdminPanel';

vi.mock('../lib/api-client', () => ({
  apiClient: vi.fn((endpoint: string) => {
    if (endpoint === '/admin/analytics') {
      return Promise.resolve({
        data: {
          summary: { totalUsers: 10, totalTrips: 20, avgTripsPerUser: 2, mostPopularCity: 'Tokyo' }
        }
      });
    }
    if (endpoint === '/admin/users') {
      return Promise.resolve({
        data: [
          { id: '1', firstName: 'Admin', lastName: 'User', email: 'admin@test.com', role: 'admin', isActive: true, createdAt: '2026-05-01' }
        ]
      });
    }
    return Promise.resolve({ data: null });
  }),
}));

describe('AdminPanel Component', () => {
  it('renders analytics tab by default', async () => {
    render(
      <MemoryRouter>
        <AdminPanel />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Platform Analytics')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument(); // total users
      expect(screen.getByText('Tokyo')).toBeInTheDocument();
    });
  });

  it('switches to users tab', async () => {
    render(
      <MemoryRouter>
        <AdminPanel />
      </MemoryRouter>
    );

    const usersTab = screen.getByRole('button', { name: /manage users/i });
    fireEvent.click(usersTab);

    await waitFor(() => {
      expect(screen.getByText('admin@test.com')).toBeInTheDocument();
    });
  });
});
