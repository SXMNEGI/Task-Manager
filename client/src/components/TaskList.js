// client/src/components/TaskList.js

import React from "react";
import "./TaskList.css";
import TaskItem from "./TaskItem";

function TaskList({ tasks, loading, onToggle, onEdit, onDelete }) {
  if (loading) {
    return (
      <div className="task-list-container">
        <div className="state-box">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="task-list-container">
        <div className="state-box">
          <span className="empty-icon">—</span>
          <span className="empty-title">No tasks</span>
          <span className="empty-sub">Add one above</span>
        </div>
      </div>
    );
  }

  return (
    <div className="task-list-container">
      <ul className="task-list">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </ul>
    </div>
  );
}

export default TaskList;
