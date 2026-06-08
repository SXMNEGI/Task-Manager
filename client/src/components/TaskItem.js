// client/src/components/TaskItem.js
// Horizontal row design — title + inline desc on one line,
// due date + priority dot on the right.

import React, { useState } from "react";
import "./TaskItem.css";
import { isOverdue, formatDate } from "../utils/helpers";

const PRIORITIES = ["low", "medium", "high"];
const PRIORITY_LABEL = { high: "High", medium: "Med", low: "Low" };

function TaskItem({ task, onToggle, onEdit, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle]         = useState(task.title);
  const [editDesc, setEditDesc]           = useState(task.description);
  const [editDue, setEditDue]             = useState(task.dueDate || "");
  const [editPriority, setEditPriority]   = useState(task.priority || "medium");
  const [saving, setSaving]               = useState(false);
  const [editError, setEditError]         = useState("");

  const overdue   = isOverdue(task);
  const priority  = task.priority || "medium";

  const handleSave = async () => {
    if (!editTitle.trim()) { setEditError("Title required."); return; }
    try {
      setSaving(true);
      await onEdit(task.id, {
        title: editTitle, description: editDesc,
        dueDate: editDue || null, priority: editPriority,
      });
      setIsEditing(false); setEditError("");
    } catch (err) { setEditError(err.message); }
    finally { setSaving(false); }
  };

  const handleCancel = () => {
    setEditTitle(task.title); setEditDesc(task.description);
    setEditDue(task.dueDate || ""); setEditPriority(task.priority || "medium");
    setEditError(""); setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm(`Delete "${task.title}"?`)) onDelete(task.id);
  };

  // ── EDIT MODE ───────────────────────────────────────────────────
  if (isEditing) {
    return (
      <li className={`task-item editing priority-${priority}`}>
        <div className="edit-form">
          <div className="edit-row-main">
            <input
              className="edit-input"
              type="text"
              value={editTitle}
              autoFocus
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Task title"
            />
          </div>
          <textarea
            className="edit-input"
            value={editDesc}
            rows={2}
            onChange={(e) => setEditDesc(e.target.value)}
            placeholder="Description (optional)"
          />
          <div className="edit-bottom-row">
            <div className="edit-field">
              <label className="field-label">Due</label>
              <input
                className="edit-input date-input"
                type="date"
                value={editDue}
                style={{ width: "auto" }}
                onChange={(e) => setEditDue(e.target.value)}
              />
            </div>
            <div className="edit-field">
              <label className="field-label">Priority</label>
              <div className="priority-btns">
                {PRIORITIES.map((p) => (
                  <button key={p} type="button"
                    className={`priority-btn ${editPriority === p ? "selected" : ""}`}
                    onClick={() => setEditPriority(p)}>
                    {PRIORITY_LABEL[p]}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {editError && <p className="edit-error">{editError}</p>}
          <div className="edit-buttons">
            <button className="btn-save" onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </button>
            <button className="btn-cancel" onClick={handleCancel}>Cancel</button>
          </div>
        </div>
      </li>
    );
  }

  // ── VIEW MODE ───────────────────────────────────────────────────
  return (
    <li className={`task-item priority-${priority} ${task.completed ? "completed" : ""} ${overdue ? "overdue" : ""}`}>
      <button
        className={`checkbox ${task.completed ? "checked" : ""}`}
        onClick={() => onToggle(task.id)}
        title={task.completed ? "Mark incomplete" : "Mark complete"}
      >
        {task.completed && <span className="checkmark">✓</span>}
      </button>

      <div className="task-content">
        <span className="task-title">{task.title}</span>
        {task.description && (
          <span className="task-desc-inline">— {task.description}</span>
        )}
      </div>

      <div className="task-meta-right">
        {task.dueDate && (
          <span className={`due-badge ${overdue ? "overdue-badge" : ""}`}>
            {overdue ? "overdue · " : ""}{formatDate(task.dueDate)}
          </span>
        )}
        <span className={`priority-dot priority-${priority}`} title={`${PRIORITY_LABEL[priority]} priority`} />
      </div>

      <div className="task-actions">
        <button className="action-btn" onClick={() => setIsEditing(true)} title="Edit">✎</button>
        <button className="action-btn" onClick={handleDelete} title="Delete">✕</button>
      </div>
    </li>
  );
}

export default TaskItem;
