# IR-05 — NestJS: CLIP Worker Integration

**Type:** User Story  
**Phase:** 3 — Integration  
**Estimate:** M

## Story

> As a client, I want `POST /images/rank` to return images ranked by semantic similarity to my prompt, so that I can surface the most relevant images for a given query.

## Acceptance Criteria

- [ ] `ImagesService.rank()` calls `ClipProcessService.send('rank', { prompt, images })` and returns the result
- [ ] Successful response is passed through to the client unchanged
- [ ] If the worker returns an `IMAGE_FETCH_FAILED` error, NestJS surfaces `422 IMAGE_FETCH_FAILED`
- [ ] If the worker process has exited or is not ready, NestJS returns `503 CLIP_WORKER_UNAVAILABLE`
- [ ] Any other unexpected error returns `500 INTERNAL_ERROR`

## Error Codes

| HTTP  | Code                      | Trigger                                |
| ----- | ------------------------- | -------------------------------------- |
| `400` | `INVALID_INPUT`           | Validation failure (IR-04)             |
| `422` | `IMAGE_FETCH_FAILED`      | Worker couldn't fetch one or more URLs |
| `503` | `CLIP_WORKER_UNAVAILABLE` | Worker process not ready or has exited |
| `500` | `INTERNAL_ERROR`          | Unexpected error                       |

## Technical Notes

- Depends on IR-03 (CLIP worker fully working with cache) and IR-04 (NestJS module exists)
- `ClipProcessService` is already injected into `ImagesService` from IR-04 — this story wires up the actual call
- No HTTP client, no `CLIP_SERVICE_URL` — communication goes through the child process stdin/stdout
