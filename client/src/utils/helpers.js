// client/src/utils/helpers.js
// Small helper functions used across components.

// Checks if a task is overdue:
// - has a due date
// - due date is in the past
// - task is not completed
export function isOverdue(task) {
  if (!task.dueDate || task.completed) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0); // compare by date only, not time
  const due = new Date(task.dueDate);
  return due < today;
}

// Formats a date string into a readable format like "Jun 15, 2025"
export function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Returns today's date in YYYY-MM-DD format (required for <input type="date">)
export function todayString() {
  return new Date().toISOString().split("T")[0];
}
