# IR-06 — Health Checks

**Type:** Task  
**Phase:** 3 — Integration  
**Estimate:** XS

## Story

> As an operator, I want a health endpoint on NestJS that reflects whether the CLIP worker is ready, so that infrastructure monitoring can detect a degraded backend before real requests are affected.

## Acceptance Criteria

### NestJS — `GET /images/health`

- [ ] Returns `200 OK` when `ClipProcessService.isReady` is `true` and the worker responds to a `health` IPC call
- [ ] Returns `503 Service Unavailable` when the worker is not ready or the `health` call fails
- [ ] Response body on success: `{ "status": "ok", "clip_worker": "ok" }`
- [ ] Response body on failure: `{ "status": "degraded", "clip_worker": "unavailable" }`

### CLIP Worker — `health` method (implemented in IR-01, verified end-to-end here)

- [ ] Worker responds to `{"method": "health"}` with `{"result": {"status": "ok", "model_loaded": true}}`
- [ ] Manual smoke test: kill the worker process, confirm `GET /images/health` returns `503`

## Technical Notes

- Depends on IR-01 (worker has `health` method) and IR-04 (NestJS Images module exists)
- No separate Python HTTP server — health is checked via the same IPC channel used for ranking
