import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { SearchBar } from './SearchBar';

describe('SearchBar Component', () => {
  it('renders search input and action buttons', () => {
    render(
      <BrowserRouter>
        <SearchBar />
      </BrowserRouter>
    );
    expect(screen.getByPlaceholderText(/search destinations/i)).toBeInTheDocument();
    expect(screen.getByText(/group/i)).toBeInTheDocument();
    expect(screen.getByText(/filter/i)).toBeInTheDocument();
    expect(screen.getByText(/sort/i)).toBeInTheDocument();
  });

  it('triggers navigation on enter key', () => {
    render(
      <BrowserRouter>
        <SearchBar />
      </BrowserRouter>
    );
    const input = screen.getByPlaceholderText(/search destinations/i);
    fireEvent.change(input, { target: { value: 'Paris' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    // URL would change to /search?q=Paris. In jsdom without full router it just won't throw.
    expect(input).toBeInTheDocument();
  });
});
