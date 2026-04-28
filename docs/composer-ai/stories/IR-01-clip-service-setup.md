# IR-01 — Python CLIP Service: Setup & Health

**Type:** Task  
**Phase:** 0 — Foundation  
**Estimate:** S

## Story

> As a developer, I want a Python FastAPI microservice that loads the CLIP model at startup and exposes a health endpoint, so that NestJS has a stable ML backend to call.

## Acceptance Criteria

- [ ] FastAPI app with uvicorn starts without errors
- [ ] CLIP model (`openai/clip-vit-base-patch32`) is loaded once at startup into memory
- [ ] `GET /health` returns `200 OK` with `{ "status": "ok", "model_loaded": true }`
- [ ] `GET /health` returns `503` if the model is not yet loaded
- [ ] Service reads configuration from environment variables:
  - `CLIP_MODEL_NAME` (default: `openai/clip-vit-base-patch32`)
  - `CLIP_CACHE_MAX_SIZE` (default: `2000`)
- [ ] Memory footprint with model loaded is under 1 GB

## Technical Notes

- Use `sentence-transformers` or `transformers` + `torch` for CLIP encoding
- Use `Pillow` for image I/O (needed in IR-02)
- No GPU required; CPU-only runtime
- Service lives in `apps/clip-service/` (or equivalent path in the repo)
- Load model inside a `lifespan` handler so startup failure is visible immediately
