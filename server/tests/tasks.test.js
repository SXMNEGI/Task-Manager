// server/tests/tasks.test.js
// Basic integration tests for the tasks API.
// Run with: npm test (from the server/ folder)
//
// I kept these focused on behaviour, not implementation.
// Testing "does the route do the right thing" is more valuable
// than testing internal details that might change.

const request = require("supertest");
const fs = require("fs");
const path = require("path");
const app = require("../app"); // extracted Express app (see app.js)

const TEST_DATA_FILE = path.join(__dirname, "../data/tasks.json");

// Before each test, reset the data file to a clean state
beforeEach(() => {
  fs.writeFileSync(TEST_DATA_FILE, JSON.stringify([]), "utf-8");
});

// After all tests, clean up
afterAll(() => {
  if (fs.existsSync(TEST_DATA_FILE)) {
    fs.writeFileSync(TEST_DATA_FILE, JSON.stringify([]), "utf-8");
  }
});

// ─────────────────────────────────────────────
// POST /api/tasks
// ─────────────────────────────────────────────
describe("POST /api/tasks", () => {
  test("creates a task with valid title", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .send({ title: "Write tests", description: "Important", dueDate: "2025-12-01" });

    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe("Write tests");
    expect(res.body.completed).toBe(false);
    expect(res.body.id).toBeDefined(); // should have a uuid
    expect(res.body.priority).toBe("medium"); // default priority
  });

  test("rejects a task with no title", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .send({ description: "No title here" });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test("rejects a task with empty title string", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .send({ title: "   " }); // only whitespace

    expect(res.statusCode).toBe(400);
  });
});

// ─────────────────────────────────────────────
// GET /api/tasks
// ─────────────────────────────────────────────
describe("GET /api/tasks", () => {
  test("returns empty array when no tasks exist", async () => {
    const res = await request(app).get("/api/tasks");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });

  test("returns tasks sorted newest first", async () => {
    // Create two tasks with a small delay between them
    await request(app).post("/api/tasks").send({ title: "First task" });
    await new Promise((r) => setTimeout(r, 10)); // tiny delay
    await request(app).post("/api/tasks").send({ title: "Second task" });

    const res = await request(app).get("/api/tasks");
    expect(res.body[0].title).toBe("Second task"); // newest should be first
    expect(res.body[1].title).toBe("First task");
  });

  test("filters by search query", async () => {
    await request(app).post("/api/tasks").send({ title: "Buy milk" });
    await request(app).post("/api/tasks").send({ title: "Write report" });

    const res = await request(app).get("/api/tasks?search=milk");
    expect(res.body.length).toBe(1);
    expect(res.body[0].title).toBe("Buy milk");
  });
});

// ─────────────────────────────────────────────
// PATCH /api/tasks/:id/toggle
// ─────────────────────────────────────────────
describe("PATCH /api/tasks/:id/toggle", () => {
  test("toggles a task from incomplete to complete", async () => {
    const created = await request(app)
      .post("/api/tasks")
      .send({ title: "Toggle me" });

    const taskId = created.body.id;
    expect(created.body.completed).toBe(false);

    const toggled = await request(app).patch(`/api/tasks/${taskId}/toggle`);
    expect(toggled.body.completed).toBe(true);
  });

  test("toggles back to incomplete on second call", async () => {
    const created = await request(app)
      .post("/api/tasks")
      .send({ title: "Toggle me twice" });

    const taskId = created.body.id;
    await request(app).patch(`/api/tasks/${taskId}/toggle`);
    const toggledBack = await request(app).patch(`/api/tasks/${taskId}/toggle`);
    expect(toggledBack.body.completed).toBe(false);
  });

  test("returns 404 for non-existent task id", async () => {
    const res = await request(app).patch("/api/tasks/fake-id-123/toggle");
    expect(res.statusCode).toBe(404);
  });
});

// ─────────────────────────────────────────────
// DELETE /api/tasks/:id
// ─────────────────────────────────────────────
describe("DELETE /api/tasks/:id", () => {
  test("deletes an existing task", async () => {
    const created = await request(app)
      .post("/api/tasks")
      .send({ title: "Delete me" });

    const taskId = created.body.id;
    const deleted = await request(app).delete(`/api/tasks/${taskId}`);
    expect(deleted.statusCode).toBe(200);
    expect(deleted.body.message).toBeDefined();

    // Verify it's actually gone
    const allTasks = await request(app).get("/api/tasks");
    expect(allTasks.body.length).toBe(0);
  });

  test("returns 404 when deleting a task that doesn't exist", async () => {
    const res = await request(app).delete("/api/tasks/does-not-exist");
    expect(res.statusCode).toBe(404);
  });
});
