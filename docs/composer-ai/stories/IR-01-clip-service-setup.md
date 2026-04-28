# IR-01 — Python CLIP Worker: Setup & Ready Signal

**Type:** Task  
**Phase:** 0 — Foundation  
**Estimate:** S

## Story

> As a developer, I want a Python script that loads the CLIP model at startup and communicates over stdin/stdout, so that NestJS can spawn it as a managed child process and interact with it via JSON IPC.

## Acceptance Criteria

- [ ] `clip_worker.py` starts without errors and loads the CLIP model
- [ ] Once the model is loaded, the script writes `{"type": "ready", "model": "<model_name>"}` to stdout and flushes
- [ ] Script then enters a request loop: reads newline-delimited JSON from stdin, writes newline-delimited JSON responses to stdout
- [ ] `health` method returns `{"status": "ok", "model_loaded": true}`
- [ ] Unknown methods return `{"id": "<id>", "error": "unknown method: <method>"}`
- [ ] Script reads configuration from environment variables:
  - `CLIP_MODEL_NAME` (default: `clip-ViT-B-32`)
  - `CLIP_CACHE_MAX_SIZE` (default: `2000`)
- [ ] Memory footprint with model loaded is under 1 GB

## IPC Protocol

**Request** (NestJS → Python, one JSON line per request):

```json
{ "id": "uuid", "method": "health | rank", "params": { ... } }
```

**Response** (Python → NestJS, one JSON line per response):

```json
{ "id": "uuid", "result": { ... } }
{ "id": "uuid", "error": "message" }
```

**Ready signal** (written once at startup, before the request loop):

```json
{ "type": "ready", "model": "clip-ViT-B-32" }
```

## Technical Notes

- Use `sentence-transformers` for CLIP encoding
- Use `Pillow` for image I/O (needed in IR-02)
- No GPU required; CPU-only runtime
- Script lives at `apps/clip-service/clip_worker.py`
- NestJS spawns it via `ClipProcessService` (see IR-01 NestJS side)
- `CLIP_WORKER_PATH` env var tells NestJS where the script is
