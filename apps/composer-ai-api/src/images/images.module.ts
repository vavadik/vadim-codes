import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { ClipModule } from '../clip/clip.module.js';
import { ImagePreprocessModule } from '../image-preprocess/image-preprocess.module.js';
import { ImagesController } from './images.controller.js';
import { ImagesService } from './images.service.js';

@Module({
  imports: [AuthModule, ClipModule, ImagePreprocessModule],
  controllers: [ImagesController],
  providers: [ImagesService],
})
export class ImagesModule {}
