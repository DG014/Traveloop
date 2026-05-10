import { prisma } from '../../lib/prisma';

const viewedSessions = new Map<string, boolean>();

export const communityService = {
  async listPosts(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [posts, total] = await Promise.all([
      prisma.communityPost.findMany({
        skip, take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          trip: { select: { id: true, title: true, startDate: true, endDate: true, publicSlug: true, coverPhoto: true } },
          user: { select: { id: true, firstName: true, lastName: true, profilePhoto: true } },
        },
      }),
      prisma.communityPost.count(),
    ]);
    return { posts, total, page, limit };
  },

  async getPublicTrip(slug: string, sessionId: string) {
    const post = await prisma.communityPost.findFirst({
      where: { trip: { publicSlug: slug, isPublic: true } },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, profilePhoto: true } },
        trip: {
          include: {
            sections: {
              orderBy: { sortOrder: 'asc' },
              include: { city: true, activities: { orderBy: [{ dayNumber: 'asc' }], include: { activity: true } } },
            },
          },
        },
      },
    });
    if (!post) {
      const e = new Error('Trip not found') as Error & { status: number; code: string };
      e.status = 404; e.code = 'NOT_FOUND'; throw e;
    }
    const sessionKey = `${sessionId}:${slug}`;
    if (!viewedSessions.has(sessionKey)) {
      viewedSessions.set(sessionKey, true);
      await prisma.communityPost.update({ where: { id: post.id }, data: { viewCount: { increment: 1 } } });
      post.viewCount += 1;
    }
    return { post, trip: post.trip };
  },
};
