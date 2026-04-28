# Image Ranking API — Feature Requirements Document

|             |                |
| ----------- | -------------- |
| **Version** | 1.0            |
| **Status**  | Draft          |
| **Date**    | April 28, 2025 |
| **Owner**   | Engineering    |

---

## 1. Overview

This document defines the requirements for an image ranking feature exposed as a REST API endpoint within a NestJS application. The feature accepts a set of remote image URLs and a natural language text prompt, and returns the images ranked by semantic similarity to the prompt.

The ranking engine is powered by **CLIP** (Contrastive Language-Image Pre-training), a vision-language model purpose-built for matching images to text — without the overhead of a general-purpose LLM. A lightweight Python microservice handles all ML processing, keeping the NestJS layer stateless and clean.

---

## 2. Goals & Non-Goals

### 2.1 Goals

- Rank a set of remote images against a text prompt by semantic similarity
- Return ranked filenames with associated similarity scores
- Minimize latency and cost via embedding caching keyed by image checksum
- Keep NestJS stateless — delegate all ML work to the Python CLIP service
- Support hundreds of runs per day on modest infrastructure (CPU-only)

### 2.2 Non-Goals

- Image storage, upload, or CDN management
- Fine-tuning or retraining the CLIP model
- General image classification or object detection
- User authentication / authorization (handled upstream)
- Support for video or audio content

---

## 3. System Architecture

The feature is split across two services communicating over HTTP:

| Component        | Technology          | Responsibility                                                                   |
| ---------------- | ------------------- | -------------------------------------------------------------------------------- |
| **API Layer**    | NestJS (TypeScript) | Receives requests, validates input, calls CLIP service, returns ranked results   |
| **CLIP Service** | Python + FastAPI    | Downloads images, encodes via CLIP, computes similarity, manages embedding cache |

### 3.1 Request Flow

```
Client
  │
  │  POST /images/rank
  │  { urls: [...], prompt: "..." }
  ▼
NestJS API
  │  Validates input
  │  Forwards to CLIP service
  ▼
Python CLIP Service
  │
  ├─ For each image URL:
  │    ├─ Compute checksum (SHA-256)
  │    ├─ Cache hit?  → reuse embedding
  │    └─ Cache miss? → download → resize → encode → cache
  │
  ├─ Encode text prompt
  │
  └─ Cosine similarity → rank results
  │
  ▼
NestJS API
  │  Returns ranked list
  ▼
Client
  { results: [{ filename, score }, ...] }
```

### 3.2 Deployment Options

The Python CLIP service can be deployed in one of two ways. The choice does not affect the API contract.

| Option                            | Best For                           | Notes                                                                      |
| --------------------------------- | ---------------------------------- | -------------------------------------------------------------------------- |
| **Same server, separate process** | Simple setups, low ops overhead    | Communicate via localhost HTTP. Start Python service as a sidecar process. |
| **Separate Docker container**     | Production, scalability, isolation | Communicate via internal network. Allows independent scaling and restarts. |

The interface between NestJS and the Python service is identical in both cases, so the deployment decision can be deferred without affecting development.

---

## 4. API Specification

### 4.1 Endpoint

```
POST /images/rank
Content-Type: application/json
```

### 4.2 Request Body

```json
{
  "prompt": "a red sports car on a mountain road",
  "images": [
    "https://cdn.example.com/photos/abc123.jpg",
    "https://cdn.example.com/photos/def456.png",
    "https://cdn.example.com/photos/ghi789.webp"
  ]
}
```

| Field    | Type     | Required | Constraints                            |
| -------- | -------- | -------- | -------------------------------------- |
| `prompt` | string   | Yes      | 1–500 characters, non-empty            |
| `images` | string[] | Yes      | 1–50 URLs, each a valid HTTP/HTTPS URL |

### 4.3 Response Body

```json
{
  "results": [
    { "filename": "abc123.jpg", "score": 0.847 },
    { "filename": "ghi789.webp", "score": 0.631 },
    { "filename": "def456.png", "score": 0.412 }
  ],
  "meta": {
    "prompt": "a red sports car on a mountain road",
    "total": 3,
    "cached": 1,
    "encoded": 2,
    "duration_ms": 380
  }
}
```

`results` are ordered from highest to lowest similarity score. `score` is a cosine similarity value in the range `[0, 1]`. `filename` is derived from the last path segment of the submitted URL.

### 4.4 Error Responses

| HTTP Status | Code                   | Scenario                                        |
| ----------- | ---------------------- | ----------------------------------------------- |
| `400`       | `INVALID_INPUT`        | Malformed request, missing fields, invalid URLs |
| `422`       | `IMAGE_FETCH_FAILED`   | One or more URLs could not be downloaded        |
| `504`       | `CLIP_SERVICE_TIMEOUT` | Python service did not respond in time          |
| `500`       | `INTERNAL_ERROR`       | Unexpected failure                              |

---

## 5. CLIP Service Specification

### 5.1 Model

| Setting              | Value                                           |
| -------------------- | ----------------------------------------------- |
| Model                | `openai/clip-vit-base-patch32`                  |
| Image input size     | 224×224 (internal); feed at 256px shortest side |
| Embedding dimensions | 512 floats                                      |
| Runtime              | CPU (no GPU required)                           |

### 5.2 Image Preprocessing

Before encoding, each image must be preprocessed to avoid loading large source files into memory unnecessarily (source images may be up to ~50MB):

1. Download image from URL
2. Convert to RGB
3. Resize to **256px on the shortest side**, preserving aspect ratio
4. Feed directly to CLIP processor (which will center-crop to 224×224 internally)

### 5.3 Embedding Cache

The cache maps a **SHA-256 checksum of the raw image bytes** to its CLIP embedding vector.

| Property        | Value                                                        |
| --------------- | ------------------------------------------------------------ |
| Cache key       | SHA-256 of raw downloaded image bytes                        |
| Cache value     | 512-float numpy array (~2KB)                                 |
| Cache backend   | In-memory dict (default) or Redis (optional)                 |
| Eviction policy | LRU with configurable max size (default: 2,000 entries ~4MB) |
| Persistence     | Optional: serialize to disk on shutdown, reload on startup   |

The checksum is computed on the **original bytes**, not the resized image, so the cache key remains stable across any future preprocessing changes.

### 5.4 Internal API (NestJS → Python)

```
POST /rank
Content-Type: application/json
```

```json
{
  "prompt": "a red sports car on a mountain road",
  "images": ["https://cdn.example.com/photos/abc123.jpg"]
}
```

Response mirrors the public API response structure.

---

## 6. Non-Functional Requirements

| Requirement                | Target                                        |
| -------------------------- | --------------------------------------------- |
| **Latency (cache hit)**    | < 200ms end-to-end for 12 images              |
| **Latency (cache miss)**   | < 2s end-to-end for 12 uncached images on CPU |
| **Throughput**             | 300+ runs/day on a single CPU instance        |
| **Cache hit rate**         | ~30% expected based on image reuse patterns   |
| **Max images per request** | 50                                            |
| **Image URL timeout**      | 5s per image download                         |
| **CLIP service timeout**   | 10s total (configurable)                      |
| **Memory footprint**       | < 1GB RAM including model + cache             |

---

## 7. Implementation Notes

### NestJS Layer

- Use a dedicated `ImagesModule` with `ImagesController` and `ImagesService`
- `ImagesService` is responsible for calling the Python service via `HttpModule` (`axios`)
- Validate request with `class-validator` DTOs before forwarding
- Python service base URL configured via environment variable `CLIP_SERVICE_URL`
- Implement a health check that pings the Python service: `GET /images/health`

### Python CLIP Service

- Framework: **FastAPI** with **uvicorn**
- Load the CLIP model once at startup into memory; do not reload per request
- Use `Pillow` for image downloading and resizing
- Use `sentence-transformers` or `transformers` + `torch` for CLIP encoding
- Expose a `/health` endpoint that confirms model is loaded

### Environment Variables

| Variable                  | Service | Description                                                  |
| ------------------------- | ------- | ------------------------------------------------------------ |
| `CLIP_SERVICE_URL`        | NestJS  | Base URL of the Python CLIP service                          |
| `CLIP_SERVICE_TIMEOUT_MS` | NestJS  | Timeout for calls to CLIP service (default: `10000`)         |
| `CLIP_CACHE_MAX_SIZE`     | Python  | Max number of cached embeddings (default: `2000`)            |
| `CLIP_MODEL_NAME`         | Python  | CLIP model to load (default: `openai/clip-vit-base-patch32`) |

---

## 8. Out of Scope / Future Considerations

- **Top-K filtering**: optionally return only the top N results
- **Threshold filtering**: exclude results below a minimum score
- **Redis-backed cache**: for persistence across Python service restarts
- **Batch URL prefetching**: pre-warm cache for known image sets
- **LLM reranking**: optional second pass for ambiguous or nuanced prompts
- **Model upgrade path**: swap to `clip-vit-large-patch14` for higher accuracy if needed
