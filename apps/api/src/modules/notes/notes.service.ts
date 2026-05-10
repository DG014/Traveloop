import { prisma } from '../../lib/prisma';
import { z } from 'zod';

export const createNoteSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  title: z.string().max(255).optional(),
  dayNumber: z.number().int().min(1).optional(),
  sectionId: z.string().uuid().optional(),
});

export const updateNoteSchema = createNoteSchema.partial();

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
}

export const notesService = {
  async listNotes(userId: string, tripId: string, query: { dayNumber?: number; sectionId?: string }) {
    await assertTripOwner(userId, tripId);
    const where: any = { tripId };
    // dayNumber takes priority over sectionId per contract §3
    if (query.dayNumber !== undefined) {
      where.dayNumber = query.dayNumber;
    } else if (query.sectionId) {
      where.sectionId = query.sectionId;
    }
    return prisma.tripNote.findMany({ where, orderBy: { createdAt: 'desc' } });
  },

  async createNote(userId: string, tripId: string, data: z.infer<typeof createNoteSchema>) {
    await assertTripOwner(userId, tripId);
    return prisma.tripNote.create({
      data: {
        tripId,
        content: data.content,
        title: data.title,
        dayNumber: data.dayNumber,
        sectionId: data.sectionId,
      },
    });
  },

  async updateNote(userId: string, tripId: string, noteId: string, data: z.infer<typeof updateNoteSchema>) {
    await assertTripOwner(userId, tripId);
    const note = await prisma.tripNote.findUnique({ where: { id: noteId, tripId } });
    if (!note) {
      const e = new Error('Note not found') as Error & { status: number; code: string };
      e.status = 404; e.code = 'NOT_FOUND'; throw e;
    }
    return prisma.tripNote.update({
      where: { id: noteId },
      data: {
        ...(data.content && { content: data.content }),
        ...(data.title !== undefined && { title: data.title }),
        ...(data.dayNumber !== undefined && { dayNumber: data.dayNumber }),
        ...(data.sectionId !== undefined && { sectionId: data.sectionId }),
      },
    });
  },

  async deleteNote(userId: string, tripId: string, noteId: string) {
    await assertTripOwner(userId, tripId);
    await prisma.tripNote.delete({ where: { id: noteId } });
    return { message: 'Note deleted' };
  },
};
