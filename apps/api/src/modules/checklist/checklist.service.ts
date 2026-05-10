import { prisma } from '../../lib/prisma';
import { z } from 'zod';

export const createChecklistItemSchema = z.object({
  itemName: z.string().min(1, 'Item name is required').max(255),
  category: z.enum(['documents', 'clothing', 'electronics', 'misc']).optional(),
});

export const toggleItemSchema = z.object({
  isPacked: z.boolean(),
});

async function assertTripOwner(userId: string, tripId: string) {
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
}

export const checklistService = {
  async getChecklist(userId: string, tripId: string) {
    await assertTripOwner(userId, tripId);
    const items = await prisma.packingItem.findMany({
      where: { tripId },
      orderBy: [{ category: 'asc' }, { createdAt: 'asc' }],
    });

    const packed = items.filter((i) => i.isPacked).length;
    const total = items.length;

    const byCategory: Record<string, typeof items> = {
      documents: [], clothing: [], electronics: [], misc: [],
    };
    for (const item of items) {
      const cat = item.category || 'misc';
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(item);
    }

    return { items, progress: { packed, total }, byCategory };
  },

  async addItem(userId: string, tripId: string, data: z.infer<typeof createChecklistItemSchema>) {
    await assertTripOwner(userId, tripId);
    return prisma.packingItem.create({
      data: { tripId, itemName: data.itemName, category: data.category },
    });
  },

  async toggleItem(userId: string, tripId: string, itemId: string, isPacked: boolean) {
    await assertTripOwner(userId, tripId);
    const item = await prisma.packingItem.findUnique({ where: { id: itemId, tripId } });
    if (!item) {
      const e = new Error('Item not found') as Error & { status: number; code: string };
      e.status = 404; e.code = 'NOT_FOUND'; throw e;
    }
    return prisma.packingItem.update({ where: { id: itemId }, data: { isPacked } });
  },

  async deleteItem(userId: string, tripId: string, itemId: string) {
    await assertTripOwner(userId, tripId);
    await prisma.packingItem.delete({ where: { id: itemId } });
    return { message: 'Item deleted' };
  },

  async resetChecklist(userId: string, tripId: string) {
    await assertTripOwner(userId, tripId);
    const result = await prisma.packingItem.updateMany({
      where: { tripId },
      data: { isPacked: false },
    });
    return { message: 'Checklist reset', count: result.count };
  },
};
