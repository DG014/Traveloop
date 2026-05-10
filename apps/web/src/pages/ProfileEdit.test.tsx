import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProfileEdit from './ProfileEdit';
import { apiClient } from '../lib/api-client';

vi.mock('../lib/api-client', () => ({
  apiClient: vi.fn(),
}));

vi.mock('../lib/auth-context', () => ({
  useAuth: () => ({
    user: { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
    refreshUser: vi.fn(),
  }),
}));

describe('ProfileEdit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    vi.mocked(apiClient).mockImplementation(() => new Promise(() => {}));
    render(
      <BrowserRouter>
        <ProfileEdit />
      </BrowserRouter>
    );
    expect(screen.getByText('Loading profile...')).toBeInTheDocument();
  });

  it('renders profile data correctly', async () => {
    vi.mocked(apiClient).mockResolvedValueOnce({
      data: {
        firstName: 'Alice',
        lastName: 'Smith',
        email: 'alice@example.com',
        profilePhoto: null
      }
    });

    render(
      <BrowserRouter>
        <ProfileEdit />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Alice')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Smith')).toBeInTheDocument();
      expect(screen.getByDisplayValue('alice@example.com')).toBeInTheDocument();
    });
  });
});
