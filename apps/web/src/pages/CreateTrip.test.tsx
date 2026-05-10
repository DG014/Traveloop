import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CreateTrip from './CreateTrip';
import { AuthProvider } from '../lib/auth-context';

// Mock the apiClient
vi.mock('../lib/api-client', () => ({
  apiClient: vi.fn((endpoint: string, options?: any) => {
    if (endpoint.includes('/cities?q=')) {
      return Promise.resolve({ data: [{ id: 'c1', name: 'Paris', country: 'France' }] });
    }
    if (endpoint.includes('/suggestions')) {
      return Promise.resolve({ data: [{ id: 'a1', name: 'Eiffel Tower', category: 'Attraction', avgCost: 25 }] });
    }
    if (endpoint === '/trips' && options?.method === 'POST') {
      return Promise.resolve({ data: { id: 't1' } });
    }
    return Promise.resolve({ data: null });
  }),
}));

describe('CreateTrip Component', () => {
  it('renders the form and handles submission', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <CreateTrip />
        </AuthProvider>
      </BrowserRouter>
    );

    // Form elements
    expect(screen.getByLabelText(/trip title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
    
    // Attempt submit with empty required fields
    fireEvent.click(screen.getByRole('button', { name: /create trip/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
    });
  });

  it('searches for cities and shows suggestions', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <CreateTrip />
        </AuthProvider>
      </BrowserRouter>
    );

    // Search city
    const cityInput = screen.getByPlaceholderText(/search destination city/i);
    fireEvent.change(cityInput, { target: { value: 'Par' } });

    await waitFor(() => {
      expect(screen.getByText('Paris, France')).toBeInTheDocument();
    });

    // Select city
    fireEvent.click(screen.getByText('Paris, France'));

    // Verify suggestions are loaded
    await waitFor(() => {
      expect(screen.getByText('Eiffel Tower')).toBeInTheDocument();
    });
  });
});
