---
name: vue-fe
description: Best practices and conventions for Vue 3 frontend development in this project. Use this skill whenever writing, editing, or reviewing any Vue component, composable, view, or frontend feature — even for small changes. It covers SFC structure, TypeScript patterns, component composition rules, and the UI kit decision tree that determines where new components should live.
---

# Vue 3 Frontend — Developer Guide

## SFC section order

Every Single File Component follows this order — template first, then logic, then styles:

```vue
<template>
  <!-- markup here -->
</template>

<script setup lang="ts">
// logic here
</script>

<style scoped>
/* styles here (only if needed) */
</style>
```

Keeping template first makes the component's public interface (what it renders) immediately visible when opening a file, which speeds up reading and review.

## Script setup conventions

Always use `<script setup lang="ts">`. This is the most concise form of the Composition API and avoids boilerplate.

```vue
<script setup lang="ts">
import { ref, computed } from 'vue';

// Props — use TypeScript generics, not runtime validators
const props = withDefaults(
  defineProps<{
    label: string;
    count?: number;
  }>(),
  { count: 0 }
);

// Emits
const emit = defineEmits<{ change: [value: string] }>();

// Two-way binding
const model = defineModel<string>({ default: '' });

// Reactive state
const isOpen = ref(false);

// Derived state belongs in computed, not in the template
const displayLabel = computed(() => props.label.trim() || 'Untitled');
</script>
```

Key rules:

- Declare props with TypeScript — avoid `PropType` and runtime validators
- Use `defineModel` for two-way bindings instead of manual prop + emit pairs
- Put derived values in `computed` — keep templates declarative and free of logic
- Extract repeated logic into composables in `src/composables/`

## Template guidelines

- Use `<RouterLink>` for internal navigation, not `<a href>`
- Prefer `v-model` over `:value` + `@input` pairs
- Avoid complex expressions in templates — move them to `computed` or methods
- Use `v-for` with `:key` set to a stable unique identifier, not the loop index

## Component structure principle

A component should do one thing. If a component is handling both UI rendering and data fetching or business logic, split it: one component for the UI shape, a composable or parent component for the data.

---

## UI kit — check before building

Before writing any new component, read the current UI kit to see what already exists:

```
src/components/ui/index.ts   ← canonical list of available components
```

Import from the barrel export:

```ts
import { Button, Card, Input } from '@/components/ui';
```

The UI kit components are intentionally generic — they handle visual states (variants, sizes, loading, errors) so feature components don't have to.

## Where to put a new component

Ask two questions:

**1. Is this component reusable across different features with no business logic?**

If yes → add it to `src/components/ui/`. A component belongs here if:

- It could exist in any Vue project (not tied to this app's domain)
- It only receives data via props/slots and communicates via emits
- It has no knowledge of stores, routes, or API calls

Examples of things that belong in the UI kit: a `Tooltip`, a `Select`, a `Tabs` container, a `FileUpload` input.

**2. Is this component specific to a feature or page?**

If yes → create it in the relevant feature directory (e.g. `src/views/`, `src/features/<name>/`), but **compose it from UI kit components**. Feature components should use `Button`, `Card`, `Input`, etc. from the kit rather than reimplementing visual elements.

```vue
<!-- Good: feature component that composes from the UI kit -->
<template>
  <Card>
    <template #header>Create post</template>
    <Input v-model="title" label="Title" />
    <Button :loading="saving" @click="save">Publish</Button>
  </Card>
</template>

<script setup lang="ts">
import { Card, Input, Button } from '@/components/ui';
// ...
</script>
```

Never copy-paste visual styles from UI kit components into a feature component — if you find yourself doing that, the right answer is either to use the existing component or extend the kit.

## Decision tree

```
Need a new UI element?
│
├─ Already exists in src/components/ui/? ──→ Use it directly.
│
├─ Generic, no business logic?  ──────────→ Add it to src/components/ui/.
│                                           Follow existing component patterns:
│                                           variant/size props, TypeScript types,
│                                           slots for composition.
│
└─ Feature-specific? ─────────────────────→ Create in feature directory.
                                            Compose from existing UI kit components.
                                            Keep business logic out of the template.
```

## Styling

Use `<style scoped lang="scss">` for all component styles. Never use plain `<style scoped>` (no `lang`).

Write styles with **BEM** (Block Element Modifier):

```scss
// Block
.card { ... }

// Element  — double underscore
.card__title { ... }
.card__body { ... }

// Modifier — double hyphen, always on the block or element it modifies
.card--featured { ... }
.card__title--large { ... }
```

Nest elements and modifiers inside the block using SCSS `&`:

```vue
<style scoped lang="scss">
.card {
  padding: 1rem;

  &__title {
    font-weight: 600;
  }

  &__body {
    margin-top: 0.5rem;
  }

  &--featured {
    border: 2px solid var(--color-primary);
  }
}
</style>
```

Rules:

- **One block per component** — the block name matches the component's root element class.
- BEM classes only. Do not mix Tailwind utilities and BEM in the same element — pick one per component. Tailwind utilities are for quick layout primitives in page-level wrappers; BEM SCSS is for anything with meaningful component-specific style.
- **No hardcoded color values** — never write hex, rgb, oklch, or hsl literals in component styles. Always use a CSS custom property from the design system. If the right token doesn't exist, add it to the theme in `src/assets/main.css` first.
- Only add `<style scoped lang="scss">` if styles are actually needed. Don't add an empty block.
- Avoid global styles in component files.

## Design system color tokens

All tokens are defined in `src/assets/main.css` — both `light` and `dark` theme blocks. Every token must be present in both themes.

### Surface tokens

| Token                  | Usage                                              |
| ---------------------- | -------------------------------------------------- |
| `--color-base-100`     | Panel backgrounds, cards, inputs                   |
| `--color-base-200`     | Canvas background, toolbar strip, alternating rows |
| `--color-base-300`     | Borders, dividers, resize handles                  |
| `--color-base-content` | Default text and icon color                        |

### Interactive / accent tokens

| Token                         | Usage                                                     |
| ----------------------------- | --------------------------------------------------------- |
| `--color-accent`              | Selection outlines, active states, primary action buttons |
| `--color-accent-content`      | Text/icons on accent-colored backgrounds                  |
| `--color-accent-hover`        | Hover state of accent-colored elements                    |
| `--color-accent-subtle`       | Subtle tinted background for active/toggled states        |
| `--color-accent-subtle-hover` | Hover on accent-subtle backgrounds                        |

### Semantic tokens

| Token                     | Usage                           |
| ------------------------- | ------------------------------- |
| `--color-error`           | Error borders, error text       |
| `--color-error-subtle`    | Error background tint           |
| `--color-primary`         | Brand color (links, highlights) |
| `--color-neutral`         | Tooltip backgrounds             |
| `--color-neutral-content` | Text on neutral backgrounds     |

### Muted / opacity patterns

For muted text or faint outlines where no named token exists, use `color-mix`:

```scss
// ~40% opacity muted text
color: color-mix(in oklch, var(--color-base-content) 40%, transparent);
```

### Canvas page exception

The PDF canvas page (`CanvasPage.vue`) intentionally uses literal white and dark text because it represents printed paper, not a themed UI surface. This is the **only** acceptable exception to the no-hardcoded-colors rule.
