import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SectionCard } from './SectionCard';

describe('SectionCard Component', () => {
  const mockSection = {
    id: 's1',
    title: 'Test Section',
    startDate: '2026-10-01',
    endDate: '2026-10-05',
    budget: 500,
  };

  it('renders in view mode and switches to edit mode on click', () => {
    const onUpdate = vi.fn();
    const onDelete = vi.fn();

    render(<SectionCard section={mockSection} index={0} onUpdate={onUpdate} onDelete={onDelete} />);

    // View mode
    expect(screen.getByText('Test Section')).toBeInTheDocument();
    expect(screen.getByText('500')).toBeInTheDocument();

    // Click to enter edit mode
    fireEvent.click(screen.getByText('Test Section'));

    // Edit mode
    expect(screen.getByDisplayValue('Test Section')).toBeInTheDocument();
    expect(screen.getByDisplayValue('500')).toBeInTheDocument();
  });

  it('calls onUpdate when blurred from edit mode', () => {
    const onUpdate = vi.fn();
    const onDelete = vi.fn();

    render(<SectionCard section={mockSection} index={0} onUpdate={onUpdate} onDelete={onDelete} />);

    // Click to enter edit mode
    fireEvent.click(screen.getByText('Test Section'));

    // Change value
    const titleInput = screen.getByDisplayValue('Test Section');
    fireEvent.change(titleInput, { target: { value: 'Updated Section' } });

    // Blur to trigger update
    fireEvent.blur(titleInput);

    expect(onUpdate).toHaveBeenCalledWith('s1', expect.objectContaining({ title: 'Updated Section' }));
  });

  it('calls onDelete when trash icon is clicked in view mode', () => {
    const onUpdate = vi.fn();
    const onDelete = vi.fn();

    render(<SectionCard section={mockSection} index={0} onUpdate={onUpdate} onDelete={onDelete} />);

    // Find and click delete button
    const deleteBtn = screen.getByTitle('Delete Section');
    fireEvent.click(deleteBtn);

    expect(onDelete).toHaveBeenCalledWith('s1');
  });
});
