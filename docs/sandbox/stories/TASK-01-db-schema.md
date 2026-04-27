# TASK-01 — Database Schema (Users & Snippets)

**Type:** Technical Task  
**Phase:** 0 — Foundation  
**Estimate:** S

## Goal

Define and migrate the initial Prisma schema covering users (OAuth accounts) and snippets.

## Schema

```prisma
model User {
  id        String   @id @default(cuid())
  email     String?  @unique
  name      String?
  avatarUrl String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  accounts  OAuthAccount[]
  snippets  Snippet[]
}

model OAuthAccount {
  id                String @id @default(cuid())
  userId            String
  provider          String  // "google" | "github"
  providerAccountId String
  accessToken       String?
  refreshToken      String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Snippet {
  id           String    @id  // short ID — see TASK-02
  code         String    @db.Text
  title        String?
  preview      String?          // first line, truncated; computed on write
  userId       String?          // null = anonymous or orphaned
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  lastViewedAt DateTime  @default(now())

  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([userId])
  @@index([lastViewedAt])  // supports expiry cleanup query
}
```

## Acceptance Criteria

- [ ] Prisma migration created and applied in the sandbox-db package.
- [ ] `onDelete: Cascade` on `OAuthAccount` so OAuth rows are removed when the user is deleted.
- [ ] `onDelete: SetNull` on `Snippet.userId` so snippets are orphaned (not deleted) when a user is deleted.
- [ ] `@@index([lastViewedAt])` exists to support efficient expiry queries (CS-18).
- [ ] Snippet `id` is a short alphanumeric string — populated by the application layer, not a DB default (see TASK-02).
- [ ] `preview` column is populated on every snippet write by the API service (first non-empty line, max 80 chars).

## Notes

- `code` uses `@db.Text` (or equivalent) to allow snippets up to 500 KB.
- `title` is nullable — snippets have no required title; the UI falls back to `preview` when title is null.
- No `views` counter in v1; `lastViewedAt` is sufficient for the expiry policy.
