// client/src/hooks/useTasks.js
// A custom React hook that encapsulates all task-related state and logic.
// By putting all this logic in a hook, our components stay clean and focused on UI.

import { useState, useEffect, useCallback } from "react";
import * as api from "../utils/api";

export function useTasks() {
  const [tasks, setTasks] = useState([]);       // all tasks from server
  const [loading, setLoading] = useState(true); // true while fetching
  const [error, setError] = useState(null);     // holds error message if any
  const [search, setSearch] = useState("");     // search input value

  // loadTasks fetches tasks from the API.
  // useCallback means the function reference won't change on every render,
  // which prevents unnecessary re-runs of the useEffect below.
  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.fetchTasks(search);
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search]);

  // Run loadTasks whenever the search value changes
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Add a new task and refresh the list
  const addTask = async (taskData) => {
    await api.createTask(taskData);
    await loadTasks();
  };

  // Update a task and refresh the list
  const editTask = async (id, updates) => {
    await api.updateTask(id, updates);
    await loadTasks();
  };

  // Toggle completed status and update in the local state immediately
  // (optimistic update = faster feeling UI)
  const toggleTask = async (id) => {
    // Optimistically update the local state first
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
    try {
      await api.toggleTask(id);
      // No need to reload - optimistic update is already correct
    } catch (err) {
      // If it fails, reload to get the real state
      setError(err.message);
      await loadTasks();
    }
  };

  // Delete a task
  const removeTask = async (id) => {
    await api.deleteTask(id);
    // Remove from local state instantly without a full reload
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // Derived counts - calculated from the current tasks array
  const activeCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;

  return {
    tasks,
    loading,
    error,
    search,
    setSearch,
    addTask,
    editTask,
    toggleTask,
    removeTask,
    activeCount,
    completedCount,
  };
}
