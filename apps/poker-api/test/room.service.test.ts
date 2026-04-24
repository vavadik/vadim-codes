import { describe, expect, it, vi } from 'vitest';
import { RoomService } from '../src/room/room.service';
import type { PrismaService } from '../src/prisma/prisma.service';

function makeService(): RoomService {
  const prisma = {
    db: {
      room: {
        create: vi.fn().mockResolvedValue({}),
        deleteMany: vi.fn().mockResolvedValue({}),
        updateMany: vi.fn().mockResolvedValue({}),
        findUnique: vi.fn().mockResolvedValue(null),
        findMany: vi.fn().mockResolvedValue([]),
      },
    },
  } as unknown as PrismaService;
  return new RoomService(prisma);
}

describe('RoomService', () => {
  it('createRoom returns a room with a unique id and persists to DB', async () => {
    const service = makeService();
    const room = await service.createRoom('My Room', 'fibonacci');

    expect(room.id).toHaveLength(10);
    expect(room.title).toBe('My Room');
    expect(room.deck).toBe('fibonacci');
    expect(room.state).toBe('voting');
    expect(room.participants.size).toBe(0);
    expect(await service.getRoom(room.id)).toBe(room);
  });

  it('createRoom generates unique IDs for each room', async () => {
    const service = makeService();
    const ids = new Set(
      await Promise.all(Array.from({ length: 10 }, () => service.createRoom().then((r) => r.id)))
    );
    expect(ids.size).toBe(10);
  });

  it('addParticipant adds a participant to the room', async () => {
    const service = makeService();
    const room = await service.createRoom();
    const participant = {
      sessionId: 'sess-1',
      socketId: 'sock-1',
      name: 'Alice',
      selectedCard: null,
    };

    await service.addParticipant(room.id, participant);

    expect(room.participants.size).toBe(1);
    expect(room.participants.get('sess-1')).toEqual(participant);
  });

  it('addParticipant returns undefined for unknown room', async () => {
    const service = makeService();
    const result = await service.addParticipant('no-such-room', {
      sessionId: 's',
      socketId: 'sk',
      name: 'X',
      selectedCard: null,
    });
    expect(result).toBeUndefined();
  });

  it('removeParticipant removes the participant from the room', async () => {
    const service = makeService();
    const room = await service.createRoom();
    await service.addParticipant(room.id, {
      sessionId: 'sess-1',
      socketId: 'sock-1',
      name: 'Alice',
      selectedCard: null,
    });
    await service.addParticipant(room.id, {
      sessionId: 'sess-2',
      socketId: 'sock-2',
      name: 'Bob',
      selectedCard: null,
    });

    await service.removeParticipant(room.id, 'sess-1');

    expect(room.participants.size).toBe(1);
    expect(room.participants.has('sess-1')).toBe(false);
    expect(room.participants.has('sess-2')).toBe(true);
  });

  it('removeParticipant returns undefined for unknown room', async () => {
    const service = makeService();
    expect(await service.removeParticipant('ghost', 'sess')).toBeUndefined();
  });

  it('reconnectParticipant updates socketId without touching other fields', async () => {
    const service = makeService();
    const room = await service.createRoom();
    await service.addParticipant(room.id, {
      sessionId: 'sess-1',
      socketId: 'old-sock',
      name: 'Alice',
      selectedCard: '5',
    });

    await service.reconnectParticipant(room.id, 'sess-1', 'new-sock');

    const p = room.participants.get('sess-1')!;
    expect(p.socketId).toBe('new-sock');
    expect(p.selectedCard).toBe('5');
    expect(p.name).toBe('Alice');
  });

  it('deleteRoom removes the room from the map and deletes from DB', async () => {
    const service = makeService();
    const room = await service.createRoom();
    await service.deleteRoom(room.id);
    expect(await service.getRoom(room.id)).toBeUndefined();
  });

  it('markDisconnected clears socketId for the matching socket', async () => {
    const service = makeService();
    const room = await service.createRoom();
    await service.addParticipant(room.id, {
      sessionId: 'sess-1',
      socketId: 'sock-1',
      name: 'Alice',
      selectedCard: null,
    });

    service.markDisconnected('sock-1');

    expect(room.participants.get('sess-1')!.socketId).toBe('');
  });
});
