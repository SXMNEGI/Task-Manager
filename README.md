# Personal Task Manager

## Project Title & Brief Description

**Exercise 1 — Personal Task Manager**

A full-stack task manager built with Node.js/Express and React. Covers all required functionality — create, read, update, delete, toggle, filter, search, overdue highlighting, and task counts — plus one bonus feature: **task priority** (low / medium / high) with colour-coded left-border accents. Tasks persist across server restarts via a JSON file. The app seeds itself with sample tasks on first run so reviewers see a working UI immediately.

See [`DECISIONS.md`](./DECISIONS.md) for the reasoning behind key architectural choices.

---

## Live Demo Links

> After deployment, paste links here.
> - **Frontend:** `https://your-app.netlify.app`
> - **Backend API:** `https://your-api.onrender.com`

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Backend | Node.js + Express | Minimal setup, great for REST APIs, widely understood |
| IDs | `uuid` v4 | Collision-free without a database sequence |
| Persistence | JSON file (`fs` module) | No DB setup; isolated in `store.js` so swapping it out is one file |
| Frontend | React (Create React App) | Component model maps cleanly to a task list |
| Styling | Plain CSS + CSS variables | Zero build complexity; easy for a reviewer to read |
| HTTP | `fetch` (browser built-in) | No extra library needed |
| Tests | Jest + Supertest | Standard Node testing pair; Supertest lets you test routes without starting the server |

---

## How to Run Locally

**Prerequisite:** Node.js v16+. Nothing else needed.

```bash
# 1. Clone
git clone https://github.com/YOUR_USERNAME/task-manager.git
cd task-manager

# 2. Backend (Terminal 1)
cd server
npm install
npm run dev        # → http://localhost:5000

# 3. Frontend (Terminal 2)
cd client
npm install
npm start          # → http://localhost:3000 (opens automatically)
```

The React dev server proxies `/api/*` to `localhost:5000` via `"proxy"` in `client/package.json` — no CORS configuration needed during development.

**Run backend tests:**
```bash
cd server
npm test
```

---

## API Documentation

Base URL (local): `http://localhost:5000/api`

### `GET /tasks`
Returns all tasks, newest first.

| Param | Type | Description |
|---|---|---|
| `search` | query string (optional) | Filter by title, case-insensitive |

**Response 200:**
```json
[
  {
    "id": "uuid",
    "title": "Buy groceries",
    "description": "Milk, eggs",
    "dueDate": "2025-07-01",
    "priority": "medium",
    "completed": false,
    "createdAt": "2025-06-10T10:00:00.000Z",
    "updatedAt": "2025-06-10T10:00:00.000Z"
  }
]
```

---

### `POST /tasks`
Creates a new task.

```json
// Request body
{ "title": "string (required)", "description": "string", "dueDate": "YYYY-MM-DD", "priority": "low|medium|high" }

// Response 201 — the created task object
// Response 400 — { "error": "Title is required" }
```

---

### `PUT /tasks/:id`
Updates any combination of fields. Only sent fields are changed.

```json
// Request body (all optional)
{ "title": "string", "description": "string", "dueDate": "YYYY-MM-DD", "priority": "low|medium|high" }

// Response 200 — the updated task object
// Response 404 — { "error": "Task not found" }
```

---

### `PATCH /tasks/:id/toggle`
Flips `completed` between `true` and `false`. No request body.

```
// Response 200 — the updated task object
// Response 404 — { "error": "Task not found" }
```

---

### `DELETE /tasks/:id`
Permanently deletes a task.

```
// Response 200 — { "message": "Task deleted successfully" }
// Response 404 — { "error": "Task not found" }
```

---

## Project Structure

```
task-manager/
├── DECISIONS.md               ← Why things are built the way they are
│
├── server/
│   ├── app.js                 ← Express app (separate from server start for testability)
│   ├── index.js               ← Starts the server; runs seed on first launch
│   ├── routes/
│   │   └── tasks.js           ← All 5 API route handlers
│   ├── data/
│   │   ├── store.js           ← readTasks() / writeTasks() — the only place that touches the file
│   │   └── seed.js            ← Populates sample tasks on first run
│   └── tests/
│       └── tasks.test.js      ← 11 integration tests (Jest + Supertest)
│
└── client/
    └── src/
        ├── App.js             ← Root component; layout + filter state
        ├── components/
        │   ├── Header.js      ← Sticky header with live task counts
        │   ├── TaskForm.js    ← Add form; expandable for description, due date, priority
        │   ├── FilterBar.js   ← All / Active / Completed toggle
        │   ├── TaskList.js    ← Renders list, loading state, empty state
        │   └── TaskItem.js    ← Single card; inline view/edit mode switch
        ├── hooks/
        │   └── useTasks.js    ← All task state and API calls; keeps components clean
        └── utils/
            ├── api.js         ← All fetch() calls in one place
            └── helpers.js     ← isOverdue(), formatDate()
```

---

## Bonus Features Added

- **Task priority** (low / medium / high) — colour-coded left-border accent on each card, editable in the form and inline edit. Defaults to "medium" if not set, so it's fully backwards-compatible.
- **Seed data** — on first run the app populates 5 sample tasks (including some overdue ones) so the UI is immediately demonstrable.
- **11 integration tests** — covers create, read, search, toggle, and delete.
- **`DECISIONS.md`** — documents the reasoning behind architectural choices.

---

## Next Steps

- **Authentication** — currently one global task list. JWT-based login would give each user their own data.
- **SQLite** — replace the JSON file for better concurrency. `store.js` is already the only file that touches persistence, so the swap would be isolated.
- **Drag-and-drop reorder** — `react-beautiful-dnd` or the HTML5 Drag and Drop API.
- **React Testing Library tests** — the backend is tested; I'd add component tests for `TaskItem`'s view/edit mode switching next.
- **Error boundary** — a top-level `<ErrorBoundary>` to catch unexpected render errors gracefully.
- **Pagination** — loading all tasks at once is fine for personal use; beyond ~500 tasks I'd add cursor-based pagination to `GET /tasks`.
