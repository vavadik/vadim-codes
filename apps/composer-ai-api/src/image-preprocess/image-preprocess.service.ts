import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { Readable } from 'stream';
import sharp from 'sharp';
import { BlobStore } from '../blob-store/blob-store.abstract.js';

@Injectable()
export class ImagePreprocessService {
  constructor(private readonly blobStore: BlobStore) {}

  async prepare(urls: string[]): Promise<{ key: string; data: string }[]> {
    return Promise.all(urls.map((url) => this.preprocessOne(url)));
  }

  private async preprocessOne(url: string): Promise<{ key: string; data: string }> {
    const key = createHash('sha256').update(url).digest('hex');

    const cached = await this.blobStore.get(key);
    if (cached) {
      return { key, data: cached.toString('base64') };
    }

    let buffer: Buffer;
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (!response.ok || !response.body) {
        throw new Error('fetch failed');
      }

      const nodeStream = Readable.fromWeb(response.body as Parameters<typeof Readable.fromWeb>[0]);
      const pipeline = sharp()
        .flatten({ background: '#fff' })
        .resize(256, 256, { fit: 'outside' })
        .jpeg();

      nodeStream.pipe(pipeline);
      buffer = await pipeline.toBuffer();
    } catch {
      throw new Error(`IMAGE_FETCH_FAILED: ${url}`);
    }

    await this.blobStore.put(key, buffer);
    return { key, data: buffer.toString('base64') };
  }
}
