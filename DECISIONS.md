# Architecture & Design Decisions

> This file documents the *why* behind key choices in this project.
> I find it more useful than comments for decisions that span multiple files.

---

## 1. Why a custom `useTasks` hook instead of putting state in `App.js`?

The moment I had `tasks`, `loading`, `error`, `search`, and five handler functions all
living in `App.js`, the component was doing two jobs: managing data AND rendering UI.
That's the kind of thing that gets messy fast.

Moving everything into `useTasks` means:
- `App.js` only cares about layout and what to render
- The hook only cares about data and API calls
- If I ever wanted to show task stats in a sidebar component, I just call `useTasks()` there too — no prop drilling

The pattern is basically a lightweight version of what Redux or Zustand do, without the boilerplate.

---

## 2. Why a JSON file instead of SQLite or PostgreSQL?

The brief explicitly said "an in-memory array or JSON file is fine." I took that seriously.

Using SQLite would have been technically impressive but it would have introduced:
- A new dependency (`better-sqlite3` or `sequelize`)
- Schema migration logic
- More setup steps for the reviewer

The JSON file approach has one real weakness: it reads and writes the *entire* file on every request. For a personal task manager with ~100 tasks, that's fine (the file will be a few KB). At scale you'd replace `store.js` with a proper DB client — and because I isolated all file I/O to that one module, the rest of the codebase doesn't change at all.

**How I'd migrate to SQLite if needed:**
```js
// store.js would become:
const db = require('better-sqlite3')('tasks.db');
db.exec(`CREATE TABLE IF NOT EXISTS tasks (...)`);

function readTasks() {
  return db.prepare('SELECT * FROM tasks ORDER BY createdAt DESC').all();
}
function writeTasks(tasks) { /* not needed — write on mutation instead */ }
```
Everything else stays the same.

---

## 3. Why `PATCH /tasks/:id/toggle` instead of just using `PUT`?

A `PUT` request is supposed to replace the whole resource. If I used `PUT` for toggling,
the client would need to send the entire task object just to flip one boolean. That's wasteful.

`PATCH` means "apply a partial update." A dedicated `/toggle` endpoint is even more expressive —
it says exactly what it does and requires zero request body. The intent is unambiguous.

This is the same pattern GitHub uses for starring a repo: `PUT /user/starred/:repo` (no body).

---

## 4. Why optimistic updates only for toggle, not for delete/edit?

Optimistic update = update the UI immediately, before the server confirms.

For **toggling**, this makes sense: it's a single boolean flip, the server almost never rejects it,
and the perceived speed difference is noticeable on every click.

For **deleting**, I kept a confirmation dialog (`window.confirm`) which introduces a natural pause —
the user has already waited, so a quick server round-trip after that is invisible.

For **editing**, the server might reject the update (e.g. empty title), so showing the
"saved" state before knowing the result would be misleading.

Rule of thumb: optimistic updates are worth it when (a) the operation is very frequent,
(b) failure is rare, and (c) reverting on failure is easy.

---

## 5. Why `useCallback` on `loadTasks`?

This one trips up a lot of React developers.

`loadTasks` is defined inside the hook, so it gets a **new function reference** on every render.
If I put it in a `useEffect` dependency array without `useCallback`, the sequence becomes:

```
render → loadTasks (new ref) → useEffect fires → fetch → setState → render → loadTasks (new ref) → ...
```

Infinite loop. `useCallback` memoises the function so its reference only changes when
`search` changes — which is when we actually *want* to re-fetch.

---

## 6. Why add a `priority` field when it wasn't in the brief?

Two reasons:

1. It's a natural extension that any real task manager would have. Adding it shows
   product thinking — I'm not just implementing a spec, I'm thinking about what a
   user actually needs.

2. It gave me a chance to show how to extend the API cleanly without breaking existing
   behaviour. Priority defaults to `"medium"`, so any client that doesn't send it gets
   sensible behaviour automatically. That's backwards-compatible API design.

I flagged it clearly in the README as a bonus addition, not a core requirement. I wouldn't
sneak in unrequested features without noting them.

---

## 7. Why `window.confirm` for delete confirmation instead of a custom modal?

Honest answer: a custom modal would look better, but `window.confirm` is:
- Accessible by default (keyboard navigable, screen reader friendly)
- Zero lines of CSS
- Universally understood by users

Building a custom modal would have taken 30–45 minutes and added ~80 lines of code
for something that `window.confirm` handles in one line. Given the time budget of this
exercise, that trade-off felt wrong.

If this were a production app, I'd use a modal — probably from a component library
to keep it accessible.

---

## 8. The seed data

`data/seed.js` pre-populates the app with realistic sample tasks on first run.
The tasks are written to be mildly self-aware — a small acknowledgement that every
developer's real task list looks roughly like this.

The seed only runs if `tasks.json` doesn't exist yet, so it won't overwrite real data.

---

## What I'd do differently with more time

- **Tests**: I added a basic route test (`server/tests/tasks.test.js`), but I'd want
  React Testing Library tests for `TaskItem`'s edit/view mode switching.
- **Input sanitisation**: Currently trusting `title.trim()`. In production I'd add a
  library like `validator.js` and sanitise against XSS.
- **Pagination**: Loading all tasks at once works for personal use. Beyond ~500 tasks
  I'd add cursor-based pagination to the `GET /tasks` endpoint.
- **Error boundary**: The React app has no error boundary. A top-level
  `<ErrorBoundary>` component would catch render errors gracefully.
