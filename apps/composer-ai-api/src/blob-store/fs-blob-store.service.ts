import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import { BlobStore } from './blob-store.abstract.js';

@Injectable()
export class FsBlobStore extends BlobStore {
  private readonly dir: string;

  constructor(config: ConfigService) {
    super();
    this.dir =
      config.get<string>('BLOB_STORE_DIR') ?? path.join(process.cwd(), '.tmp', 'blob-store');
  }

  async put(key: string, data: Buffer): Promise<void> {
    await fs.mkdir(this.dir, { recursive: true });
    await fs.writeFile(path.join(this.dir, key), data);
  }

  async get(key: string): Promise<Buffer | null> {
    try {
      return await fs.readFile(path.join(this.dir, key));
    } catch {
      return null;
    }
  }

  async has(key: string): Promise<boolean> {
    try {
      await fs.access(path.join(this.dir, key));
      return true;
    } catch {
      return false;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await fs.unlink(path.join(this.dir, key));
    } catch {
      // file doesn't exist — nothing to do
    }
  }
}
