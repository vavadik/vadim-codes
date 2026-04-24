import { WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import type { Socket } from 'socket.io';
import { RoomService } from './room.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class RoomGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly roomService: RoomService) {}

  handleConnection(_client: Socket): void {
    // Client events handled in Phase 1 (PS-03)
  }

  handleDisconnect(client: Socket): void {
    this.roomService.markDisconnected(client.id);
  }
}
