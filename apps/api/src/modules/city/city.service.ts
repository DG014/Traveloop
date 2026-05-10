import { prisma } from '../../lib/prisma';
import { z } from 'zod';

export const addActivitySchema = z.object({
  activityId: z.string().uuid(),
  dayNumber: z.number().int().min(1).optional(),
  scheduledTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  actualCost: z.number().min(0).optional(),
  notes: z.string().optional(),
});

export const updateActivitySchema = addActivitySchema.partial().omit({ activityId: true });

export const cityService = {
  async listCities(query: {
    q?: string; region?: string; country?: string;
    costIndex?: string; sort?: string; page?: number; limit?: number;
  }) {
    const { q, region, country, costIndex, sort, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (q) where.name = { contains: q, mode: 'insensitive' };
    if (region) where.region = { contains: region, mode: 'insensitive' };
    if (country) where.country = { contains: country, mode: 'insensitive' };
    if (costIndex) where.costIndex = costIndex;

    const orderBy: any = sort === 'popular' ? { popularityRank: 'asc' } : { name: 'asc' };

    const [cities, total] = await Promise.all([
      prisma.city.findMany({ where, orderBy, skip, take: limit }),
      prisma.city.count({ where }),
    ]);

    return { cities, total, page, limit };
  },

  async getCityById(cityId: string) {
    const city = await prisma.city.findUnique({
      where: { id: cityId },
      include: { _count: { select: { activities: true } } },
    });
    if (!city) {
      const e = new Error('City not found') as Error & { status: number; code: string };
      e.status = 404; e.code = 'NOT_FOUND'; throw e;
    }
    return city;
  },

  async getCitySuggestions(cityId: string) {
    await cityService.getCityById(cityId);
    // Top 6 activities by avg_cost ASC for this city
    return prisma.activity.findMany({
      where: { cityId },
      orderBy: { avgCost: 'asc' },
      take: 6,
    });
  },

  async listActivities(query: {
    q?: string; category?: string; maxCost?: number; cityId?: string;
    page?: number; limit?: number;
  }) {
    const { q, category, maxCost, cityId, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (q) where.name = { contains: q, mode: 'insensitive' };
    if (category) where.category = category;
    if (maxCost) where.avgCost = { lte: maxCost };
    if (cityId) where.cityId = cityId;

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({ where, skip, take: limit, include: { city: { select: { name: true, country: true } } } }),
      prisma.activity.count({ where }),
    ]);

    return { activities, total, page, limit };
  },

  async addActivityToSection(
    userId: string, tripId: string, sectionId: string,
    data: z.infer<typeof addActivitySchema>
  ) {
    // Verify ownership
    const trip = await prisma.trip.findUnique({ where: { id: tripId, deletedAt: null } });
    if (!trip || trip.userId !== userId) {
      const e = new Error('Access denied') as Error & { status: number; code: string };
      e.status = 403; e.code = 'FORBIDDEN'; throw e;
    }
    const section = await prisma.tripSection.findUnique({ where: { id: sectionId, tripId } });
    if (!section) {
      const e = new Error('Section not found') as Error & { status: number; code: string };
      e.status = 404; e.code = 'NOT_FOUND'; throw e;
    }
    const activity = await prisma.activity.findUnique({ where: { id: data.activityId } });
    if (!activity) {
      const e = new Error('Activity not found') as Error & { status: number; code: string };
      e.status = 404; e.code = 'NOT_FOUND'; throw e;
    }

    return prisma.sectionActivity.create({
      data: {
        sectionId,
        activityId: data.activityId,
        dayNumber: data.dayNumber,
        scheduledTime: data.scheduledTime,
        actualCost: data.actualCost,
        notes: data.notes,
      },
      include: { activity: true },
    });
  },

  async updateSectionActivity(
    userId: string, tripId: string, sectionId: string, actId: string,
    data: z.infer<typeof updateActivitySchema>
  ) {
    const trip = await prisma.trip.findUnique({ where: { id: tripId, deletedAt: null } });
    if (!trip || trip.userId !== userId) {
      const e = new Error('Access denied') as Error & { status: number; code: string };
      e.status = 403; e.code = 'FORBIDDEN'; throw e;
    }

    return prisma.sectionActivity.update({
      where: { id: actId },
      data: {
        ...(data.dayNumber !== undefined && { dayNumber: data.dayNumber }),
        ...(data.scheduledTime !== undefined && { scheduledTime: data.scheduledTime }),
        ...(data.actualCost !== undefined && { actualCost: data.actualCost }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
      include: { activity: true },
    });
  },

  async removeSectionActivity(userId: string, tripId: string, sectionId: string, actId: string) {
    const trip = await prisma.trip.findUnique({ where: { id: tripId, deletedAt: null } });
    if (!trip || trip.userId !== userId) {
      const e = new Error('Access denied') as Error & { status: number; code: string };
      e.status = 403; e.code = 'FORBIDDEN'; throw e;
    }
    await prisma.sectionActivity.delete({ where: { id: actId } });
    return { message: 'Activity removed' };
  },
};
