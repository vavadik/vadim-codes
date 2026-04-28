# IR-03 — Embedding Cache

**Type:** User Story  
**Phase:** 2 — Caching  
**Estimate:** S

## Story

> As a system operator, I want the CLIP service to cache image embeddings keyed by content checksum, so that repeated requests for the same images skip re-encoding and latency drops below 200ms.

## Acceptance Criteria

- [ ] Cache key is the **SHA-256 hash of the raw downloaded image bytes** (computed before resizing)
- [ ] Cache value is the 512-float numpy embedding array
- [ ] On a cache hit the image is not re-downloaded or re-encoded
- [ ] LRU eviction applies when the cache exceeds `CLIP_CACHE_MAX_SIZE` entries (default: 2,000 ≈ 4 MB)
- [ ] `meta.cached` in the `/rank` response reflects the number of embeddings served from cache
- [ ] `meta.encoded` reflects the number of images freshly encoded in that request
- [ ] Cache is in-memory by default (plain dict + LRU wrapper)
- [ ] Cache survives across requests within the same process lifetime
- [ ] Second request for the same 12 image URLs completes in < 200ms

## Technical Notes

- Cache integrates into the `POST /rank` handler added in IR-02
- Checksum is computed on the **original raw bytes**, not the resized image, so the key remains stable across future preprocessing changes

## Future Considerations

- Redis-backed cache for persistence across Python service restarts
- Serialization to disk on shutdown / reload on startup
