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

  private persistActivity(roomId: string, lastActivityAt: Date): void {
    this.prisma.db.room
      .updateMany({ where: { id: roomId }, data: { lastActivityAt } })
      .catch((err) => console.error('Failed to update lastActivityAt for room', roomId, err));
  }
}
