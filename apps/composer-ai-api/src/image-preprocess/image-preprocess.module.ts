import { Module } from '@nestjs/common';
import { BlobStoreModule } from '../blob-store/blob-store.module.js';
import { ImagePreprocessService } from './image-preprocess.service.js';

@Module({
  imports: [BlobStoreModule],
  providers: [ImagePreprocessService],
  exports: [ImagePreprocessService],
})
export class ImagePreprocessModule {}
