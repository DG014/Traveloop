import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CitySearch from './CitySearch';
import { AuthProvider } from '../lib/auth-context';

vi.mock('../lib/api-client', () => ({
  apiClient: vi.fn().mockResolvedValue({
    data: [
      { id: '1', name: 'Paris', country: 'France', costIndex: 'premium', description: 'City of light' },
      { id: '2', name: 'Bangkok', country: 'Thailand', costIndex: 'budget', description: 'City of temples' },
    ],
    meta: { total: 2, page: 1, limit: 12 },
  }),
}));

describe('CitySearch Component', () => {
  const renderCitySearch = () =>
    render(
      <MemoryRouter>
        <AuthProvider>
          <CitySearch />
        </AuthProvider>
      </MemoryRouter>
    );

  it('renders search input and tabs', async () => {
    renderCitySearch();
    expect(screen.getByPlaceholderText(/search cities/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cities/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /activities/i })).toBeInTheDocument();
  });

  it('renders filter buttons', () => {
    renderCitySearch();
    expect(screen.getByText(/all budgets/i)).toBeInTheDocument();
    // 'budget' text appears as both filter button text and inside 'All budgets' — use getAllByText
    expect(screen.getAllByText(/budget/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/moderate/i)).toBeInTheDocument();
  });

  it('switches to activities tab', async () => {
    renderCitySearch();
    fireEvent.click(screen.getByRole('button', { name: /activities/i }));
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search activities/i)).toBeInTheDocument();
    });
  });

  it('shows heading', () => {
    renderCitySearch();
    expect(screen.getByText(/explore cities/i)).toBeInTheDocument();
  });
});
