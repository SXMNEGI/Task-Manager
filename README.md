# Personal Task Manager

## What this is

I chose Exercise 1 — the personal task manager. It's a full-stack app with a Node.js/Express backend and a React frontend. You can add tasks with a title, description, and due date, mark them complete, edit them inline, delete them, filter by status, and search by title. Tasks are saved to a JSON file so they survive server restarts.

I went a bit beyond the brief in a few places. I added task priority (low / medium / high) because it felt like an obvious gap, and I built a live analytics dashboard on the right side of the screen that shows your completion progress, a priority breakdown, a due-date horizon, and a 28-day activity grid — all computed from the task list in real time, no extra API calls. There's also a dark/light theme toggle that remembers your preference.

If you want to understand why I made certain technical decisions — like why `app.js` and `index.js` are separate, or why I used `useCallback` — I wrote all of that up in [`DECISIONS.md`](./DECISIONS.md).

---

## Live Demo

- **Frontend:** `https://your-app.netlify.app`
- **Backend:** `https://your-api.onrender.com`

> Note: the backend runs on Render's free tier, which spins down after 15 minutes of inactivity. First load after a period of inactivity may take 20–30 seconds to wake up.

---

## Tech stack

| | Choice | Why I picked it |
|---|---|---|
| Backend | Node.js + Express | Straightforward to set up, easy to read, does exactly what's needed |
| IDs | `uuid` v4 | No database sequence needed — just generates a unique string |
| Storage | JSON file via `fs` | The brief said a JSON file was fine. All file access is in one place (`store.js`) so swapping to a real DB later is a one-file change |
| Frontend | React (Create React App) | Hooks and components map cleanly onto a task list UI |
| Styling | Plain CSS + CSS variables | No build tooling complexity, easy to read, themes work with a single attribute swap on `<html>` |
| HTTP | browser `fetch` | No extra library needed |
| Tests | Jest + Supertest | Industry standard for Node — Supertest lets you hit routes without starting a real server |

---

## Running it locally

You just need Node.js (v16 or above). Nothing else.

```bash
# clone the repo
git clone https://github.com/YOUR_USERNAME/task-manager.git
cd task-manager

# terminal 1 — start the backend
cd server
npm install
npm run dev
# running on http://localhost:5000

# terminal 2 — start the frontend
cd client
npm install
npm start
# opens http://localhost:3000 automatically
```

The first time you start the backend it seeds 5 sample tasks so you see a working UI straight away rather than an empty list.

The React dev server proxies `/api/*` requests to port 5000 via the `"proxy"` field in `client/package.json`, so there are no CORS issues in development.

**To run the tests:**
```bash
cd server
npm test
# 11 tests, all should be green
```

---

## API

Base URL: `http://localhost:5000/api`

### GET /tasks
Returns all tasks, newest first. Pass `?search=keyword` to filter by title.

```json
[
  {
    "id": "uuid-string",
    "title": "Review pull request",
    "description": "Check edge cases for token expiry",
    "dueDate": "2025-07-01",
    "priority": "high",
    "completed": false,
    "createdAt": "2025-06-10T10:00:00.000Z",
    "updatedAt": "2025-06-10T10:00:00.000Z"
  }
]
```

### POST /tasks
Creates a task. `title` is required, everything else is optional.

```json
// request
{ "title": "string", "description": "string", "dueDate": "YYYY-MM-DD", "priority": "low|medium|high" }

// 201 — returns the created task
// 400 — { "error": "Title is required" }
```

### PUT /tasks/:id
Updates a task. Only the fields you send get changed.

```json
// request — all fields optional
{ "title": "string", "description": "string", "dueDate": "YYYY-MM-DD", "priority": "low|medium|high" }

// 200 — returns the updated task
// 404 — { "error": "Task not found" }
```

### PATCH /tasks/:id/toggle
Flips `completed` between true and false. No request body needed.

```
// 200 — returns the updated task
// 404 — { "error": "Task not found" }
```

### DELETE /tasks/:id
Deletes a task permanently.

```
// 200 — { "message": "Task deleted successfully" }
// 404 — { "error": "Task not found" }
```

---

## Project structure

```
task-manager/
├── DECISIONS.md               ← why I made the architectural choices I did
│
├── server/
│   ├── app.js                 ← Express app — kept separate from index.js so tests can import it without starting a server
│   ├── index.js               ← starts the server and runs the seed on first launch
│   ├── routes/
│   │   └── tasks.js           ← all five route handlers
│   ├── data/
│   │   ├── store.js           ← the only file that touches tasks.json
│   │   └── seed.js            ← creates sample tasks on first run if the file doesn't exist
│   └── tests/
│       └── tasks.test.js      ← 11 integration tests covering every endpoint
│
└── client/
    └── src/
        ├── App.js             ← root component; wires together the layout, theme, and filter state
        ├── components/
        │   ├── TaskForm.js    ← controlled form; expands to show description, due date, priority
        │   ├── FilterBar.js   ← All / Active / Completed filter buttons
        │   ├── TaskList.js    ← handles loading state, empty state, and the task list
        │   ├── TaskItem.js    ← single task row with inline edit mode
        │   ├── Dashboard.js   ← live right panel: completion ring, priority bars,
        │   │                     due-date horizon, 28-day activity grid, smart insights
        │   └── Dashboard.css
        ├── hooks/
        │   └── useTasks.js    ← custom hook; all task state and API calls live here so components stay clean
        └── utils/
            ├── api.js         ← every fetch() call in one place
            └── helpers.js     ← isOverdue(), formatDate()
```

---

## What I'd do next

A few things I left out intentionally given the time, and would pick up next:

**Authentication** — right now everyone shares one task list. Adding JWT-based login would give each user their own data. I'd add a `users` table and attach a `userId` foreign key to tasks.

**SQLite instead of JSON** — the JSON file works fine for a single user, but it reads and writes the whole file on every request. SQLite would be a straightforward swap — `store.js` is the only file that touches storage, so the rest of the codebase wouldn't change.

**Task detail panel** — clicking a task could open a full detail view in the right panel, pushing the dashboard aside. The split layout is set up for exactly this kind of expansion.

**Component tests** — the backend routes are tested but the frontend isn't. I'd use React Testing Library to test `TaskItem`'s view/edit mode switching and the `Dashboard` calculations next.

**Drag to reorder** — `react-beautiful-dnd` would let users prioritise tasks manually, which feels like the most-wanted missing feature.

**Pagination** — loading all tasks at once is fine for personal use. Past a few hundred tasks I'd add cursor-based pagination to `GET /tasks` and virtualise the list rendering.
