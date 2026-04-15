# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands use **pnpm** as the package manager and **Turborepo** for orchestration.

### Root-level (run from repo root)

```bash
pnpm dev           # Start all apps in dev mode (parallel)
pnpm build         # Build all apps
pnpm lint          # Lint with oxlint
pnpm lint:fix      # Auto-fix lint issues
pnpm format        # Check formatting with oxfmt
pnpm format:fix    # Auto-format with oxfmt
pnpm check-types   # Type-check all packages
```

### Web app (apps/web)

```bash
pnpm dev           # Vite dev server
pnpm build         # Type-check + Vite build
pnpm test:unit     # Run Vitest tests
pnpm type-check    # vue-tsc --build
```

### API app (apps/api)

```bash
pnpm dev           # NestJS watch mode (nest start --watch)
pnpm build         # nest build
pnpm start:prod    # node dist/main
pnpm test          # Jest
pnpm test:watch    # Jest in watch mode
pnpm test:cov      # Jest with coverage
pnpm test:e2e      # Jest e2e (jest-e2e.json config)
```

## Architecture

Turborepo monorepo with two apps and an empty `packages/` directory reserved for future shared code.

### apps/web — Vue 3 SPA

- **Stack**: Vue 3 + Vite + TypeScript + Pinia (state) + Vue Router
- **Path alias**: `@` → `src/`
- **Entry**: `src/main.ts` → `App.vue`

### apps/api — NestJS REST API

- **Stack**: NestJS + Express + TypeScript
- **Port**: 3000 (overridable via `PORT` env var)
- **Module structure**: standard NestJS decorator-based DI (`AppModule` → `AppController` + `AppService`)
- **Targets**: ES2023, NodeNext module resolution

### Tooling conventions

- **Linter**: oxlint with TypeScript, Unicorn, and Oxc plugins; correctness rules at error level
- **Formatter**: oxfmt — trailing commas (ES5), semicolons, single quotes
- The web app uses its own Prettier config for `.ts`/`.vue` files; the API uses Prettier directly via `pnpm format`
