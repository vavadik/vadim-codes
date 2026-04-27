# CLAUDE.md — packages/db

Prisma client wrapper. Exports a typed `PrismaClient` instance used by `apps/api`. All Prisma operations (schema changes, migrations) happen in this package.

## Commands

```bash
pnpm generate         # prisma generate (regenerate client after schema changes)
pnpm migrate          # prisma migrate dev (create + apply a new migration)
pnpm migrate:deploy   # prisma migrate deploy (apply pending migrations in prod)
pnpm studio           # prisma studio (browser-based DB GUI)
pnpm seed             # prisma db seed
pnpm build            # prisma generate + tsup (required before apps/api can use changes)
pnpm dev              # tsup --watch
pnpm check-types      # tsc --noEmit
```

## Structure

```
prisma/
  schema.prisma          # Data model — edit here for schema changes
  migrations/            # Auto-generated migration SQL files (commit these)
  generated/prisma/      # Generated Prisma client (do NOT edit, do NOT commit)
  seed.ts                # Seed script (run via pnpm seed)
src/
  index.ts               # Exports createPrismaClient()
dist/                    # tsup build output (CJS + .d.ts)
tsup.config.ts           # Bundles src/index.ts
```

## Schema

Current models:

**Todo**
| Column | Type | Notes |
|--------|------|-------|
| id | String | cuid, PK |
| title | String | |
| done | Boolean | default false |
| createdAt | DateTime | auto |
| updatedAt | DateTime | auto |

**Session** (auth)
| Column | Type | Notes |
|--------|------|-------|
| id | String | cuid, PK |
| sfUserId | String | indexed |
| sfOrgId | String | |
| email | String | |
| hashedToken | String | unique — SHA-256 of raw refresh token |
| sfAccessToken | String | Salesforce API token |
| sfInstanceUrl | String | Org-specific SF instance URL |
| expiresAt | DateTime | indexed — refresh token expiry |
| createdAt | DateTime | auto |
| updatedAt | DateTime | auto |

## Workflow for Schema Changes

1. Edit `prisma/schema.prisma`
2. Run `pnpm migrate` — creates a migration file under `prisma/migrations/` and applies it
3. Run `pnpm build` — regenerates the client and rebuilds `dist/` so `apps/api` picks up new types
4. Commit the migration file (not the generated client)

### Adding a required column to a non-empty table

Use `--create-only` to generate the migration without applying it, manually add a `DELETE FROM` or `UPDATE` statement for existing rows, then apply:

```bash
pnpm exec prisma migrate dev --name <name> --create-only
# edit the generated SQL
pnpm exec prisma migrate dev
```

## How apps/api Uses This Package

`apps/api/src/prisma/prisma.service.ts` imports `createPrismaClient` from `@vadim-codes/composer-ai-db` and wraps it as a NestJS injectable service. All database access goes through `PrismaService` — never import PrismaClient directly in feature modules.

## Notes

- The Prisma client is generated to `./generated/prisma` (custom output path, not `node_modules`). This is why `pnpm build` must run `prisma generate` before `tsup`.
- `@prisma/adapter-pg` is used as the database adapter (PostgreSQL via `pg`).
- `DATABASE_URL` must be set in the root `.env` file.
- Do not edit files under `prisma/generated/` — they are overwritten on every `prisma generate`.
