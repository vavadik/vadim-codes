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

Prefer utility classes from the project's Tailwind setup over custom CSS. Add `<style scoped>` only when a utility-class approach would be genuinely awkward (e.g. complex animations, pseudo-element tricks). Avoid global styles in component files.
