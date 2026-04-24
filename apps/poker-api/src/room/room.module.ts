import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { RoomController } from './room.controller';
import { RoomGateway } from './room.gateway';
import { RoomScheduler } from './room.scheduler';
import { RoomService } from './room.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [RoomController],
  providers: [RoomService, RoomGateway, RoomScheduler],
  exports: [RoomService],
})
export class RoomModule {}
