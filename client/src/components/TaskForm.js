// client/src/components/TaskForm.js
// Compact form for the sidebar panel

import React, { useState } from "react";

const PRIORITIES = ["low", "medium", "high"];

function TaskForm({ onAdd }) {
  const [title, setTitle]           = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate]       = useState("");
  const [priority, setPriority]     = useState("medium");
  const [expanded, setExpanded]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { setError("Title required."); return; }
    try {
      setLoading(true); setError("");
      await onAdd({ title, description, dueDate, priority });
      setTitle(""); setDescription(""); setDueDate(""); setPriority("medium");
      setExpanded(false);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <input
          className="form-input title-input"
          type="text"
          placeholder="Task title…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
        />
        <button type="button" className="btn-expand"
          onClick={() => setExpanded(p => !p)}>
          {expanded ? "−" : "+"}
        </button>
        <button type="submit" className="btn-add" disabled={loading}>
          {loading ? "…" : "Add"}
        </button>
      </div>

      {expanded && (
        <div className="form-extra">
          <textarea
            className="form-input"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            maxLength={300}
          />
          <div className="form-bottom-row">
            <div className="form-field-row">
              <label className="field-label">Due</label>
              <input className="form-input date-input" type="date"
                value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div className="form-field-row">
              <label className="field-label">Priority</label>
              <div className="priority-btns">
                {PRIORITIES.map((p) => (
                  <button key={p} type="button"
                    className={`priority-btn ${priority === p ? "selected" : ""}`}
                    onClick={() => setPriority(p)}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {error && <p className="form-error">{error}</p>}
    </form>
  );
}

export default TaskForm;
