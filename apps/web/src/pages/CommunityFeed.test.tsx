import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CommunityFeed from './CommunityFeed';
import { apiClient } from '../lib/api-client';

vi.mock('../lib/api-client', () => ({
  apiClient: vi.fn(),
}));

describe('CommunityFeed', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    vi.mocked(apiClient).mockImplementation(() => new Promise(() => {}));
    render(
      <BrowserRouter>
        <CommunityFeed />
      </BrowserRouter>
    );
    expect(screen.getByText('Community Trips')).toBeInTheDocument();
  });

  it('renders empty state when no posts exist', async () => {
    vi.mocked(apiClient).mockResolvedValueOnce({ data: [], meta: { total: 0 } });
    render(
      <BrowserRouter>
        <CommunityFeed />
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(screen.getByText('No community trips yet')).toBeInTheDocument();
    });
  });

  it('renders posts successfully', async () => {
    const mockPosts = [
      {
        id: '1',
        caption: 'Great trip',
        viewCount: 10,
        copyCount: 2,
        createdAt: new Date().toISOString(),
        trip: {
          id: '101',
          title: 'Paris Getaway',
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
          publicSlug: 'paris-123',
          coverPhoto: null,
        },
        user: {
          id: 'u1',
          firstName: 'John',
          lastName: 'Doe',
          profilePhoto: null,
        },
      },
    ];

    vi.mocked(apiClient).mockResolvedValueOnce({ data: mockPosts, meta: { total: 1 } });
    
    render(
      <BrowserRouter>
        <CommunityFeed />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Paris Getaway')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });
});
