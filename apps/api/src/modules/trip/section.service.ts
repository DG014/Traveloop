import { prisma } from '../../lib/prisma';
import { z } from 'zod';

export const createSectionSchema = z.object({
  title: z.string().min(1).max(255),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  description: z.string().optional(),
  budget: z.number().min(0).optional(),
  cityId: z.string().uuid().optional(),
  sortOrder: z.number().int().optional(),
});

export const updateSectionSchema = createSectionSchema.partial();

export const sectionService = {
  async assertTripOwner(userId: string, tripId: string) {
    const trip = await prisma.trip.findUnique({ where: { id: tripId, deletedAt: null } });
    if (!trip) {
      const e = new Error('Trip not found') as Error & { status: number; code: string };
      e.status = 404; e.code = 'NOT_FOUND'; throw e;
    }
    if (trip.userId !== userId) {
      const e = new Error('Access denied') as Error & { status: number; code: string };
      e.status = 403; e.code = 'FORBIDDEN'; throw e;
    }
    return trip;
  },

  async listSections(userId: string, tripId: string) {
    await sectionService.assertTripOwner(userId, tripId);
    return prisma.tripSection.findMany({
      where: { tripId },
      orderBy: { sortOrder: 'asc' },
      include: { city: { select: { id: true, name: true, country: true } } },
    });
  },

  async createSection(userId: string, tripId: string, data: z.infer<typeof createSectionSchema>) {
    const trip = await sectionService.assertTripOwner(userId, tripId);
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);

    // Validate dates within trip range (PRD §7 Screen 5, task instruction MODULE 5)
    if (start < trip.startDate || end > trip.endDate) {
      const e = new Error('Section dates must be within trip date range') as Error & { status: number; code: string };
      e.status = 422; e.code = 'DATE_RANGE_ERROR'; throw e;
    }
    if (end < start) {
      const e = new Error('Section end date must be on or after start date') as Error & { status: number; code: string };
      e.status = 422; e.code = 'DATE_RANGE_ERROR'; throw e;
    }

    return prisma.tripSection.create({
      data: {
        tripId,
        title: data.title,
        startDate: start,
        endDate: end,
        description: data.description,
        budget: data.budget ?? null,
        cityId: data.cityId,
        sortOrder: data.sortOrder ?? 0,
      },
      include: { city: { select: { id: true, name: true, country: true } } },
    });
  },

  async updateSection(userId: string, tripId: string, sectionId: string, data: z.infer<typeof updateSectionSchema>) {
    const trip = await sectionService.assertTripOwner(userId, tripId);
    const section = await prisma.tripSection.findUnique({ where: { id: sectionId, tripId } });
    if (!section) {
      const e = new Error('Section not found') as Error & { status: number; code: string };
      e.status = 404; e.code = 'NOT_FOUND'; throw e;
    }

    const newStart = data.startDate ? new Date(data.startDate) : section.startDate;
    const newEnd = data.endDate ? new Date(data.endDate) : section.endDate;

    if (newStart < trip.startDate || newEnd > trip.endDate) {
      const e = new Error('Section dates must be within trip date range') as Error & { status: number; code: string };
      e.status = 422; e.code = 'DATE_RANGE_ERROR'; throw e;
    }

    return prisma.tripSection.update({
      where: { id: sectionId },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.startDate && { startDate: newStart }),
        ...(data.endDate && { endDate: newEnd }),
        ...(data.budget !== undefined && { budget: data.budget }),
        ...(data.cityId !== undefined && { cityId: data.cityId }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
      },
      include: { city: { select: { id: true, name: true, country: true } } },
    });
  },

  async deleteSection(userId: string, tripId: string, sectionId: string) {
    await sectionService.assertTripOwner(userId, tripId);
    const section = await prisma.tripSection.findUnique({ where: { id: sectionId, tripId } });
    if (!section) {
      const e = new Error('Section not found') as Error & { status: number; code: string };
      e.status = 404; e.code = 'NOT_FOUND'; throw e;
    }
    // Cascade deletes section_activities via Prisma cascade
    await prisma.tripSection.delete({ where: { id: sectionId } });
    return { message: 'Section deleted' };
  },
};
