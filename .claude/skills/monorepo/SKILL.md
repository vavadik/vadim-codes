---
name: monorepo
description: Guide for working inside a pnpm + Turborepo monorepo. Use this skill for any task that involves running commands, navigating between apps or packages, installing dependencies, or making code changes in the repo. Apply it before running any script so you use the right scope (root vs per-app), and always follow the post-change quality step.
---

# Turborepo Monorepo — Developer Guide

## How the workspace is organized

A Turborepo monorepo has this shape:

```
repo-root/
├── apps/          ← deployable applications (web, api, mobile, etc.)
├── packages/      ← shared libraries consumed by apps
├── turbo.json     ← task graph: what depends on what, what gets cached
└── package.json   ← root scripts + pnpm workspace definition
```

**Package manager**: always use `pnpm`. Never use `npm` or `yarn` — they bypass the workspace setup.

## Discovering what's in the repo

To see all apps and packages:

```bash
ls apps/       # each subdirectory is an app
ls packages/   # each subdirectory is a shared package
```

Each app/package has its own `package.json` with a `"name"` field. That name is what you pass to `--filter`.

To read an app's available scripts:

```bash
cat apps/<name>/package.json
```

## Running commands

### Root-level commands (affect all apps via Turborepo)

Run from the repo root. Turborepo fans the task out to every workspace in the correct dependency order:

```bash
pnpm dev          # start all apps in dev/watch mode (parallel)
pnpm build        # build all apps (dependencies built first)
pnpm check-types  # type-check all packages
pnpm lint         # lint the whole repo
pnpm lint:fix     # auto-fix lint issues
pnpm format       # check formatting
pnpm format:fix   # auto-format
```

### Per-app commands (filter to one workspace)

Use `--filter <name>` to scope any command to a single app or package — no need to `cd` into it:

```bash
pnpm --filter <app-name> dev
pnpm --filter <app-name> build
pnpm --filter <app-name> test
```

The `<app-name>` must match the `"name"` in that app's `package.json`.

### Installing dependencies

```bash
# Add to a specific app
pnpm --filter <app-name> add <package>
pnpm --filter <app-name> add -D <package>   # dev dependency

# Add to root (tooling used across all apps)
pnpm add -D -w <package>
```

## After every code change — required quality step

Run both scripts from the repo root after modifying any file:

```bash
pnpm lint:fix && pnpm format:fix
```

This auto-fixes linting violations and reformats code in one pass. If `lint:fix` still reports errors after running, fix them manually before committing — do not skip or suppress them.

To verify without modifying (e.g. before a commit or in CI):

```bash
pnpm lint && pnpm format
```

## How Turborepo caching works

Turborepo hashes your source inputs and caches task outputs. On a cache hit, it replays the result instantly instead of re-running. This means:

- `pnpm build` may print `>>> FULL TURBO` (all cached) or run only the apps whose inputs changed
- `pnpm dev` and `pnpm lint:fix` / `pnpm format:fix` have `cache: false` — they always run fresh
- If something looks stale, run with `--force` to bypass the cache: `pnpm build --force`

## Finding the right place to make a change

| Goal                                     | Where to look                |
| ---------------------------------------- | ---------------------------- |
| Change UI, frontend logic, or styles     | `apps/<frontend-app>/src/`   |
| Change API endpoints or business logic   | `apps/<api-app>/src/`        |
| Change something shared across apps      | `packages/<shared-lib>/src/` |
| Change how tasks run or what gets cached | `turbo.json`                 |
| Change root-level tooling or scripts     | root `package.json`          |

When in doubt, search by file type or keyword across the whole repo:

```bash
grep -r "keyword" apps/ packages/ --include="*.ts"
```
