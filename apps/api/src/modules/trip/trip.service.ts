import { z } from 'zod';
import { prisma } from '../../lib/prisma';

// Trip status computed from dates per PRD §7 Screen 6
export function computeTripStatus(startDate: Date, endDate: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  if (start > today) return 'planned';
  if (end < today) return 'completed';
  return 'ongoing';
}

export const createTripSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  description: z.string().optional(),
  totalBudget: z.number().min(0).optional(),
  coverPhoto: z.string().optional(),
});

export const updateTripSchema = createTripSchema.partial().extend({ title: z.string().optional() });

export const tripService = {
  async listTrips(userId: string, status?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where = { userId, deletedAt: null as null };

    const [trips, total] = await Promise.all([
      prisma.trip.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { sections: true } } },
      }),
      prisma.trip.count({ where }),
    ]);

    const tripsWithStatus = trips
      .map((t) => ({ ...t, computedStatus: computeTripStatus(t.startDate, t.endDate) }))
      .filter((t) => !status || t.computedStatus === status);

    return { trips: tripsWithStatus, total, page, limit };
  },

  async createTrip(userId: string, data: z.infer<typeof createTripSchema>) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    if (end < start) {
      const e = new Error('End date must be on or after start date') as Error & { status: number; code: string };
      e.status = 422; e.code = 'DATE_RANGE_ERROR'; throw e;
    }

    const trip = await prisma.trip.create({
      data: {
        userId,
        title: data.title,
        startDate: start,
        endDate: end,
        description: data.description,
        totalBudget: data.totalBudget ? data.totalBudget : null,
        coverPhoto: data.coverPhoto,
      },
      include: { _count: { select: { sections: true } } },
    });

    return { ...trip, computedStatus: computeTripStatus(trip.startDate, trip.endDate) };
  },

  async getTrip(userId: string, tripId: string) {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId, deletedAt: null },
      include: { _count: { select: { sections: true } } },
    });
    if (!trip) {
      const e = new Error('Trip not found') as Error & { status: number; code: string };
      e.status = 404; e.code = 'NOT_FOUND'; throw e;
    }
    if (trip.userId !== userId) {
      const e = new Error('Access denied') as Error & { status: number; code: string };
      e.status = 403; e.code = 'FORBIDDEN'; throw e;
    }
    return {
      ...trip,
      sectionCount: trip._count.sections,
      computedStatus: computeTripStatus(trip.startDate, trip.endDate),
    };
  },

  async updateTrip(userId: string, tripId: string, data: z.infer<typeof updateTripSchema>) {
    await tripService.getTrip(userId, tripId); // validates ownership

    if (data.startDate && data.endDate) {
      if (new Date(data.endDate) < new Date(data.startDate)) {
        const e = new Error('End date must be on or after start date') as Error & { status: number; code: string };
        e.status = 422; e.code = 'DATE_RANGE_ERROR'; throw e;
      }
    }

    const updated = await prisma.trip.update({
      where: { id: tripId },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.startDate && { startDate: new Date(data.startDate) }),
        ...(data.endDate && { endDate: new Date(data.endDate) }),
        ...(data.totalBudget !== undefined && { totalBudget: data.totalBudget }),
        ...(data.coverPhoto !== undefined && { coverPhoto: data.coverPhoto }),
      },
      include: { _count: { select: { sections: true } } },
    });

    return { ...updated, computedStatus: computeTripStatus(updated.startDate, updated.endDate) };
  },

  async softDeleteTrip(userId: string, tripId: string) {
    await tripService.getTrip(userId, tripId); // validates ownership
    await prisma.trip.update({
      where: { id: tripId },
      data: { deletedAt: new Date() },
    });
    return { message: 'Trip deleted' };
  },

  async getItinerary(userId: string, tripId: string) {
    await tripService.getTrip(userId, tripId);
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        sections: {
          orderBy: { sortOrder: 'asc' },
          include: {
            city: true,
            activities: {
              orderBy: [{ dayNumber: 'asc' }, { scheduledTime: 'asc' }],
              include: { activity: true },
            },
          },
        },
      },
    });
    return trip;
  },

  async copyTrip(userId: string, slug: string) {
    const original = await prisma.trip.findFirst({
      where: { publicSlug: slug, isPublic: true, deletedAt: null },
      include: {
        sections: {
          include: { activities: true },
        },
        communityPosts: { take: 1 },
      },
    });
    if (!original) {
      const e = new Error('Public trip not found') as Error & { status: number; code: string };
      e.status = 404; e.code = 'NOT_FOUND'; throw e;
    }

    // Deep copy in transaction
    const newTrip = await prisma.$transaction(async (tx) => {
      const copy = await tx.trip.create({
        data: {
          userId,
          title: `Copy of ${original.title}`,
          description: original.description,
          coverPhoto: original.coverPhoto,
          startDate: original.startDate,
          endDate: original.endDate,
          totalBudget: original.totalBudget,
          status: 'planned',
          isPublic: false,
        },
      });

      for (const section of original.sections) {
        const newSection = await tx.tripSection.create({
          data: {
            tripId: copy.id,
            cityId: section.cityId,
            title: section.title,
            description: section.description,
            startDate: section.startDate,
            endDate: section.endDate,
            budget: section.budget,
            sortOrder: section.sortOrder,
          },
        });

        for (const activity of section.activities) {
          await tx.sectionActivity.create({
            data: {
              sectionId: newSection.id,
              activityId: activity.activityId,
              dayNumber: activity.dayNumber,
              scheduledTime: activity.scheduledTime,
              actualCost: activity.actualCost,
              notes: activity.notes,
            },
          });
        }
      }

      // Increment copy_count on community post
      if (original.communityPosts[0]) {
        await tx.communityPost.update({
          where: { id: original.communityPosts[0].id },
          data: { copyCount: { increment: 1 } },
        });
      }

      return copy;
    });

    return newTrip;
  },

  async publishTrip(userId: string, tripId: string) {
    await tripService.getTrip(userId, tripId);
    const { nanoid } = await import('nanoid');
    const slug = nanoid(10);

    const [trip] = await prisma.$transaction([
      prisma.trip.update({
        where: { id: tripId },
        data: { isPublic: true, publicSlug: slug },
      }),
      prisma.communityPost.upsert({
        where: { tripId_userId: { tripId, userId } } as any,
        create: { tripId, userId },
        update: {},
      }),
    ]);

    return { publicSlug: trip.publicSlug };
  },

  async unpublishTrip(userId: string, tripId: string) {
    await tripService.getTrip(userId, tripId);
    await prisma.$transaction([
      prisma.trip.update({
        where: { id: tripId },
        data: { isPublic: false, publicSlug: null },
      }),
      prisma.communityPost.deleteMany({ where: { tripId } }),
    ]);
    return { message: 'Trip unpublished' };
  },
};
