import { z } from 'zod';
import { prisma } from '../../lib/prisma';

export const updateUserSchema = z.object({
  firstName: z.string().min(2).max(100).optional(),
  lastName: z.string().min(2).max(100).optional(),
  phone: z.string().regex(/^\d{7,15}$/).optional().or(z.literal('')),
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  bio: z.string().optional(),
});

function stripPassword<T extends { passwordHash?: string | null }>(user: T) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash: _ph, ...safe } = user;
  return safe;
}

export const userService = {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      const e = new Error('User not found') as Error & { status: number; code: string };
      e.status = 404; e.code = 'NOT_FOUND'; throw e;
    }
    return stripPassword(user);
  },

  async updateProfile(userId: string, data: z.infer<typeof updateUserSchema>) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.firstName && { firstName: data.firstName }),
        ...(data.lastName && { lastName: data.lastName }),
        ...(data.phone !== undefined && { phone: data.phone || null }),
        ...(data.city !== undefined && { city: data.city }),
        ...(data.country !== undefined && { country: data.country }),
        ...(data.bio !== undefined && { bio: data.bio }),
      },
    });
    return stripPassword(user);
  },

  async updatePhoto(userId: string, photoPath: string) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { profilePhoto: photoPath },
    });
    return { profilePhoto: user.profilePhoto };
  },
};
