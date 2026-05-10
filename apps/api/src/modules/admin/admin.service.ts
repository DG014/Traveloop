import { prisma } from '../../lib/prisma';

export const adminService = {
  async listUsers(page = 1, limit = 20, q?: string) {
    const skip = (page - 1) * limit;
    const where: any = q ? { OR: [{ firstName: { contains: q, mode: 'insensitive' } }, { email: { contains: q, mode: 'insensitive' } }] } : {};
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where, skip, take: limit,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { trips: true } } },
      }),
      prisma.user.count({ where }),
    ]);
    return {
      users: users.map(({ passwordHash: _ph, ...u }) => ({ ...u, tripCount: u._count.trips })),
      total, page, limit,
    };
  },

  async updateUser(adminId: string, userId: string, data: { role?: string; isActive?: boolean }) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) { const e = new Error('User not found') as any; e.status = 404; e.code = 'NOT_FOUND'; throw e; }
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.role !== undefined && { role: data.role }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
    const { passwordHash: _ph, ...safe } = updated;
    return safe;
  },

  async getAnalytics() {
    const [totalUsers, totalTrips, cities] = await Promise.all([
      prisma.user.count(),
      prisma.trip.count({ where: { deletedAt: null } }),
      prisma.tripSection.groupBy({ by: ['cityId'], _count: { id: true }, orderBy: { _count: { id: 'desc' } }, take: 1 }),
    ]);

    const avgTripsPerUser = totalUsers > 0 ? totalTrips / totalUsers : 0;
    const mostPopularCityId = cities[0]?.cityId;
    const mostPopularCity = mostPopularCityId
      ? await prisma.city.findUnique({ where: { id: mostPopularCityId }, select: { id: true, name: true } })
      : null;

    // New users per day — last 30 days via raw aggregation workaround
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentUsers = await prisma.user.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
    });
    const byDay: Record<string, number> = {};
    for (const u of recentUsers) {
      const d = u.createdAt.toISOString().slice(0, 10);
      byDay[d] = (byDay[d] || 0) + 1;
    }
    const newUsersPerDay = Object.entries(byDay).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date));

    // Trip status breakdown
    const allTrips = await prisma.trip.findMany({ where: { deletedAt: null }, select: { startDate: true, endDate: true } });
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tripsByStatus = { planned: 0, ongoing: 0, completed: 0 };
    for (const t of allTrips) {
      const start = new Date(t.startDate); start.setHours(0, 0, 0, 0);
      const end = new Date(t.endDate); end.setHours(23, 59, 59, 999);
      if (start > today) tripsByStatus.planned++;
      else if (end < today) tripsByStatus.completed++;
      else tripsByStatus.ongoing++;
    }

    return { totalUsers, totalTrips, avgTripsPerUser: Math.round(avgTripsPerUser * 100) / 100, mostPopularCity, newUsersPerDay, tripsByStatus };
  },

  async getPopularCities(timeRange = '30d') {
    const days = timeRange === '90d' ? 90 : timeRange === '365d' ? 365 : 30;
    const since = new Date(); since.setDate(since.getDate() - days);
    const grouped = await prisma.tripSection.groupBy({
      by: ['cityId'],
      where: { createdAt: { gte: since }, cityId: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });
    const results = await Promise.all(
      grouped.map(async (g) => {
        const city = g.cityId ? await prisma.city.findUnique({ where: { id: g.cityId } }) : null;
        return { city, sectionCount: g._count.id };
      })
    );
    return results.filter((r) => r.city !== null);
  },

  async getPopularActivities() {
    const grouped = await prisma.sectionActivity.groupBy({
      by: ['activityId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });
    return Promise.all(
      grouped.map(async (g) => {
        const activity = await prisma.activity.findUnique({ where: { id: g.activityId }, include: { city: { select: { name: true } } } });
        return { activity, usageCount: g._count.id };
      })
    );
  },
};
