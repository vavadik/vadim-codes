import { Module } from '@nestjs/common';
import { BlobStore } from './blob-store.abstract.js';
import { FsBlobStore } from './fs-blob-store.service.js';

@Module({
  providers: [{ provide: BlobStore, useClass: FsBlobStore }],
  exports: [BlobStore],
})
export class BlobStoreModule {}
