// server/routes/tasks.js
// All REST API endpoints for tasks.
//
// Route summary:
//   GET    /api/tasks              — list all tasks (supports ?search=)
//   POST   /api/tasks              — create a task
//   PUT    /api/tasks/:id          — update title / description / dueDate / priority
//   PATCH  /api/tasks/:id/toggle   — flip completed boolean
//   DELETE /api/tasks/:id          — remove a task

const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const { readTasks, writeTasks } = require("../data/store");

// Valid priority values — defined once so both POST and PUT use the same list
const VALID_PRIORITIES = ["low", "medium", "high"];

// ── GET /api/tasks ────────────────────────────────────────────────────────────
// Returns all tasks sorted newest-first.
// Optional ?search= query param filters by title (case-insensitive).
router.get("/", (req, res) => {
  try {
    let tasks = readTasks();

    const { search } = req.query;
    if (search && search.trim()) {
      const keyword = search.toLowerCase();
      tasks = tasks.filter((t) => t.title.toLowerCase().includes(keyword));
    }

    tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(tasks);
  } catch (err) {
    console.error("GET /tasks error:", err);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// ── POST /api/tasks ───────────────────────────────────────────────────────────
// Body: { title* , description?, dueDate?, priority? }
// priority defaults to "medium" if not provided — backwards-compatible.
router.post("/", (req, res) => {
  try {
    const { title, description, dueDate, priority } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }

    if (priority && !VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({
        error: `priority must be one of: ${VALID_PRIORITIES.join(", ")}`,
      });
    }

    const newTask = {
      id: uuidv4(),
      title: title.trim(),
      description: description ? description.trim() : "",
      dueDate: dueDate || null,
      priority: priority || "medium", // sensible default
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const tasks = readTasks();
    tasks.push(newTask);
    writeTasks(tasks);

    res.status(201).json(newTask);
  } catch (err) {
    console.error("POST /tasks error:", err);
    res.status(500).json({ error: "Failed to create task" });
  }
});

// ── PUT /api/tasks/:id ────────────────────────────────────────────────────────
// Partial update: only provided fields are changed.
router.put("/:id", (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, dueDate, priority } = req.body;

    const tasks = readTasks();
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx === -1) return res.status(404).json({ error: "Task not found" });

    if (title !== undefined && !title.trim()) {
      return res.status(400).json({ error: "Title cannot be empty" });
    }

    if (priority !== undefined && !VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({
        error: `priority must be one of: ${VALID_PRIORITIES.join(", ")}`,
      });
    }

    tasks[idx] = {
      ...tasks[idx],
      ...(title !== undefined      && { title: title.trim() }),
      ...(description !== undefined && { description: description.trim() }),
      ...(dueDate !== undefined     && { dueDate }),
      ...(priority !== undefined    && { priority }),
      updatedAt: new Date().toISOString(),
    };

    writeTasks(tasks);
    res.json(tasks[idx]);
  } catch (err) {
    console.error("PUT /tasks/:id error:", err);
    res.status(500).json({ error: "Failed to update task" });
  }
});

// ── PATCH /api/tasks/:id/toggle ───────────────────────────────────────────────
// Flips the completed boolean. No request body needed.
// Using PATCH (not PUT) because we're applying a partial, semantic change.
router.patch("/:id/toggle", (req, res) => {
  try {
    const { id } = req.params;
    const tasks = readTasks();
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx === -1) return res.status(404).json({ error: "Task not found" });

    tasks[idx].completed = !tasks[idx].completed;
    tasks[idx].updatedAt = new Date().toISOString();
    writeTasks(tasks);

    res.json(tasks[idx]);
  } catch (err) {
    console.error("PATCH /tasks/:id/toggle error:", err);
    res.status(500).json({ error: "Failed to toggle task" });
  }
});

// ── DELETE /api/tasks/:id ─────────────────────────────────────────────────────
router.delete("/:id", (req, res) => {
  try {
    const { id } = req.params;
    const tasks = readTasks();
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx === -1) return res.status(404).json({ error: "Task not found" });

    tasks.splice(idx, 1);
    writeTasks(tasks);

    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error("DELETE /tasks/:id error:", err);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

module.exports = router;
