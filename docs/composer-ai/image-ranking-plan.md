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

| #     | Story                                               | Estimate | Status | Notes |
| ----- | --------------------------------------------------- | -------- | ------ | ----- |
| IR-03 | [Embedding Cache](stories/IR-03-embedding-cache.md) | S        | ⬜     |       |

---

## Phase 3 — Integration & Observability

After this phase: `POST /images/rank` is fully wired end-to-end and NestJS exposes a health endpoint reflecting the CLIP worker's readiness.

| #     | Story                                                                       | Estimate | Status | Notes |
| ----- | --------------------------------------------------------------------------- | -------- | ------ | ----- |
| IR-05 | [NestJS: CLIP Worker Integration](stories/IR-05-nestjs-clip-integration.md) | M        | ✅     |       |
| IR-06 | [Health Checks](stories/IR-06-health-checks.md)                             | XS       | ✅     |       |

---

## Dependency Graph

```
IR-01 ──▶ IR-02 ──▶ IR-03 ──┐
                              ├──▶ IR-05 ──▶ IR-06
IR-04 ───────────────────────┘
```

Key rules:

- **IR-01** and **IR-04** have no prerequisites — start both in parallel.
- **IR-02** (ranking) is the riskiest story; complete it early to surface any CPU performance concerns before the cache story.
- **IR-05** (NestJS integration) is blocked until both IR-03 and IR-04 are done.

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
