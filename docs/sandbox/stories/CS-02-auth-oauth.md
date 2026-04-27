# CS-02 — Authentication (Google & GitHub OAuth)

**Type:** User Story  
**Phase:** 1 — Auth  
**Estimate:** M

## Story

> As a developer, I want to sign in with my Google or GitHub account so I can access my personal snippet list without managing a separate password.

## Acceptance Criteria

- [ ] A **Sign In** button is visible in the left pane for unauthenticated users.
- [ ] Clicking Sign In presents a choice: **Continue with Google** or **Continue with GitHub**.
- [ ] Completing OAuth redirects back to the app with the user authenticated; the UI updates immediately without a full page reload (or gracefully after redirect).
- [ ] The authenticated user's name and avatar are displayed in the left pane.
- [ ] A **Sign Out** option is accessible from the user area; clicking it clears the session and returns the user to the anonymous state.
- [ ] If a sign-in attempt fails (provider error, network issue), a clear error message is shown; the user can retry.
- [ ] Auth state persists across page refreshes (session cookie or token managed server-side / via the auth library).

## Technical Notes

- Use the project's chosen auth library (e.g. a NestJS + Passport strategy on the API, with session cookies; or a hosted provider like Auth.js / Clerk).
- The frontend reads auth state from a `useAuth()` composable that exposes `{ user, isAuthenticated, signIn, signOut }`.
- Protected API endpoints (snippet list, save-to-account) return 401 for unauthenticated requests; the frontend handles this gracefully.
- No email/password flow in v1.
