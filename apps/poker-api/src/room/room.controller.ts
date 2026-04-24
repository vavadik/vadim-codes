import { Controller } from '@nestjs/common';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import { contract } from '@vadim-codes/poker-contracts';
import { RoomService } from './room.service';

@Controller()
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @TsRestHandler(contract.room.listOwnedRooms)
  listOwnedRooms() {
    return tsRestHandler(contract.room.listOwnedRooms, async ({ headers }) => {
      const rooms = await this.roomService.listOwnedRooms(headers['x-session-id']);
      return {
        status: 200 as const,
        body: rooms.map((r) => ({ ...r, lastActivityAt: r.lastActivityAt.toISOString() })),
      };
    });
  }

  @TsRestHandler(contract.room.createRoom)
  createRoom() {
    return tsRestHandler(contract.room.createRoom, async ({ body }) => {
      const room = await this.roomService.createRoom(body.title, body.deck);
      return {
        status: 201 as const,
        body: { id: room.id, inviteUrl: `/room/${room.id}` },
      };
    });
  }

  @TsRestHandler(contract.room.deleteRoom)
  deleteRoom() {
    return tsRestHandler(contract.room.deleteRoom, async ({ params, headers }) => {
      const room = await this.roomService.getRoom(params.id);
      if (!room) {
        return { status: 404 as const, body: { message: 'Room not found' } };
      }
      if (room.masterSessionId !== headers['x-session-id']) {
        return { status: 403 as const, body: { message: 'Forbidden' } };
      }
      await this.roomService.deleteRoom(params.id);
      return { status: 204 as const, body: undefined };
    });
  }
}
