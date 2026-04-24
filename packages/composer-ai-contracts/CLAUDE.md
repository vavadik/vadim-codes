# CLAUDE.md — packages/contracts

Shared API contract package. Consumed by both `apps/api` and `apps/web`. Changes here affect both sides simultaneously — always rebuild after changes (`pnpm build` or `pnpm dev` in watch mode).

## Commands

```bash
pnpm build        # tsc → dist/ (required before apps can import changes)
pnpm dev          # tsc --watch
pnpm check-types  # tsc --noEmit
```

## Structure

```
src/
  contract.ts          # Root contract: merges all sub-routers
  openapi.ts           # Generates OpenAPI document from contract
  index.ts             # Public barrel export
  contracts/
    health.contract.ts
    todo.contract.ts
    salesforce.contract.ts
  dtos/
    health.dto.ts
    todo.dto.ts
    salesforce.dto.ts
```

## Conventions

### One contract file + one DTO file per domain

- `contracts/<domain>.contract.ts` — route definitions (method, path, params, responses)
- `dtos/<domain>.dto.ts` — Zod schemas and inferred TypeScript types

### Contract structure

```typescript
import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { fooSchema, fooListSchema } from '../dtos/foo.dto';

const c = initContract();

export const fooContract = c.router({
  list: {
    method: 'GET',
    path: '/foo',
    responses: { 200: fooListSchema },
  },
  getById: {
    method: 'GET',
    path: '/foo/:id',
    pathParams: z.object({ id: z.string() }),
    responses: {
      200: fooSchema,
      404: z.object({ message: z.string() }),
    },
  },
  create: {
    method: 'POST',
    path: '/foo',
    body: fooCreateSchema,
    responses: { 201: fooSchema },
  },
});
```

### DTO structure

```typescript
import { z } from 'zod';

// Define schemas first
export const fooSchema = z.object({ id: z.string(), name: z.string() });
export const fooCreateSchema = fooSchema.pick({ name: true });
export const fooListSchema = z.array(fooSchema);

// Infer types from schemas — never write types manually
export type Foo = z.infer<typeof fooSchema>;
export type FooCreate = z.infer<typeof fooCreateSchema>;
```

### Merging into the root contract

After creating a new sub-router, add it to `contract.ts`:

```typescript
import { fooContract } from './contracts/foo.contract';

export const contract = c.router({
  ...healthContract, // flat-merged (no namespace)
  foo: fooContract, // namespaced under contract.foo.*
  salesforce: salesforceContract,
  todo: todoContract,
});
```

Health is flat-merged (routes live at `/health`, not `/health/health`). Feature modules are namespaced.

## Important Notes

- **Rebuild required**: `apps/api` and `apps/web` import from `dist/`, not `src/`. Run `pnpm build` (or `pnpm dev` in watch mode) after every change, or use Turborepo from the root which handles ordering.
- **Zod is the source of truth**: Never write manual TypeScript interfaces for DTOs — always `z.infer<typeof schema>`.
- **No runtime code**: This package is pure schema definitions. No business logic, no framework imports (NestJS, Vue, etc.).
- **Path params must match**: The `:param` names in `path` and `pathParams` Zod object keys must be identical.
- **Response status must be `as const`**: In controllers, return `{ status: 200 as const, body: ... }` — TypeScript narrows the discriminated union on the literal type.
