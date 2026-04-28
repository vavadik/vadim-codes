# IR-08 — Image Preprocessing Service (Node.js + Sharp)

**Type:** User Story  
**Phase:** 4 — Node-Side Preprocessing  
**Estimate:** S

## Story

> As the rank endpoint, I want images to be downloaded, converted, and resized in Node.js before being sent to the Python worker, so that the Python worker is responsible only for CLIP encoding and ranking.

## Acceptance Criteria

- [ ] `ImagePreprocessService.prepare(urls: string[]): Promise<{ key: string; data: string }[]>` is the single entry point
- [ ] Key for each URL is the SHA-256 hex digest of the URL string
- [ ] If a key already exists in `IBlobStore`, download and resize are skipped (cache hit); the stored buffer is returned as base64
- [ ] Download uses a streaming HTTP GET with a 5 s timeout; non-2xx responses and network errors throw `IMAGE_FETCH_FAILED: <url>`
- [ ] Each downloaded image is converted to 3-channel RGB and resized to 256 px on the shortest side preserving aspect ratio using Sharp
- [ ] Output buffer is JPEG, base64-encoded
- [ ] Processed buffer is written to `IBlobStore` under the image's key before returning
- [ ] `ImagePreprocessModule` imports `BlobStoreModule` and exports `ImagePreprocessService`

## Technical Notes

- Sharp resize: `.resize(256, 256, { fit: 'outside' }).toFormat('jpeg')`; chain `.flatten({ background: '#fff' })` before to strip alpha before RGB conversion
- CLIP processor applies its own 224 × 224 centre-crop internally; Node only needs to produce the 256 px input
- Lives at `apps/composer-ai-api/src/image-preprocess/`
- Depends on IR-07 (`IBlobStore`)
