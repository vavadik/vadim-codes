# CLAUDE.md — apps/web

Vue 3 SPA. All commands below are run from `apps/web/` unless noted.

## Commands

```bash
pnpm dev          # Vite dev server (port 5173)
pnpm build        # vue-tsc type-check + vite build (parallel)
pnpm type-check   # vue-tsc --build only
pnpm test:unit    # Vitest (watch mode: pnpm test:unit --watch)
pnpm preview      # Serve the dist/ build locally
```

## Architecture

```
src/
  main.ts                  # App bootstrap + Pinia + Router
  App.vue                  # Root component (RouterView only)
  router/index.ts          # Routes, auth guard, authInitialized flag
  stores/                  # Pinia stores (composition API style)
  pages/                   # Route-level components (one per route)
  components/
    ui/                    # Reusable DaisyUI-wrapped components
    layouts/               # AppLayout.vue (navbar + slot)
    popup/                 # Modal system (PopupContainer, usePopup)
  composables/             # Shared logic (useApiClient, useTheme, usePopup)
  assets/main.css          # Tailwind imports
```

## Key Patterns

### API calls — always use the ts-rest client

```typescript
import { apiClient } from '@/composables/useApiClient';

const res = await apiClient.todo.list();
if (res.status === 200) {
  /* res.body is fully typed */
}
```

Never use raw `fetch` for contract-defined endpoints. The client is initialized with `credentials: 'include'` so cookies are sent automatically.

The Vite dev proxy forwards `/api/*` → `http://localhost:3000/*` (strips `/api` prefix). Auth endpoints are accessed as `/api/auth/...` from the browser. The contracts package does not know about the `/api` prefix — the client adds it via `baseUrl`.

### Pinia stores — composition API style

```typescript
export const useFooStore = defineStore('foo', () => {
  const items = ref<Foo[]>([]);
  const loading = ref(false);

  async function fetchItems() {
    loading.value = true;
    try {
      const res = await apiClient.foo.list();
      if (res.status === 200) items.value = res.body;
    } finally {
      loading.value = false;
    }
  }

  return { items, loading, fetchItems };
});
```

Always pair async actions with a `loading` ref. Errors that should surface in the UI get their own `error` ref.

### Auth guard

`router/index.ts` calls `authStore.fetchMe()` once on first navigation (guarded by `authInitialized` flag). `fetchMe` tries `/auth/me`; on 401 it silently attempts `/auth/refresh` then retries. Routes with `meta: { requiresAuth: true }` redirect to `/login` if unauthenticated.

### UI components

Use DaisyUI classes directly in templates for one-off styling. For reusable interactive elements, create a component in `components/ui/` and export it from `components/ui/index.ts`.

### Theme

`useTheme()` composable manages `light`/`dark` toggle. Theme is stored in `localStorage` and applied as a `data-theme` attribute on `<html>`.

## Vite Proxy

Defined in `vite.config.ts`:

```
/api  →  http://localhost:3000  (rewrite: strip /api prefix)
```

This means `SF_CALLBACK_URL` must be `http://localhost:5173/api/auth/salesforce/callback` in dev so that Set-Cookie is scoped to the frontend origin.

## Tooling

- **Linter**: oxlint (run from repo root: `pnpm lint`)
- **Formatter**: oxfmt (run from repo root: `pnpm format:fix`)
- **Type checker**: `vue-tsc` (not plain `tsc`) — handles `.vue` files
- **Test runner**: Vitest with jsdom environment
