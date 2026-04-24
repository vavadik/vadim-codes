import { Injectable } from '@nestjs/common';
import type { DeckName, Participant, Room, RoomState } from '@vadim-codes/poker-contracts';
import { nanoid } from 'nanoid';
import { PrismaService } from '../prisma/prisma.service';

// Deck values per PS-04; special cards (['?','☕','∞']) are appended client-side.
const DECK_VALUES: Record<DeckName, string[]> = {
  fibonacci: ['0', '1', '2', '3', '5', '8', '13', '21', '34', '55', '89'],
  tshirt: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  powersOfTwo: ['1', '2', '4', '8', '16', '32', '64'],
  custom: [],
};

@Injectable()
export class RoomService {
  private readonly rooms = new Map<string, Room>();

  constructor(private readonly prisma: PrismaService) {}

  async createRoom(title = '', deck: DeckName = 'fibonacci'): Promise<Room> {
    const room: Room = {
      id: nanoid(10),
      title,
      currentTask: '',
      deck,
      deckValues: [...DECK_VALUES[deck]],
      isPublicMode: false,
      masterSessionId: null,
      state: 'voting' as RoomState,
      participants: new Map<string, Participant>(),
      lastActivityAt: new Date(),
    };
    this.rooms.set(room.id, room);
    await this.prisma.db.room.create({
      data: {
        id: room.id,
        title: room.title,
        deck: room.deck,
        isPublicMode: room.isPublicMode,
        lastActivityAt: room.lastActivityAt,
      },
    });
    return room;
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  async deleteRoom(roomId: string): Promise<void> {
    this.rooms.delete(roomId);
    await this.prisma.db.room.deleteMany({ where: { id: roomId } });
  }

  async addParticipant(roomId: string, participant: Participant): Promise<Room | undefined> {
    const room = this.rooms.get(roomId);
    if (!room) {
      return undefined;
    }
    room.participants.set(participant.sessionId, participant);
    room.lastActivityAt = new Date();
    this.persistActivity(roomId, room.lastActivityAt);
    return room;
  }

  async removeParticipant(roomId: string, sessionId: string): Promise<Room | undefined> {
    const room = this.rooms.get(roomId);
    if (!room) {
      return undefined;
    }
    room.participants.delete(sessionId);
    room.lastActivityAt = new Date();
    this.persistActivity(roomId, room.lastActivityAt);
    return room;
  }

  async reconnectParticipant(
    roomId: string,
    sessionId: string,
    newSocketId: string
  ): Promise<Room | undefined> {
    const room = this.rooms.get(roomId);
    if (!room) {
      return undefined;
    }
    const participant = room.participants.get(sessionId);
    if (participant) {
      participant.socketId = newSocketId;
    }
    room.lastActivityAt = new Date();
    this.persistActivity(roomId, room.lastActivityAt);
    return room;
  }

  transferMaster(roomId: string, newSessionId: string): Room | undefined {
    const room = this.rooms.get(roomId);
    if (!room || !room.participants.has(newSessionId)) {
      return undefined;
    }
    room.masterSessionId = newSessionId;
    return room;
  }

  setPublicMode(roomId: string, enabled: boolean): Room | undefined {
    const room = this.rooms.get(roomId);
    if (!room) {
      return undefined;
    }
    room.isPublicMode = enabled;
    this.prisma.db.room
      .updateMany({ where: { id: roomId }, data: { isPublicMode: enabled } })
      .catch((err) => console.error('Failed to persist isPublicMode for room', roomId, err));
    return room;
  }

  setTitle(roomId: string, title: string): Room | undefined {
    const room = this.rooms.get(roomId);
    if (!room) {
      return undefined;
    }
    room.title = title.slice(0, 100);
    this.prisma.db.room
      .updateMany({ where: { id: roomId }, data: { title: room.title } })
      .catch((err) => console.error('Failed to persist title for room', roomId, err));
    return room;
  }

  setTask(roomId: string, task: string): Room | undefined {
    const room = this.rooms.get(roomId);
    if (!room) {
      return undefined;
    }
    room.currentTask = task.slice(0, 256);
    return room;
  }

  setDeck(roomId: string, deck: DeckName, customValues?: string[]): Room | undefined {
    const room = this.rooms.get(roomId);
    if (!room) {
      return undefined;
    }
    let deckValues: string[];
    if (deck === 'custom') {
      if (!customValues || customValues.length === 0 || customValues.length > 20) {
        return undefined;
      }
      if (customValues.some((v) => v.length === 0 || v.length > 8)) {
        return undefined;
      }
      deckValues = customValues;
    } else {
      deckValues = [...DECK_VALUES[deck]];
    }
    room.deck = deck;
    room.deckValues = deckValues;
    for (const p of room.participants.values()) {
      p.selectedCard = null;
    }
    room.state = 'voting';
    return room;
  }

  /** Marks a socket as stale. Returns { roomId, sessionId } when a slot was found, null otherwise. */
  markDisconnected(socketId: string): { roomId: string; sessionId: string } | null {
    for (const room of this.rooms.values()) {
      for (const participant of room.participants.values()) {
        if (participant.socketId === socketId) {
          participant.socketId = '';
          const hasLiveSockets = [...room.participants.values()].some((p) => p.socketId !== '');
          if (!hasLiveSockets) {
            room.lastActivityAt = new Date();
            this.persistActivity(room.id, room.lastActivityAt);
          }
          return { roomId: room.id, sessionId: participant.sessionId };
        }
      }
    }
    return null;
  }

  async expireStaleRooms(): Promise<void> {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const stale = await this.prisma.db.room.findMany({
      where: { lastActivityAt: { lt: cutoff } },
    });
    for (const dbRoom of stale) {
      const memRoom = this.rooms.get(dbRoom.id);
      if (memRoom) {
        const hasLive = [...memRoom.participants.values()].some((p) => p.socketId !== '');
        if (hasLive) {
          continue;
        }
        this.rooms.delete(dbRoom.id);
      }
      await this.prisma.db.room.deleteMany({ where: { id: dbRoom.id } });
    }
  }

  private persistActivity(roomId: string, lastActivityAt: Date): void {
    this.prisma.db.room
      .updateMany({ where: { id: roomId }, data: { lastActivityAt } })
      .catch((err) => console.error('Failed to update lastActivityAt for room', roomId, err));
  }
}
