import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PublicTripView from './PublicTripView';
import { apiClient } from '../lib/api-client';
import { AuthProvider } from '../lib/auth-context';

vi.mock('../lib/api-client', () => ({
  apiClient: vi.fn(),
}));

describe('PublicTripView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    vi.mocked(apiClient).mockImplementation(() => new Promise(() => {}));
    render(
      <MemoryRouter initialEntries={['/community/test-slug']}>
        <AuthProvider>
          <Routes>
            <Route path="/community/:slug" element={<PublicTripView />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );
    expect(screen.getByText('Loading trip...')).toBeInTheDocument();
  });

  it('renders error state on API failure', async () => {
    vi.mocked(apiClient).mockRejectedValueOnce(new Error('Not found'));
    
    render(
      <MemoryRouter initialEntries={['/community/test-slug']}>
        <AuthProvider>
          <Routes>
            <Route path="/community/:slug" element={<PublicTripView />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Trip not found or no longer public.')).toBeInTheDocument();
    });
  });
});
