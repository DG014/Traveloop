import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from './Dashboard';
import { AuthProvider } from '../lib/auth-context';

// Mock the apiClient
vi.mock('../lib/api-client', () => ({
  apiClient: vi.fn((endpoint: string) => {
    if (endpoint.includes('/auth/me')) {
      return Promise.resolve({ data: { id: '1', firstName: 'Alice', lastName: 'Smith' } });
    }
    if (endpoint.includes('/cities')) {
      return Promise.resolve({ data: [{ id: '1', name: 'Tokyo', country: 'Japan' }] });
    }
    if (endpoint.includes('/trips')) {
      return Promise.resolve({ data: [] }); // Empty trips to test empty state
    }
    return Promise.resolve({ data: null });
  }),
}));

describe('Dashboard Component', () => {
  it('renders dashboard with data and empty states', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Dashboard />
        </AuthProvider>
      </BrowserRouter>
    );

    // Wait for the data to load
    await waitFor(() => {
      expect(screen.getByText(/where to next\?/i)).toBeInTheDocument();
    });

    // Top Regional Selections
    expect(screen.getByText('Tokyo')).toBeInTheDocument();
    expect(screen.getByText('Japan')).toBeInTheDocument();

    // Previous Trips empty state
    expect(screen.getByText(/no trips yet/i)).toBeInTheDocument();
    expect(screen.getByText(/start planning your first adventure/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /plan a trip/i })).toBeInTheDocument();
  });
});
