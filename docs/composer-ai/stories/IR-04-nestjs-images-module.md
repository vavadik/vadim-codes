# IR-04 — NestJS Images Module & Input Validation

**Type:** Task  
**Phase:** 0 — Foundation  
**Estimate:** S

## Story

> As a developer, I want a validated `POST /images/rank` endpoint in NestJS that rejects malformed requests before touching the CLIP worker, so that bad input is caught early with clear error responses.

## Acceptance Criteria

- [ ] `ImagesModule` created with `ImagesController`, `ImagesService`, and `ClipModule` imported
- [ ] `POST /images/rank` route exists and is reachable
- [ ] Request body is validated via the `rankImagesDtoSchema` Zod schema in `composer-ai-contracts`:
  - `prompt`: required string, 1–500 characters
  - `images`: required array of 1–50 valid `http`/`https` URLs
- [ ] Invalid requests return `400` with code `INVALID_INPUT` and a descriptive message
- [ ] Valid requests reach `ImagesService` (stub response acceptable at this stage)
- [ ] `ImagesModule` is registered in `AppModule`

## Contract Shape

Defined in `packages/composer-ai-contracts`:

```typescript
// dtos/images.dto.ts
rankImagesDtoSchema = z.object({
  prompt: z.string().min(1).max(500),
  images: z.array(z.string().url()).min(1).max(50),
});
```

```typescript
// contracts/images.contract.ts
rank: {
  method: 'POST',
  path: '/images/rank',
  body: rankImagesDtoSchema,
  responses: {
    200: rankImagesResponseSchema,
    400: rankImagesErrorSchema, // { code: 'INVALID_INPUT', message: string }
  },
}
```

## Technical Notes

- Validation and DTO types are owned by `composer-ai-contracts` (Zod + ts-rest) — no `class-validator` or `class-transformer`
- Controller uses `@TsRestHandler` / `tsRestHandler` pattern, same as all other controllers in this project
- `ClipProcessService` is injected into `ImagesService` (used in IR-05); stub does not call it yet
- NestJS-only story; no Python dependency — can be developed in parallel with IR-01
