# IR-07 — BlobStore: Abstraction & Filesystem Implementation

**Type:** Task  
**Phase:** 4 — Node-Side Preprocessing  
**Estimate:** S

## Story

> As a NestJS service, I want a key-value store for binary blobs, so that preprocessed image data can be cached and reused across requests without re-downloading or re-processing the same image.

## Acceptance Criteria

- [ ] `IBlobStore` interface defines `put(key: string, data: Buffer): Promise<void>`, `get(key: string): Promise<Buffer | null>`, `has(key: string): Promise<boolean>`, `delete(key: string): Promise<void>`
- [ ] `FsBlobStore` writes each blob as a file named by its key under a configurable directory
- [ ] Directory is read from `BLOB_STORE_DIR` env var; defaults to `.tmp/blob-store` relative to the project root
- [ ] Directory is created on first write if it does not exist
- [ ] `BlobStoreModule` provides `FsBlobStore` under the `IBlobStore` injection token and exports it
- [ ] `.tmp/` is added to `.gitignore`

## Technical Notes

- No TTL or eviction in this story — blob files persist until manually cleared
- Keys must be valid filenames; callers are responsible for sanitisation (e.g. hex digests are safe)
- Lives at `apps/composer-ai-api/src/blob-store/`
