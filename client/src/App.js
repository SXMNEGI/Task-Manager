// client/src/App.js
// Full-window horizontal layout.
// Left panel: add form + task list (scrollable)
// Right panel: live dashboard — computed from tasks, no extra API calls

import React, { useState, useEffect } from "react";
import "./App.css";
import { useTasks } from "./hooks/useTasks";
import TaskForm from "./components/TaskForm";
import FilterBar from "./components/FilterBar";
import TaskList from "./components/TaskList";
import Dashboard from "./components/Dashboard";

function App() {
  const {
    tasks, loading, error, search, setSearch,
    addTask, editTask, toggleTask, removeTask,
    activeCount, completedCount,
  } = useTasks();

  const [filter, setFilter] = useState("all");

  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "dark"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const filteredTasks = tasks.filter((t) => {
    if (filter === "active")    return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  return (
    <div className="app">

      {/* ── Top bar ── */}
      <div className="topbar">
        <div className="topbar-left">
          <span className="app-wordmark">Tasks</span>
          <div className="topbar-stats">
            <span className="tstat">
              <span className="tstat-num">{activeCount}</span>
              <span className="tstat-label">open</span>
            </span>
            <span className="topbar-sep">·</span>
            <span className="tstat">
              <span className="tstat-num">{completedCount}</span>
              <span className="tstat-label">done</span>
            </span>
            <span className="topbar-sep">·</span>
            <span className="tstat">
              <span className="tstat-num">{activeCount + completedCount}</span>
              <span className="tstat-label">total</span>
            </span>
          </div>
        </div>

        <div className="topbar-right">
          <div className="search-wrap">
            <span className="search-icon">⌕</span>
            <input
              className="search-input"
              type="text"
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="clear-search" onClick={() => setSearch("")}>✕</button>
            )}
          </div>
          <button
            className="theme-toggle"
            onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}
            title="Toggle theme"
          >
            {theme === "dark" ? "☀" : "◑"}
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="body-split">

        {/* Left — form + list */}
        <div className="left-panel">
          <div className="panel-section">
            <p className="panel-label">New task</p>
            <TaskForm onAdd={addTask} />
          </div>

          <div className="filter-divider" />
          <FilterBar filter={filter} setFilter={setFilter} />

          {error && <div className="error-banner">{error}</div>}

          <TaskList
            tasks={filteredTasks}
            loading={loading}
            onToggle={toggleTask}
            onEdit={editTask}
            onDelete={removeTask}
          />
        </div>

        {/* Right — live dashboard */}
        <div className="right-panel">
          <Dashboard tasks={tasks} />
        </div>

      </div>
    </div>
  );
}

export default App;
