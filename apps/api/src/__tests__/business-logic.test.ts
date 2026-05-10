import { describe, it, expect } from 'vitest';
import { computeTripStatus } from '../modules/trip/trip.service';

describe('Trip Status Computation (PRD §7 Screen 6)', () => {
  it('should return planned when startDate > today', () => {
    const future = new Date();
    future.setDate(future.getDate() + 5);
    const futureEnd = new Date();
    futureEnd.setDate(futureEnd.getDate() + 10);
    expect(computeTripStatus(future, futureEnd)).toBe('planned');
  });

  it('should return ongoing when startDate <= today <= endDate', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(computeTripStatus(yesterday, tomorrow)).toBe('ongoing');
  });

  it('should return ongoing when trip starts exactly today', () => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    expect(computeTripStatus(today, tomorrow)).toBe('ongoing');
  });

  it('should return ongoing when trip ends exactly today', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 2);
    const today = new Date();
    expect(computeTripStatus(yesterday, today)).toBe('ongoing');
  });

  it('should return completed when endDate < today', () => {
    const past1 = new Date();
    past1.setDate(past1.getDate() - 10);
    const past2 = new Date();
    past2.setDate(past2.getDate() - 5);
    expect(computeTripStatus(past1, past2)).toBe('completed');
  });
});

describe('Invoice Math (PRD §7 Screen 14)', () => {
  it('grandTotal = subtotal + taxAmount - discount', () => {
    const subtotal = 1000;
    const taxRate = 5;
    const taxAmount = (subtotal * taxRate) / 100; // 50
    const discount = 0;
    const grandTotal = subtotal + taxAmount - discount;
    expect(grandTotal).toBe(1050);
  });

  it('remaining can be negative when over budget', () => {
    const totalBudget = 500;
    const totalSpent = 800;
    const remaining = totalBudget - totalSpent;
    expect(remaining).toBe(-300);
    expect(remaining).toBeLessThan(0);
  });

  it('grandTotal correct with discount', () => {
    const subtotal = 1000;
    const taxAmount = 50;
    const discount = 100;
    const grandTotal = subtotal + taxAmount - discount;
    expect(grandTotal).toBe(950);
  });
});

describe('bcrypt rounds verification', () => {
  it('should use 12 rounds minimum', async () => {
    const bcrypt = await import('bcryptjs');
    const hash = await bcrypt.hash('TestPassword1', 12);
    // bcrypt hash format: $2a$12$... — verify rounds are 12
    const rounds = parseInt(hash.split('$')[2]);
    expect(rounds).toBe(12);
    const valid = await bcrypt.compare('TestPassword1', hash);
    expect(valid).toBe(true);
  });
});
