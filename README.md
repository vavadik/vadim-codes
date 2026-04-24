# vadim-codes

Turborepo monorepo managed with pnpm.

## Requirements

- Node >= 18
- pnpm 10.33.0

## Getting started

```sh
pnpm install
pnpm dev
```

## Commands

| Command            | Description                 |
| ------------------ | --------------------------- |
| `pnpm dev`         | Start all apps in dev mode  |
| `pnpm build`       | Build all apps              |
| `pnpm lint`        | Lint with oxlint            |
| `pnpm lint:fix`    | Auto-fix lint issues        |
| `pnpm format`      | Check formatting with oxfmt |
| `pnpm format:fix`  | Auto-format with oxfmt      |
| `pnpm check-types` | Type-check all packages     |

## Tooling

- [Turborepo](https://turborepo.dev) — task orchestration and caching
- [pnpm](https://pnpm.io) — package manager
- [oxlint](https://oxc.rs/docs/guide/usage/linter) — linter
- [oxfmt](https://github.com/nicolo-ribaudo/oxfmt) — formatter
- [TypeScript](https://www.typescriptlang.org) — static type checking
