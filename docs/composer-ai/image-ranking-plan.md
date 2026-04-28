# Image Ranking — Implementation Plan

> Progress legend: ⬜ not started · 🔄 in progress · ✅ done · ❌ blocked

---

## Phase 0 — Foundation

Infrastructure and scaffolding with no end-to-end flow. IR-01 and IR-04 have no dependencies on each other and can be developed in parallel. After this phase the Python worker starts and signals readiness over stdout, and the NestJS route validates input and rejects bad requests.

| #     | Story                                                                           | Estimate | Status | Notes |
| ----- | ------------------------------------------------------------------------------- | -------- | ------ | ----- |
| IR-01 | [Python CLIP Worker: Setup & Ready Signal](stories/IR-01-clip-service-setup.md) | S        | ✅     |       |
| IR-04 | [NestJS Images Module & Validation](stories/IR-04-nestjs-images-module.md)      | S        | ✅     |       |

---

## Phase 1 — Ranking Logic

After this phase: the Python worker can accept a `rank` IPC request, download and encode the images, and return ranked similarity scores.

| #     | Story                                                                       | Estimate | Status | Notes |
| ----- | --------------------------------------------------------------------------- | -------- | ------ | ----- |
| IR-02 | [Python CLIP Worker: Ranking Method](stories/IR-02-clip-service-ranking.md) | M        | ✅     |       |

---

## Phase 2 — Caching

After this phase: repeated requests for the same images skip re-encoding; cache hit latency drops below 200ms for 12 images.

| #     | Story                                               | Estimate | Status | Notes                                      |
| ----- | --------------------------------------------------- | -------- | ------ | ------------------------------------------ |
| IR-03 | [Embedding Cache](stories/IR-03-embedding-cache.md) | S        | ❌     | Superseded by IR-07 (Node-side blob cache) |

---

## Phase 3 — Integration & Observability

After this phase: `POST /images/rank` is fully wired end-to-end and NestJS exposes a health endpoint reflecting the CLIP worker's readiness.

| #     | Story                                                                       | Estimate | Status | Notes |
| ----- | --------------------------------------------------------------------------- | -------- | ------ | ----- |
| IR-05 | [NestJS: CLIP Worker Integration](stories/IR-05-nestjs-clip-integration.md) | M        | ✅     |       |
| IR-06 | [Health Checks](stories/IR-06-health-checks.md)                             | XS       | ✅     |       |

---

## Phase 4 — Node-Side Preprocessing

After this phase: image download, conversion, and resizing happen in Node.js using Sharp; the Python worker receives base64 JPEGs and returns only ranking scores; preprocessed images are cached in a filesystem blob store.

| #     | Story                                                                             | Estimate | Status | Notes |
| ----- | --------------------------------------------------------------------------------- | -------- | ------ | ----- |
| IR-07 | [BlobStore: Abstraction & Filesystem Implementation](stories/IR-07-blob-store.md) | S        | ✅     |       |
| IR-08 | [Image Preprocessing Service](stories/IR-08-image-preprocessing.md)               | S        | ✅     |       |
| IR-09 | [Python Worker: Accept Base64 Input](stories/IR-09-clip-worker-base64.md)         | S        | ✅     |       |
| IR-10 | [NestJS: Rank Flow Update](stories/IR-10-rank-flow-update.md)                     | S        | ✅     |       |

---

## Dependency Graph

```
IR-01 ──▶ IR-02 ──▶ IR-05 ──▶ IR-06
IR-04 ─────────────────┘

IR-07 ──▶ IR-08 ──┐
                   ├──▶ IR-10
IR-09 ─────────────┘
```

Key rules:

- **IR-01** and **IR-04** have no prerequisites — start both in parallel.
- **IR-02** (ranking) is the riskiest story; complete it early to surface any CPU performance concerns.
- **IR-07** and **IR-09** have no prerequisites within Phase 4 — start both in parallel.
- **IR-10** is blocked until both IR-08 and IR-09 are done.

---

## Story Size Reference

| Size | Rough effort |
| ---- | ------------ |
| XS   | < half day   |
| S    | ~1 day       |
| M    | 2–3 days     |
| L    | 4–5 days     |

---

## Future Milestones (out of scope for v1)

- **Top-K / threshold filtering** — return only top N results or exclude results below a minimum score
- **Redis-backed cache** — embedding persistence across Python worker restarts
- **Batch URL prefetching** — pre-warm cache for known image sets
- **LLM reranking** — optional second pass for ambiguous or nuanced prompts
- **Model upgrade** — swap to `clip-vit-large-patch14` for higher accuracy
- **SF entity integration** — wire `POST /images/rank` into the SF entity image ranking flow
