# IR-04 — NestJS Images Module & Input Validation

**Type:** Task  
**Phase:** 0 — Foundation  
**Estimate:** S

## Story

> As a developer, I want a validated `POST /images/rank` endpoint in NestJS that rejects malformed requests before touching the CLIP service, so that bad input is caught early with clear error responses.

## Acceptance Criteria

- [ ] `ImagesModule` created with `ImagesController` and `ImagesService`
- [ ] `POST /images/rank` route exists and is reachable
- [ ] Request body is validated via a `class-validator` DTO:
  - `prompt`: required string, 1–500 characters
  - `images`: required array of 1–50 valid `http`/`https` URLs
- [ ] Invalid requests return `400` with code `INVALID_INPUT` and a descriptive message
- [ ] Valid requests reach `ImagesService` (stub response acceptable at this stage)
- [ ] `ImagesModule` is registered in `AppModule`

## DTO Shape

```typescript
class RankImagesDto {
  prompt: string; // @IsString, @Length(1, 500)
  images: string[]; // @IsUrl each, @ArrayMinSize(1), @ArrayMaxSize(50)
}
```

## Technical Notes

- NestJS-only story; no Python dependency — can be developed in parallel with IR-01 and IR-02
- Wire `ValidationPipe` globally or at the route level
