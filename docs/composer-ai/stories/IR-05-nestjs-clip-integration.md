# IR-05 — NestJS: CLIP Service Integration

**Type:** User Story  
**Phase:** 3 — Integration  
**Estimate:** M

## Story

> As a client, I want `POST /images/rank` to return images ranked by semantic similarity to my prompt, so that I can surface the most relevant images for a given query.

## Acceptance Criteria

- [ ] `ImagesService` calls the Python CLIP service at `POST /rank` via `HttpModule` (axios)
- [ ] CLIP service base URL is read from the `CLIP_SERVICE_URL` environment variable
- [ ] Request timeout is read from `CLIP_SERVICE_TIMEOUT_MS` (default: `10000` ms)
- [ ] Successful CLIP response is passed through to the client unchanged
- [ ] If the CLIP service returns `422`, NestJS surfaces `422 IMAGE_FETCH_FAILED`
- [ ] If the CLIP service times out, NestJS returns `504 CLIP_SERVICE_TIMEOUT`
- [ ] Any other CLIP service error returns `500 INTERNAL_ERROR`

## Error Codes

| HTTP  | Code                   | Trigger                              |
| ----- | ---------------------- | ------------------------------------ |
| `400` | `INVALID_INPUT`        | Validation failure (IR-04)           |
| `422` | `IMAGE_FETCH_FAILED`   | CLIP service couldn't fetch a URL    |
| `504` | `CLIP_SERVICE_TIMEOUT` | CLIP service did not respond in time |
| `500` | `INTERNAL_ERROR`       | Unexpected error                     |

## Technical Notes

- Depends on IR-03 (CLIP service fully working with cache) and IR-04 (NestJS module exists)
