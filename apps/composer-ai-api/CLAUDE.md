# CLAUDE.md — apps/api

NestJS REST API. All commands below are run from `apps/api/` unless noted.

## Commands

```bash
pnpm dev           # nest start --watch (port 3000)
pnpm build         # nest build → dist/
pnpm start:prod    # node dist/main
pnpm test          # Vitest (run once)
pnpm test:watch    # Vitest watch
pnpm test:cov      # Vitest with v8 coverage
```

## Architecture

```
src/
  main.ts              # Bootstrap: cookie-parser, Swagger, global prefix
  app.module.ts        # Root module (ConfigModule global, feature modules)
  health/              # GET /health — public, no guard
  auth/
    auth.controller.ts # GET /auth/salesforce, callback, POST /refresh, /logout, /me
    auth.service.ts    # Token generation, refresh rotation, logout
    guards/
      jwt-auth.guard.ts        # Reads access_token cookie, verifies JWT, no DB call
      salesforce-auth.guard.ts # extends AuthGuard('salesforce')
    strategies/
      salesforce.strategy.ts   # passport-oauth2 → calls SF userinfo endpoint
    interfaces/
      jwt-payload.interface.ts  # { sub, org, email }
      sf-user.interface.ts      # { sfUserId, sfOrgId, email, sfAccessToken, sfInstanceUrl }
  salesforce/
    salesforce.controller.ts   # ts-rest handlers: sobjects, describe, getRecord
    salesforce.service.ts      # jsforce Connection per request, getConnection reads session from DB
  todo/
    todo.controller.ts
    todo.service.ts
  prisma/
    prisma.service.ts   # DI wrapper around PrismaClient
    prisma.module.ts
  types/
    express.d.ts        # Augments Express.User to extend JwtPayload
test/
  todo.controller.test.ts
  todo.service.test.ts
```

## Key Patterns

### Controllers use ts-rest handlers

```typescript
@Controller()
@UseGuards(JwtAuthGuard)
export class FooController {
  @TsRestHandler(contract.foo.list)
  list(@Req() req: Request) {
    return tsRestHandler(contract.foo.list, async () => {
      const result = await this.fooService.list(req.user!.sub);
      return { status: 200 as const, body: result };
    });
  }
}
```

- Decorate the **method** with `@TsRestHandler(contract.x.y)`, return `tsRestHandler(...)`.
- `req.user` is typed as `JwtPayload` (`{ sub, org, email }`). Access it via `@Req() req: Request` and capture it in the closure — the `tsRestHandler` callback does **not** receive the Express request.
- Always return `{ status: N as const, body: ... }`. TypeScript enforces that status+body match the contract's response map.

### Auth endpoints do NOT use ts-rest

OAuth redirects return 302s and cookies, not typed JSON. The auth controller is a plain `@Controller` with standard NestJS decorators. Use `@Res({ passthrough: true })` to set cookies while keeping NestJS interceptors active.

### JWT flow (no DB on every request)

- `JwtAuthGuard` reads `req.cookies['access_token']`, calls `JwtService.verify()`. Pure crypto — no Prisma call.
- DB is only hit in `POST /auth/refresh` to validate the opaque refresh token and rotate it atomically.
- Refresh token rotation: `prisma.session.update({ where: { hashedToken }, data: { hashedToken: newHash, expiresAt } })` — single atomic update, no delete+insert race.

### Salesforce session

`sfAccessToken` and `sfInstanceUrl` are stored in the `Session` table and retrieved by `SalesforceService.getConnection(sfUserId)`. Each request that calls the SF API opens a new jsforce `Connection` with those credentials — no persistent connection pool.

### Cookie options (applied to both access_token and refresh_token)

```typescript
{ httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' }
```

`sameSite: 'lax'` (not `'strict'`) is required so the browser sends the cookie after the Salesforce OAuth redirect back to the callback URL.

### req.user typing

`types/express.d.ts` augments `namespace Express { interface User extends JwtPayload {} }`. This is what Passport uses — do **not** augment `Express.Request.user` directly.

## Environment Variables

Required in `.env` (see `.env.example`):

```
SF_CLIENT_ID=
SF_CLIENT_SECRET=
SF_INSTANCE_URL=https://login.salesforce.com
SF_CALLBACK_URL=http://localhost:5173/api/auth/salesforce/callback
SF_AUTH_SUCCESS_REDIRECT=http://localhost:5173
JWT_SECRET=        # openssl rand -hex 32
DATABASE_URL=
```

`SF_CALLBACK_URL` must go through the Vite proxy (`localhost:5173/api/...`) in dev so Set-Cookie is scoped to the frontend origin.

## Adding a New Feature Module

1. Create `src/<feature>/<feature>.service.ts`, `.controller.ts`, `.module.ts`
2. Add contract route(s) in `packages/contracts/src/contracts/<feature>.contract.ts`
3. Add Zod schemas/types in `packages/contracts/src/dtos/<feature>.dto.ts`
4. Merge into `packages/contracts/src/contract.ts`
5. Import `<Feature>Module` in `app.module.ts`
6. Guard the controller with `@UseGuards(JwtAuthGuard)` unless it's public

## Tooling

- **Builder**: `@nestjs/cli` with SWC (fast transpile, no type errors during build — run `pnpm check-types` separately)
- **Test runner**: Vitest with `@swc/vitest` plugin, globals enabled
- **Swagger**: Auto-generated at `/api-docs` from ts-rest contract in `main.ts`
