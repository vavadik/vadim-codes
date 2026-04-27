# CS-03 — Account Deletion

**Type:** User Story  
**Phase:** 1 — Auth  
**Estimate:** S

## Story

> As an authenticated user, I want to permanently delete my account so I have control over my data and can leave the platform cleanly.

## Acceptance Criteria

- [ ] A **Delete Account** option is accessible in the settings section of the left pane (behind at least one confirmation step).
- [ ] Clicking Delete Account shows a confirmation dialog clearly stating: "Your account will be deleted. Your saved snippets will remain accessible via their share links but will no longer appear in any account list."
- [ ] The user must type a confirmation phrase (e.g. their email address or the word `delete`) to enable the final confirm button — prevents accidental deletion.
- [ ] On confirmation, the account record is deleted server-side; the user is immediately signed out and returned to the anonymous state.
- [ ] All snippets previously owned by the deleted account are **orphaned** — their `userId` is set to `null`; they remain accessible via their short-ID links.
- [ ] If the deletion request fails, an error is shown and the account is not deleted.

## Technical Notes

- The API endpoint (`DELETE /users/me`) should:
  1. Nullify `userId` on all snippets owned by this user.
  2. Delete the user record (cascade-delete OAuth tokens, sessions).
  3. Return 204 on success.
- The frontend sign-out flow after deletion is identical to a normal sign-out; re-use that composable method.
- Orphaned snippets are treated as anonymous snippets and are subject to the same 90-day expiry from the time of last view (reset the timer at the point of orphaning to avoid immediate expiry).
