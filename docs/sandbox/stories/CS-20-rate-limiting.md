# CS-20 — Server-Side Rate Limiting

**Type:** User Story  
**Phase:** 5 — Abuse Prevention  
**Estimate:** S

## Story

> As the system, I want to limit how many snippets can be created per IP in a short window so bulk programmatic abuse doesn't fill the database with junk.

## Acceptance Criteria

- [ ] Snippet creation (`POST /snippets`) is rate-limited per IP address.
- [ ] Initial limits (to be tuned based on real traffic): **30 requests per minute** per IP.
- [ ] When the limit is exceeded, the API returns `429 Too Many Requests` with a `Retry-After` header.
- [ ] The frontend handles 429 responses gracefully: shows an error toast "Too many saves — please wait a moment and try again." without crashing or retrying automatically.
- [ ] Rate limiting applies to both authenticated and anonymous users (by IP, not user ID) to prevent anonymous abuse.
- [ ] Read endpoints (`GET /snippets/:id`) are not rate-limited in v1.

## Technical Notes

- Use the `@nestjs/throttler` package with the `ThrottlerGuard` applied to the snippets controller.
- Configure via environment variables so limits can be adjusted without a code change:
  - `THROTTLE_TTL` (seconds per window, default 60)
  - `THROTTLE_LIMIT` (requests per window, default 30)
- Store throttle state in memory (default) for v1; migrate to Redis-backed storage if/when the app runs multiple instances.
- The `Retry-After` header value should be the remaining TTL in seconds.
