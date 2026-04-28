export abstract class BlobStore {
  abstract put(key: string, data: Buffer): Promise<void>;
  abstract get(key: string): Promise<Buffer | null>;
  abstract has(key: string): Promise<boolean>;
  abstract delete(key: string): Promise<void>;
}
