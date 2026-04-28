# IR-10 — NestJS: Rank Flow Update

**Type:** Task  
**Phase:** 4 — Node-Side Preprocessing  
**Estimate:** S

## Story

> As a client, I want `POST /images/rank` to preprocess images in Node and rank them via the CLIP worker, so the full flow uses the new preprocessing pipeline.

## Acceptance Criteria

- [ ] `ImagesService.rank()` calls `ImagePreprocessService.prepare(dto.images)` before calling the worker
- [ ] Worker is called with `{ prompt, images: [{ key, data }] }` matching the IR-09 protocol
- [ ] Worker results `key` values are mapped back to original URLs in the response: `{ url, score }[]`
- [ ] `IMAGE_FETCH_FAILED` errors thrown by `ImagePreprocessService` are surfaced as `422 IMAGE_FETCH_FAILED`
- [ ] `503 CLIP_WORKER_UNAVAILABLE` and `500 INTERNAL_ERROR` handling remain unchanged
- [ ] `ImagesModule` imports `ImagePreprocessModule`

## Technical Notes

- `WorkerRankResult.results` type changes from `{ url: string; score: number }[]` to `{ key: string; score: number }[]`
- Key → URL mapping: build a `Map<key, url>` from the output of `ImagePreprocessService.prepare()` before calling the worker
- Depends on IR-08 and IR-09
