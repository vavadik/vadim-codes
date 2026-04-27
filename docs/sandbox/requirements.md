# Code Sandbox — Product Requirements

## Overview

A browser-based JavaScript playground for individual developers and hobbyists. Users can write and run code instantly without sign-up; creating an account unlocks snippet history and personal snippet management. Execution runs entirely client-side inside a Web Worker — no server-side code runner exists in v1.

---

## 1. Users & Access

### 1.1 Target Audience

- The primary users are **individual developers and hobbyists** — people who want to quickly prototype, test, or share a JavaScript snippet without switching to a local dev environment.
- The app is public and requires no invitation or approval to use.

### 1.2 Authentication Model

- The app is **fully functional without an account**. Anonymous users can write code, execute it, save snippets, and share them.
- Authentication is strictly opt-in. There is no wall blocking anonymous usage.
- Supported providers at launch: **Google OAuth** and **GitHub OAuth**.
- Authenticated users gain access to a personal snippet list (see section 4). No other features are gated behind auth in v1.
- After an anonymous user saves a snippet, the app shows a **soft, non-blocking nudge** ("Save to your account to keep track of your snippets") that can be dismissed.

### 1.3 Account Deletion

- Authenticated users can delete their account.
- Snippets created by a deleted account are **orphaned** — they remain accessible via their original share links; they are simply no longer associated with any user.

### 1.4 What Is Explicitly Out of Scope

- No teams, organizations, or shared workspaces.
- No social features: no comments, reactions, follows, or activity feeds.
- No monetization or usage tiers.
- No admin dashboard in v1.

---

## 2. Application Layout

The app uses a **3-pane layout**:

| Pane       | Contents                                                |
| ---------- | ------------------------------------------------------- |
| **Left**   | Authenticated user's snippet list (nav), settings panel |
| **Center** | Code editor                                             |
| **Right**  | Output tabs: Console, Errors                            |

The layout is fixed; there is no resizable splitter requirement in v1.

---

## 3. Code Editor

### 3.1 Editor Quality

- The editor uses **Monaco Editor** (VSCode's editor) providing:
  - Syntax highlighting for JavaScript.
  - Line numbers.
  - Bracket matching and auto-indentation.
  - Standard keyboard shortcuts (`Ctrl+/` for toggle comment, `Tab` for indent, etc.).
  - Inline error/warning gutter annotations (Monaco's built-in marker API).
- No custom editor implementation.

### 3.2 Scope: Single File Only

- The editor handles **one file at a time**. No file tree or tab bar in v1.
- The implicit file is always treated as JavaScript.

### 3.3 Themes

- The app supports **dark and light themes**, toggled by the user.
- Theme preference is stored in `localStorage` and applied on load.

### 3.4 Editor Preferences

- Font size and tab width are user-configurable.
- Preferences are stored in **`localStorage` only** — not synced to the server or user account.

### 3.5 Draft Auto-Save

- Editor contents are **automatically persisted to `localStorage`** on each change (debounced).
- On first visit (or after localStorage is cleared) the editor opens with a default starter snippet (`console.log("Hello, world!")`).
- When the user opens a shared snippet, the draft is replaced with the snippet's code.

---

## 4. Code Execution

### 4.1 Execution Environment

- Code runs in a **Web Worker**, isolating execution from the main thread.
- The host page (editor, toolbar, output) remains **fully interactive** during execution.

### 4.2 Timeout

- A hard execution timeout is controlled by an **environment variable** (`EXECUTION_TIMEOUT_MS`), defaulting to **10 seconds**.
- On timeout: the worker is terminated, a clear timeout message is shown in the Console tab, and the UI returns to idle.

### 4.3 Cancellation

- A **Stop** button is visible and active while code is running.
- Clicking Stop terminates the worker immediately; partial output up to cancellation is preserved.

### 4.4 Execution Timer

- While code is running, a **live elapsed-time counter** is shown in the toolbar (e.g. `3.2s`).
- The counter stops on completion, timeout, or cancellation and displays the final duration.

### 4.5 Console Output

- `console.log`, `console.warn`, `console.error`, and `console.info` are captured and displayed in the **Console tab** (right pane).
- Each entry is stamped with its log level.
- Output is cleared at the start of each new execution.

### 4.6 Runtime Errors

- Uncaught runtime errors are displayed in the **Errors tab** (right pane) with a cleaned stack trace.
- Monaco's marker API is used to show **inline gutter annotations** for errors that include a line number.

### 4.7 High CPU Warning

- If the Web Worker reports sustained high CPU usage before the timeout fires, the app shows a **non-blocking warning banner** offering the user the option to stop execution. (Nice-to-have; does not block v1 launch.)

---

## 5. Snippets — Saving & Sharing

### 5.1 Who Can Save

- **Any user** (anonymous or authenticated) can save the current editor contents and receive a **shareable short-ID link** (e.g. `/s/abc123`).
- No confirmation or account prompt is required before saving.

### 5.2 Shareable Links

- Short IDs are server-generated and resolved server-side.
- A link exactly reproduces the code saved at the moment of the save — the record is immutable.
- Links are stable: loading the URL in the future always returns the same content.

### 5.3 Opening a Shared Snippet

- Opening a shared link loads the snippet's code into the editor.
- The editor is **always interactive** — viewers can edit freely; their edits are local only.
- If a viewer saves (or clicks **Fork**), the app creates a **new snippet with a new ID** — the original is never mutated.

### 5.4 Fork

- When an authenticated or anonymous user saves code that originated from someone else's snippet, the save automatically creates a new snippet (i.e. fork is implicit in the save action).
- A visible **Fork** button provides an explicit one-click shortcut to do the same.

### 5.5 Authenticated Snippet List (Left Pane)

- Authenticated users see a **personal snippet list** in the left pane listing all snippets saved while logged in.
- Each entry shows: title (or first-line preview), save timestamp, and action buttons.
- The list is empty for anonymous users (left pane shows only settings).

### 5.6 Snippet Management (Authenticated)

- Authenticated users can **rename**, **delete**, and **update** (overwrite) their saved snippets.
- Updating a snippet mutates the stored code but preserves the same short ID and share link.

### 5.7 Snippet Limits

- Each authenticated user may save up to **100 snippets**.
- When a user reaches the limit and attempts to save, the app shows a warning: "You've reached your 100-snippet limit — delete some old snippets to save new ones."

### 5.8 Anonymous Snippets

- Anonymous snippets are **not listed anywhere** — accessible only via direct link.
- Anonymous snippets **expire after 90 days of no views**.
- Authenticated user snippets **never expire**.

### 5.9 Snippet Size Limit

- Maximum snippet size is the same for anonymous and authenticated users.
- Initial limit: **500 KB** (to be fine-tuned based on storage costs and usage data).

---

## 6. Abuse Prevention

### 6.1 Execution Timeout

- The hard 10-second worker timeout (section 4.2) is the primary client-side guard.

### 6.2 Server-Side Rate Limiting

- A **base rate-limiting layer** is set up on the API at launch (e.g. per-IP limit on snippet creation endpoints).
- Exact thresholds are left as TBD and will be tuned based on real traffic patterns.

### 6.3 Client-Side Debounce

- The Save action is debounced client-side to prevent accidental duplicate saves on rapid clicks.

---

## 7. Out of Scope for v1

| Feature                                       | Notes                                                  |
| --------------------------------------------- | ------------------------------------------------------ |
| Server-side execution / Docker backend        | Planned if server-side languages are added             |
| TypeScript support                            | Planned; requires transpilation step in the worker     |
| Python support                                | Planned; requires a WASM Python runtime (e.g. Pyodide) |
| Multi-file / project workspaces               | Significant UX lift; deferred                          |
| Real-time collaboration / multiplayer editing | Deferred                                               |
| Snippet versioning / history                  | Deferred                                               |
| User profiles, public snippet galleries       | Deferred                                               |
| Comments or social features                   | Out of scope                                           |
| Monetization or usage tiers                   | Out of scope                                           |
| Embed / iframe mode                           | Out of scope                                           |
| Admin dashboard                               | Out of scope                                           |
