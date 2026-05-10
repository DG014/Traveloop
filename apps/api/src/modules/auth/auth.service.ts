import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { JwtPayload } from '../../middleware/auth.middleware';

// Validation schemas
export const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(100),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').max(100),
  email: z.string().email('Enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  phone: z.string().regex(/^\d{7,15}$/, 'Phone must be 7-15 digits').optional().or(z.literal('')),
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  bio: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const BCRYPT_ROUNDS = 12; // PRD §9: min 12 rounds
const JWT_EXPIRES = '7d';

function signJwt(payload: JwtPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: JWT_EXPIRES });
}

// Exclude password_hash from user object returned to client
type SafeUser = Omit<
  Awaited<ReturnType<typeof prisma.user.findUnique>>,
  'passwordHash'
> & { passwordHash?: never };

function stripPassword<T extends { passwordHash?: string | null }>(user: T): Omit<T, 'passwordHash'> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash: _ph, ...safe } = user;
  return safe;
}

export const authService = {
  async register(data: z.infer<typeof registerSchema>) {
    // Check uniqueness
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      const err = new Error('Email is already registered') as Error & { status: number; code: string; field: string };
      err.status = 409;
      err.code = 'DUPLICATE_EMAIL';
      err.field = 'email';
      throw err;
    }

    const passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        passwordHash,
        phone: data.phone || null,
        city: data.city || null,
        country: data.country || null,
        bio: data.bio || null,
      },
    });

    const token = signJwt({ userId: user.id, email: user.email, role: user.role });
    return { user: stripPassword(user), token };
  },

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    // Always compare even if user not found — constant-time to prevent enumeration
    const dummyHash = '$2a$12$invalidhashfortimingconsistency';
    const hash = user?.passwordHash || dummyHash;
    const valid = await bcrypt.compare(password, hash);

    if (!user || !valid || !user.isActive) {
      const err = new Error('Incorrect email or password') as Error & { status: number; code: string };
      err.status = 401;
      err.code = 'INVALID_CREDENTIALS';
      throw err;
    }

    const token = signJwt({ userId: user.id, email: user.email, role: user.role });
    return { user: stripPassword(user), token };
  },

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      const err = new Error('User not found') as Error & { status: number; code: string };
      err.status = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }
    return stripPassword(user);
  },
};
