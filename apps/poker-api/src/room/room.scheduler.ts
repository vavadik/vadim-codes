import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RoomService } from './room.service';

@Injectable()
export class RoomScheduler {
  constructor(private readonly roomService: RoomService) {}

  @Cron(CronExpression.EVERY_30_MINUTES)
  async handleExpiry(): Promise<void> {
    await this.roomService.expireStaleRooms();
  }
}
