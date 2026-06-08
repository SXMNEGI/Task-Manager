// client/src/components/FilterBar.js

import React from "react";

const FILTERS = ["all", "active", "completed"];

function FilterBar({ filter, setFilter }) {
  return (
    <div className="filter-bar">
      {FILTERS.map((f) => (
        <button
          key={f}
          className={`filter-btn ${filter === f ? "active" : ""}`}
          onClick={() => setFilter(f)}
        >
          {f.charAt(0).toUpperCase() + f.slice(1)}
        </button>
      ))}
    </div>
  );
}

export default FilterBar;
