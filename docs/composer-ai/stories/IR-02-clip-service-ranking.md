# IR-02 — Python CLIP Service: Ranking Endpoint

**Type:** User Story  
**Phase:** 1 — Ranking Logic  
**Estimate:** M

## Story

> As the NestJS API, I want to POST a prompt and a list of image URLs to the CLIP service and receive ranked similarity scores, so that image ranking logic is fully encapsulated in the Python layer.

## Acceptance Criteria

- [ ] `POST /rank` accepts `{ "prompt": string, "images": string[] }`
- [ ] For each image URL the service downloads it (5s timeout), converts to RGB, and resizes to 256px on the shortest side preserving aspect ratio
- [ ] CLIP processor center-crops the resized image to 224×224 internally
- [ ] Text prompt is encoded with the CLIP text encoder
- [ ] Cosine similarity is computed between the prompt embedding and each image embedding
- [ ] `results` are sorted highest → lowest score
- [ ] `filename` is derived from the last path segment of the submitted URL
- [ ] `score` is a cosine similarity value in `[0, 1]`
- [ ] Returns `422` with `IMAGE_FETCH_FAILED` if any URL cannot be downloaded

## Response Shape

```json
{
  "results": [{ "filename": "abc123.jpg", "score": 0.847 }],
  "meta": {
    "prompt": "a red sports car on a mountain road",
    "total": 3,
    "cached": 0,
    "encoded": 3,
    "duration_ms": 380
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

- Depends on IR-01 (service running, model loaded in memory)
