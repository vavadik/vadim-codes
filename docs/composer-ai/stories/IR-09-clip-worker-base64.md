# IR-09 — Python Worker: Accept Base64 Input

**Type:** Task  
**Phase:** 4 — Node-Side Preprocessing  
**Estimate:** S

## Story

> As the NestJS API, I want to send preprocessed image data as base64 strings instead of URLs, so that the Python worker only performs CLIP encoding and ranking with no network I/O.

## Acceptance Criteria

- [ ] `rank` params change to `{ "prompt": string, "images": [{ "key": string, "data": string }] }` where `data` is a base64-encoded JPEG
- [ ] Worker decodes each entry: `Image.open(BytesIO(b64decode(item["data"])))`
- [ ] `requests` import and `fetch_and_preprocess` function are removed
- [ ] `requests` dependency is removed from `pyproject.toml`
- [ ] Results use `key` instead of `url`: `[{ "key": string, "score": number }]`
- [ ] `IMAGE_FETCH_FAILED` error variant is removed (URL fetching now lives in Node)
- [ ] `meta` fields (`total`, `cached`, `encoded`, `duration_ms`) remain unchanged

## IPC Request / Response

**Request:**

```json
{
  "id": "uuid",
  "method": "rank",
  "params": {
    "prompt": "a red sports car on a mountain road",
    "images": [
      { "key": "a1b2c3...", "data": "<base64-jpeg>" },
      { "key": "d4e5f6...", "data": "<base64-jpeg>" }
    ]
  }
}
```

**Response:**

```json
{
  "id": "uuid",
  "result": {
    "results": [
      { "key": "a1b2c3...", "score": 0.231 },
      { "key": "d4e5f6...", "score": 0.184 }
    ],
    "meta": {
      "prompt": "a red sports car on a mountain road",
      "total": 2,
      "cached": 0,
      "encoded": 2,
      "duration_ms": 140
    }
  }
}
```

## Technical Notes

- `numpy` and `Pillow` remain as dependencies; only `requests` is removed
- Depends on IR-08 (Node now owns all preprocessing before the worker is called)
