# CS-15 — Anonymous Account Nudge

**Type:** User Story  
**Phase:** 4 — Snippets  
**Estimate:** XS

## Story

> As the product, I want to gently remind anonymous users that signing in lets them keep track of their snippets, so they have a reason to create an account without feeling pressured.

## Acceptance Criteria

- [ ] After an anonymous user successfully saves a snippet, a **soft, non-blocking nudge** appears (toast or inline banner): "Sign in to keep track of all your snippets."
- [ ] The nudge includes a **Sign In** link that opens the auth flow (CS-02).
- [ ] The nudge can be dismissed; dismissing it for a session suppresses it for the remainder of that session (not persisted to localStorage — it may reappear on the next visit).
- [ ] The nudge does **not** appear for authenticated users.
- [ ] The nudge does **not** block or delay the save operation — it appears after the share link is already shown.
- [ ] The nudge appears at most once per page session, regardless of how many snippets the user saves.

## Technical Notes

- A session-scoped flag (`nudgeShown: boolean`) in a Pinia store or module-level variable is sufficient — no localStorage write needed.
- The nudge is triggered by the save success event in CS-12; check `isAuthenticated` and `nudgeShown` before showing.
