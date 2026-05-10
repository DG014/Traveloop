import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../app';
import { prisma } from '../../lib/prisma';
import bcrypt from 'bcryptjs';

const app = createApp();

// RED tests — written before implementation
describe('Auth Module — POST /api/auth/register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('RED: should return 201 with user and JWT cookie on valid registration', async () => {
    const mockUser = {
      id: 'uuid-1',
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'alice@test.com',
      phone: null,
      city: null,
      country: null,
      bio: null,
      role: 'user',
      isActive: true,
      profilePhoto: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    (prisma.user.findUnique as any).mockResolvedValue(null); // no duplicate
    (prisma.user.create as any).mockResolvedValue(mockUser);

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Alice',
        lastName: 'Smith',
        email: 'alice@test.com',
        password: 'Password1',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('alice@test.com');
    expect(res.body.data.passwordHash).toBeUndefined();
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('RED: should return 400 when firstName is missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ lastName: 'Smith', email: 'alice@test.com', password: 'Password1' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('RED: should return 400 on invalid email format', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ firstName: 'Alice', lastName: 'Smith', email: 'not-email', password: 'Password1' });
    expect(res.status).toBe(400);
    expect(res.body.error.field).toBe('email');
  });

  it('RED: should return 409 on duplicate email', async () => {
    (prisma.user.findUnique as any).mockResolvedValue({ id: 'existing' });
    const res = await request(app)
      .post('/api/auth/register')
      .send({ firstName: 'Alice', lastName: 'Smith', email: 'alice@test.com', password: 'Password1' });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('DUPLICATE_EMAIL');
  });

  it('RED: should return 400 when password < 8 chars', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ firstName: 'Alice', lastName: 'Smith', email: 'alice@test.com', password: 'Pass1' });
    expect(res.status).toBe(400);
  });

  it('RED: should return 400 when password has no uppercase', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ firstName: 'Alice', lastName: 'Smith', email: 'alice@test.com', password: 'password1' });
    expect(res.status).toBe(400);
  });

  it('RED: should return 400 when password has no number', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ firstName: 'Alice', lastName: 'Smith', email: 'alice@test.com', password: 'Password' });
    expect(res.status).toBe(400);
  });
});

describe('Auth Module — POST /api/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('RED: should return 200 with user and JWT cookie on valid credentials', async () => {
    const hash = await bcrypt.hash('Password1', 12);
    (prisma.user.findUnique as any).mockResolvedValue({
      id: 'uuid-1',
      email: 'alice@test.com',
      passwordHash: hash,
      firstName: 'Alice',
      lastName: 'Smith',
      role: 'user',
      isActive: true,
      profilePhoto: null,
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@test.com', password: 'Password1' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('RED: should return 401 on wrong password', async () => {
    const hash = await bcrypt.hash('CorrectPassword1', 12);
    (prisma.user.findUnique as any).mockResolvedValue({
      id: 'uuid-1',
      email: 'alice@test.com',
      passwordHash: hash,
      isActive: true,
    });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@test.com', password: 'WrongPassword1' });
    expect(res.status).toBe(401);
    expect(res.body.error.message).toBe('Incorrect email or password');
  });

  it('RED: should return 401 on unknown email', async () => {
    (prisma.user.findUnique as any).mockResolvedValue(null);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@test.com', password: 'Password1' });
    expect(res.status).toBe(401);
    expect(res.body.error.message).toBe('Incorrect email or password');
  });

  it('RED: should return 400 when email is missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: 'Password1' });
    expect(res.status).toBe(400);
  });
});

describe('Auth Module — GET /api/auth/me', () => {
  it('RED: should return 401 without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });
});

describe('Auth Module — POST /api/auth/logout', () => {
  it('RED: should return 200 and clear cookie', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
