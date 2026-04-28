# IR-02 — Python CLIP Worker: Ranking Method

**Type:** User Story  
**Phase:** 1 — Ranking Logic  
**Estimate:** M

## Story

> As the NestJS API, I want to send a `rank` IPC request with a prompt and a list of image URLs and receive ranked similarity scores, so that image ranking logic is fully encapsulated in the Python worker.

## Acceptance Criteria

- [ ] `rank` method accepts `{ "prompt": string, "images": string[] }` as `params`
- [ ] For each image URL the worker downloads it (5s timeout), converts to RGB, and resizes to 256px on the shortest side preserving aspect ratio
- [ ] CLIP processor center-crops the resized image to 224×224 internally
- [ ] Text prompt is encoded with the CLIP text encoder
- [ ] Cosine similarity is computed between the prompt embedding and each image embedding
- [ ] `results` are sorted highest → lowest score
- [ ] `filename` is derived from the last path segment of the submitted URL
- [ ] `score` is a cosine similarity value in `[0, 1]`
- [ ] If any URL cannot be downloaded, returns `{"id": "...", "error": "IMAGE_FETCH_FAILED: <url>"}` — NestJS surfaces this as `422`

## IPC Request / Response

**Request:**

```json
{
  "id": "uuid",
  "method": "rank",
  "params": {
    "prompt": "a red sports car on a mountain road",
    "images": ["https://example.com/a.jpg", "https://example.com/b.jpg"]
  }
}
```

**Response:**

```json
{
  "id": "uuid",
  "result": {
    "results": [{ "filename": "a.jpg", "score": 0.847 }],
    "meta": {
      "prompt": "a red sports car on a mountain road",
      "total": 2,
      "cached": 0,
      "encoded": 2,
      "duration_ms": 380
    }
  }
}
```

`cached` defaults to `0` / `encoded` defaults to `total` until IR-03 is implemented.

## Performance Targets

| Scenario                    | Target      |
| --------------------------- | ----------- |
| 12 images, all cache misses | < 2s on CPU |
| 12 images, all cache hits   | < 200ms     |

## Technical Notes

- Depends on IR-01 (worker running, model loaded in memory)
- Each IPC call is synchronous within the Python worker — the request loop processes one message at a time
