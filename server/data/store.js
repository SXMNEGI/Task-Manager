// server/data/store.js
// This module handles reading and writing tasks to a JSON file.
// Using a JSON file means tasks persist even if the server restarts.

const fs = require("fs");
const path = require("path");

// Path to our data file
const DATA_FILE = path.join(__dirname, "tasks.json");

// Read all tasks from the JSON file.
// If the file doesn't exist yet, return an empty array.
function readTasks() {
  if (!fs.existsSync(DATA_FILE)) {
    return [];
  }
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(raw);
}

// Write the tasks array back to the JSON file.
// JSON.stringify with 2-space indent makes the file human-readable.
function writeTasks(tasks) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2), "utf-8");
}

module.exports = { readTasks, writeTasks };
