# IR-06 — Health Checks

**Type:** Task  
**Phase:** 3 — Integration  
**Estimate:** XS

## Story

> As an operator, I want health endpoints on both services so that infrastructure monitoring can detect a degraded CLIP backend before real requests are affected.

## Acceptance Criteria

### NestJS — `GET /images/health`

- [ ] Returns `200 OK` when the CLIP service responds to its `/health` successfully
- [ ] Returns `503 Service Unavailable` when the CLIP service is unreachable or unhealthy
- [ ] Response body on success: `{ "status": "ok", "clip_service": "ok" }`
- [ ] Response body on failure: `{ "status": "degraded", "clip_service": "unavailable" }`

### Python CLIP Service — `GET /health` (implemented in IR-01, verified end-to-end here)

- [ ] Returns `200` with `{ "status": "ok", "model_loaded": true }` when model is ready
- [ ] Returns `503` before the model finishes loading
- [ ] Manual smoke test: stop the CLIP service, confirm NestJS `/images/health` returns `503`

## Technical Notes

- Depends on IR-01 (Python `/health` exists) and IR-04 (NestJS Images module exists)
