// server/data/seed.js
// Pre-populates the app with realistic sample tasks on first run.
// Only runs if tasks.json doesn't exist — never overwrites real data.
//
// The tasks are designed to demonstrate every feature immediately:
// - Different priority levels (low / medium / high)
// - Overdue tasks (so the orange highlight is visible)
// - A completed task (so the Completed filter has something to show)
// - Tasks with and without descriptions and due dates

const { v4: uuidv4 } = require("uuid");
const { writeTasks } = require("./store");
const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "tasks.json");

function seedIfEmpty() {
  if (fs.existsSync(DATA_FILE)) return;

  const now = new Date();

  // Returns a date string N days offset from today (negative = past)
  const dayOffset = (n) => {
    const d = new Date(now);
    d.setDate(d.getDate() + n);
    return d.toISOString().split("T")[0];
  };

  // Returns an ISO timestamp offset by N days (for createdAt ordering)
  const tsOffset = (n) => new Date(now - n * 86400000).toISOString();

  const seedTasks = [
    {
      id: uuidv4(),
      title: "Review pull request for authentication module",
      description: "Check edge cases for token expiry and refresh logic.",
      dueDate: dayOffset(-1),   // yesterday — overdue
      priority: "high",
      completed: false,
      createdAt: tsOffset(5),
      updatedAt: tsOffset(5),
    },
    {
      id: uuidv4(),
      title: "Update project dependencies",
      description: "Run npm audit and resolve any vulnerabilities flagged.",
      dueDate: dayOffset(-3),   // 3 days ago — overdue
      priority: "medium",
      completed: false,
      createdAt: tsOffset(4),
      updatedAt: tsOffset(4),
    },
    {
      id: uuidv4(),
      title: "Write API documentation",
      description: "Document all endpoints with request and response examples.",
      dueDate: dayOffset(4),
      priority: "high",
      completed: false,
      createdAt: tsOffset(3),
      updatedAt: tsOffset(3),
    },
    {
      id: uuidv4(),
      title: "Set up staging environment",
      description: "",
      dueDate: dayOffset(7),
      priority: "medium",
      completed: false,
      createdAt: tsOffset(2),
      updatedAt: tsOffset(2),
    },
    {
      id: uuidv4(),
      title: "Initialise project repository",
      description: "Created monorepo structure with /client and /server folders.",
      dueDate: null,
      priority: "low",
      completed: true,          // completed — shows the filter working
      createdAt: tsOffset(1),
      updatedAt: tsOffset(1),
    },
  ];

  writeTasks(seedTasks);
  console.log("📋 Seeded 5 sample tasks.");
}

module.exports = { seedIfEmpty };
