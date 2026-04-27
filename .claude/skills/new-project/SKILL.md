---
name: new-project
description: >
  Only use when explicitly invoked via /new-project. Do NOT trigger automatically.
  Sets up a new full-stack app in this monorepo from the boilerplate — covers web, api, db, and
  contracts — wired up with the correct name, env vars, and Turborepo dev-task graph.
---

# New Project Setup

This monorepo has four boilerplate packages that act as a starting point for every new full-stack app:

| Source                           | Target                      | Package name                    |
| -------------------------------- | --------------------------- | ------------------------------- |
| `apps/boilerplate-api`           | `apps/<name>-api`           | `<name>-api`                    |
| `apps/boilerplate-web`           | `apps/<name>-web`           | `<name>-web`                    |
| `packages/boilerplate-contracts` | `packages/<name>-contracts` | `@vadim-codes/<name>-contracts` |
| `packages/boilerplate-db`        | `packages/<name>-db`        | `@vadim-codes/<name>-db`        |

Use `<name>` = the project slug in **kebab-case** (e.g. `my-app`). Use `<NAME>` = SCREAMING_SNAKE_CASE for env var prefixes (e.g. `MY_APP`). Use `<Title>` = Title Case for human-readable labels (e.g. `My App`).

---

## Step 1 — Copy the boilerplate directories

```bash
cp -r apps/boilerplate-api  apps/<name>-api
cp -r apps/boilerplate-web  apps/<name>-web
cp -r packages/boilerplate-contracts  packages/<name>-contracts
cp -r packages/boilerplate-db  packages/<name>-db
```

Remove any stale build artifacts from the copies:

```bash
rm -rf apps/<name>-api/dist apps/<name>-api/node_modules
rm -rf apps/<name>-web/dist apps/<name>-web/node_modules
rm -rf packages/<name>-contracts/dist packages/<name>-contracts/node_modules
rm -rf packages/<name>-db/dist packages/<name>-db/node_modules packages/<name>-db/prisma/generated
```

---

## Step 2 — Rename package identifiers

Edit **each** file listed below. Use the Edit tool, not sed, to avoid mistakes.

### `packages/<name>-contracts/package.json`

- `"name"`: `"@vadim-codes/boilerplate-contracts"` → `"@vadim-codes/<name>-contracts"`

### `packages/<name>-db/package.json`

- `"name"`: `"@vadim-codes/boilerplate-db"` → `"@vadim-codes/<name>-db"`

### `apps/<name>-api/package.json`

- `"name"`: `"boilerplate-api"` → `"<name>-api"`
- dependency `"@vadim-codes/boilerplate-contracts"` → `"@vadim-codes/<name>-contracts"`
- dependency `"@vadim-codes/boilerplate-db"` → `"@vadim-codes/<name>-db"`

### `apps/<name>-web/package.json`

- `"name"`: `"boilerplate-web"` → `"<name>-web"`
- dependency `"@vadim-codes/boilerplate-contracts"` → `"@vadim-codes/<name>-contracts"`

---

## Step 3 — Update source file references

### `packages/<name>-contracts/src/openapi.ts`

Change the API title:

```ts
{ info: { title: 'Boilerplate API', version: '1.0.0' } }
// →
{ info: { title: '<Title> API', version: '1.0.0' } }
```

### `apps/<name>-api/src/prisma/prisma.service.ts`

Rename the env var constants so this app's DB is isolated:

```ts
// before
const baseUrl = process.env['DATABASE_URL'];
const dbName = process.env['BOILERPLATE_DB_NAME'];
// ...
throw new Error('BOILERPLATE_DB_NAME is not set');

// after
const baseUrl = process.env['DATABASE_URL'];
const dbName = process.env['<NAME>_DB_NAME'];
// ...
throw new Error('<NAME>_DB_NAME is not set');
```

### `apps/<name>-api/src/main.ts`

Update the port env var:

```ts
// before
await app.listen(process.env.BOILERPLATE_API_PORT ?? 3001);

// after
await app.listen(process.env.<NAME>_API_PORT ?? 3001);
```

Pick a port that doesn't conflict with other running apps. The root `.env` already defines `3001` for the boilerplate; choose a free one (e.g. `3002`, `3003`, …).

### `apps/<name>-web/src/composables/useTheme.ts`

Update the localStorage key so themes don't bleed across apps:

```ts
const STORAGE_KEY = 'boilerplate-theme';
// →
const STORAGE_KEY = '<name>-theme';
```

### `apps/<name>-web/src/composables/useSession.ts`

Update the localStorage keys:

```ts
const SESSION_KEY = 'boilerplate:sessionId';
const NAME_KEY = 'boilerplate:name';
// →
const SESSION_KEY = '<name>:sessionId';
const NAME_KEY = '<name>:name';
```

### `apps/<name>-web/vite.config.ts`

Update the proxy port to match the API port chosen above:

```ts
proxy: {
  '/api': {
    target: 'http://localhost:<PORT>',   // ← your chosen port
    ws: true,
  },
},
```

---

## Step 4 — Add env vars to root `.env`

Append to the root `.env` file (create it if it doesn't exist). Every app keeps its own DB name so migrations never interfere.

```dotenv
# <Title>
<NAME>_DB_NAME=<name>
<NAME>_API_PORT=<PORT>
```

`DATABASE_URL` is shared across apps — it points at the Postgres host without a database suffix. The prisma service appends `/<NAME>_DB_NAME` at runtime. If `DATABASE_URL` isn't set yet, add it too:

```dotenv
DATABASE_URL=postgresql://user:password@localhost:5432
```

---

## Step 5 — Wire up Turborepo dev tasks

Open `turbo.json` and add two entries inside `"tasks"`. The API must wait for both packages to build; the web only waits for contracts (it doesn't import the DB client).

```json
"<name>-api#dev": {
  "dependsOn": [
    "@vadim-codes/<name>-contracts#build",
    "@vadim-codes/<name>-db#build"
  ],
  "cache": false,
  "persistent": true
},
"<name>-web#dev": {
  "dependsOn": ["@vadim-codes/<name>-contracts#build"],
  "cache": false,
  "persistent": true
},
```

Without these entries, `pnpm dev` (root) may start the API before the contracts/db packages have a `dist/` — causing import errors on startup.

---

## Step 6 — Install & build

```bash
# Resolve workspace symlinks for the new packages
pnpm install

# Build shared packages first (contracts has no deps on db, so they can build in parallel)
pnpm --filter @vadim-codes/<name>-contracts build
pnpm --filter @vadim-codes/<name>-db build

# Optional: verify the API compiles
pnpm --filter <name>-api build
```

---

## Step 7 — Create the database & run migrations

The DB package contains the Prisma schema. Create the database and apply migrations:

```bash
pnpm --filter @vadim-codes/<name>-db migrate
```

When prompted for a migration name, enter something like `init`. Always pass `--name` to avoid an interactive hang:

```bash
pnpm --filter @vadim-codes/<name>-db exec prisma migrate dev --name init
```

---

## Step 8 — Verify dev startup

```bash
# Start just this app's stack
pnpm --filter <name>-api dev &
pnpm --filter <name>-web dev
```

Or from the repo root (starts all apps including the new one):

```bash
pnpm dev
```

Check:

- API health: `curl http://localhost:<PORT>/api/health`
- Web: open `http://localhost:5173` (or whatever port Vite picks)

---

## Checklist

- [ ] Directories copied and artifacts removed
- [ ] All four `package.json` names and dependency refs updated
- [ ] `openapi.ts` title updated
- [ ] `prisma.service.ts` env var names updated (`BOILERPLATE_` → `<NAME>_`)
- [ ] `main.ts` port env var updated
- [ ] `vite.config.ts` proxy port updated
- [ ] `useTheme.ts` storage key updated
- [ ] `useSession.ts` storage keys updated
- [ ] Root `.env` has `<NAME>_DB_NAME` and `<NAME>_API_PORT`
- [ ] `turbo.json` has both `<name>-api#dev` and `<name>-web#dev` tasks
- [ ] `pnpm install` run from repo root
- [ ] Packages built: contracts → db
- [ ] Database migrated
