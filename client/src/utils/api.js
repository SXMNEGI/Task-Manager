// client/src/utils/api.js
// All API calls to the backend live here.
// This way, if the base URL changes we only update it in ONE place.

const BASE_URL = process.env.REACT_APP_API_URL || "/api";

// Fetch all tasks. Optionally pass a search string.
export async function fetchTasks(search = "") {
  const url = search
    ? `${BASE_URL}/tasks?search=${encodeURIComponent(search)}`
    : `${BASE_URL}/tasks`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch tasks");
  return res.json();
}

// Create a new task
export async function createTask(taskData) {
  const res = await fetch(`${BASE_URL}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(taskData),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to create task");
  }
  return res.json();
}

// Update a task's title, description, or dueDate
export async function updateTask(id, updates) {
  const res = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to update task");
  }
  return res.json();
}

// Toggle a task's completed status
export async function toggleTask(id) {
  const res = await fetch(`${BASE_URL}/tasks/${id}/toggle`, {
    method: "PATCH",
  });
  if (!res.ok) throw new Error("Failed to toggle task");
  return res.json();
}

// Delete a task
export async function deleteTask(id) {
  const res = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete task");
  return res.json();
}
