---
name: spec
description: >
  Spec-driven development workflow for this monorepo. Use whenever a new feature, project, or
  epic needs to be decomposed into user stories and an implementation plan. Triggers on: "create
  stories for X", "write a spec for X", "decompose this feature", "plan out X", "break this into
  stories", "write user stories", or when a requirements doc is referenced and the user wants it
  turned into actionable work. Creates story files and an implementation plan in docs/<project>/
  following the exact conventions used in docs/sandbox, docs/scrum-poker, and docs/composer-ai.
  Always use this skill — do not improvise the format.
---

# Spec-Driven Development

This skill converts a feature description or requirements doc into a full story set + implementation
plan, stored under `docs/<project>/` in the canonical format used across this repo.

---

## Step 0 — Establish context

Before writing anything, determine:

1. **Project name** — the human-readable name (e.g. "Image Ranking", "Scrum Poker")
2. **Story prefix** — 2–3 uppercase letters derived from the project name (e.g. IR, PS, CS).
   Check `docs/` for existing prefixes to avoid collisions.
3. **Target directory** — `docs/<project-slug>/` where `<project-slug>` is kebab-case
   (e.g. `composer-ai`, `scrum-poker`, `sandbox`)
4. **Source material** — either a requirements doc the user points to, or requirements gathered
   from the conversation. Read the doc fully before decomposing.

If any of these are ambiguous, ask before writing files.

---

## Step 1 — Decompose into stories

Identify the full story set. For each story decide:

- **Type**: `User Story` (delivers user-visible value) or `Task` (infrastructure, no direct user action)
- **Phase**: group stories into 3–5 sequential phases. Phase 0 is always foundation/infrastructure.
  Give each phase a short name (e.g. "Foundation", "Core Flow", "Caching", "Integration")
- **Estimate**: XS / S / M / L (see size reference below)
- **Dependencies**: which stories must be done first; which can run in parallel

Think about what can be built independently and what is blocked. A story that touches only one
layer (e.g. NestJS-only or Python-only) can often be developed in parallel with another layer.

### Story size reference

| Size | Rough effort |
| ---- | ------------ |
| XS   | < half day   |
| S    | ~1 day       |
| M    | 2–3 days     |
| L    | 4–5 days     |

---

## Step 2 — Create the directory structure

```
docs/<project-slug>/
├── <feature>-plan.md          ← implementation plan (create now)
├── <feature>-requirements.md  ← requirements doc (already exists or create if missing)
└── stories/
    ├── PREFIX-01-<slug>.md
    ├── PREFIX-02-<slug>.md
    └── ...
```

Create `docs/<project-slug>/stories/` if it doesn't exist.

---

## Step 3 — Write each story file

Save to `docs/<project-slug>/stories/<PREFIX>-<NN>-<slug>.md`.

Use zero-padded two-digit numbers (01, 02, … 10, 11, …). The slug is kebab-case title.

### Story file template

```markdown
# PREFIX-NN — Story Title

**Type:** User Story | Task
**Phase:** N — Phase Name
**Estimate:** XS | S | M | L

## Story

> As a [actor], I want [action] so that [benefit].

## Acceptance Criteria

- [ ] Criterion one
- [ ] Criterion two

## Technical Notes

- Implementation detail that isn't obvious from the ACs
- External dependency, constraint, or non-obvious approach
```

### Rules

- The `## Story` blockquote is required on every file, even Tasks. For Tasks, the actor is
  typically "a developer" or "the system".
- `## Technical Notes` is optional — only include it if there is something genuinely non-obvious.
  Do not pad it with things derivable from the ACs.
- Additional sections (response shapes, schemas, ASCII diagrams, error tables) are welcome when
  they add clarity. Name them descriptively (e.g. `## Response Shape`, `## DTO Shape`,
  `## Worker Message Protocol`).
- `## Future Considerations` is optional — use it to park out-of-scope ideas that relate to
  this specific story.

---

## Step 4 — Write the implementation plan

Save to `docs/<project-slug>/<feature>-plan.md`.
If the project already has a plan file, update it rather than creating a new one.

### Plan template

````markdown
# Project Name — Implementation Plan

> Progress legend: ⬜ not started · 🔄 in progress · ✅ done · ❌ blocked

---

## Phase 0 — Foundation

One sentence describing what is true after this phase completes.

| #         | Story                                    | Estimate | Status | Notes |
| --------- | ---------------------------------------- | -------- | ------ | ----- |
| PREFIX-01 | [Story title](stories/PREFIX-01-slug.md) | S        | ⬜     |       |

---

## Phase 1 — …

…

---

## Dependency Graph

```
PREFIX-01 ──▶ PREFIX-02 ──▶ PREFIX-03 ──┐
                                         ├──▶ PREFIX-05
PREFIX-04 ───────────────────────────────┘
```

Key rules:

- Which story is the riskiest and should be started first?
- Which stories can be developed in parallel?
- What is the critical path?

---

## Story Size Reference

| Size | Rough effort |
| ---- | ------------ |
| XS   | < half day   |
| S    | ~1 day       |
| M    | 2–3 days     |
| L    | 4–5 days     |

---

## Future Milestones (out of scope for v1)

- **Feature name** — one-line description
````

### Rules

- One table row per story. Link the story title to its file using a relative path:
  `[Title](stories/PREFIX-NN-slug.md)`
- Status column always starts as `⬜` — never pre-fill with ✅
- Notes column is for short, permanent context (not progress updates)
- The dependency graph uses ASCII art (`──▶`). Every story that has a dependency must appear.
  Stories with no prerequisites start at the left edge.
- "Key rules" below the graph should call out the critical path and any notable parallelism.
- Future Milestones should reflect the requirements doc's out-of-scope section. Add any
  obvious next-version ideas even if not in the requirements doc.

---

## Worked example

For reference, inspect the files in these directories — they are the canonical examples:

- `docs/sandbox/` — Code Sandbox, prefix `CS`, ~20 stories
- `docs/scrum-poker/` — Scrum Poker, prefix `PS`, ~20 stories
- `docs/composer-ai/` — Image Ranking, prefix `IR`, 6 stories (smallest example)

When in doubt about format, read a story from one of these directories.
