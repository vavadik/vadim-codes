import { Module } from '@nestjs/common';
import { ClipProcessService } from './clip-process.service';

@Module({
  providers: [ClipProcessService],
  exports: [ClipProcessService],
})
export class ClipModule {}
