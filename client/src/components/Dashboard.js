// client/src/components/Dashboard.js
//
// The right-panel live dashboard. Computed entirely from the tasks array —
// no extra API calls, no state, just derived data visualised in a way
// that actually tells you something useful.
//
// Sections:
//   1. Completion ring  — visual % done
//   2. Priority split   — stacked bar of low/med/high open tasks
//   3. Due-date horizon — mini timeline: overdue / today / this week / later
//   4. Daily activity   — 28-day grid of task creation (like GitHub contributions)
//   5. Quick insights   — one-line smart observations about the task list

import React, { useMemo } from "react";
import "./Dashboard.css";

// ── helpers ──────────────────────────────────────────────────────────────────

function startOfDay(d) {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

function daysBetween(a, b) {
  return Math.round((startOfDay(b) - startOfDay(a)) / 86400000);
}

// ── main component ────────────────────────────────────────────────────────────

function Dashboard({ tasks }) {
  const stats = useMemo(() => {
    const today = startOfDay(new Date());
    const total = tasks.length;
    const done  = tasks.filter(t => t.completed).length;
    const open  = total - done;
    const pct   = total === 0 ? 0 : Math.round((done / total) * 100);

    // priority breakdown (open only)
    const openTasks = tasks.filter(t => !t.completed);
    const byPriority = {
      high:   openTasks.filter(t => t.priority === "high").length,
      medium: openTasks.filter(t => t.priority === "medium" || !t.priority).length,
      low:    openTasks.filter(t => t.priority === "low").length,
    };

    // due-date horizon buckets
    const horizon = { overdue: 0, today: 0, week: 0, later: 0, none: 0 };
    openTasks.forEach(t => {
      if (!t.dueDate) { horizon.none++; return; }
      const diff = daysBetween(today, new Date(t.dueDate));
      if (diff < 0)      horizon.overdue++;
      else if (diff === 0) horizon.today++;
      else if (diff <= 7)  horizon.week++;
      else                 horizon.later++;
    });

    // 28-day creation activity grid
    const activity = Array(28).fill(0);
    tasks.forEach(t => {
      const diff = daysBetween(new Date(t.createdAt), today);
      if (diff >= 0 && diff < 28) {
        activity[27 - diff]++;
      }
    });
    const maxActivity = Math.max(...activity, 1);

    // smart insights
    const insights = [];
    if (horizon.overdue > 0)
      insights.push({ type: "warn", text: `${horizon.overdue} task${horizon.overdue > 1 ? "s are" : " is"} past due` });
    if (horizon.today > 0)
      insights.push({ type: "info", text: `${horizon.today} due today` });
    if (byPriority.high > 2)
      insights.push({ type: "warn", text: `${byPriority.high} high-priority tasks open` });
    if (pct === 100 && total > 0)
      insights.push({ type: "good", text: "All tasks complete" });
    else if (pct >= 75)
      insights.push({ type: "good", text: `${pct}% complete — nearly there` });
    if (open === 0 && total > 0)
      insights.push({ type: "good", text: "Nothing left to do" });
    if (insights.length === 0 && total === 0)
      insights.push({ type: "info", text: "Add your first task to get started" });
    if (insights.length === 0)
      insights.push({ type: "info", text: `${open} task${open !== 1 ? "s" : ""} in progress` });

    return { total, done, open, pct, byPriority, horizon, activity, maxActivity, insights };
  }, [tasks]);

  return (
    <div className="dashboard">

      {/* ── Row 1: ring + priority ── */}
      <div className="dash-row">
        <CompletionRing pct={stats.pct} done={stats.done} total={stats.total} />
        <PriorityBar byPriority={stats.byPriority} open={stats.open} />
      </div>

      {/* ── Row 2: horizon ── */}
      <DueHorizon horizon={stats.horizon} />

      {/* ── Row 3: activity grid ── */}
      <ActivityGrid activity={stats.activity} maxActivity={stats.maxActivity} />

      {/* ── Row 4: insights ── */}
      <Insights insights={stats.insights} />

    </div>
  );
}

// ── Completion ring ───────────────────────────────────────────────────────────

function CompletionRing({ pct, done, total }) {
  const r  = 36;
  const cx = 48;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="dash-card ring-card">
      <span className="dash-card-label">Progress</span>
      <div className="ring-wrap">
        <svg width="96" height="96" viewBox="0 0 96 96">
          {/* track */}
          <circle cx={cx} cy={cx} r={r}
            fill="none" stroke="var(--border-2)" strokeWidth="5" />
          {/* fill */}
          <circle cx={cx} cy={cx} r={r}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${cx} ${cx})`}
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
          <text x={cx} y={cx - 5} textAnchor="middle"
            fontSize="16" fontWeight="600" fill="var(--text)">{pct}%</text>
          <text x={cx} y={cx + 12} textAnchor="middle"
            fontSize="9" fill="var(--text-2)">{done}/{total}</text>
        </svg>
      </div>
    </div>
  );
}

// ── Priority stacked bar ──────────────────────────────────────────────────────

function PriorityBar({ byPriority, open }) {
  const total = open || 1;
  const bars = [
    { key: "high",   label: "High",   count: byPriority.high },
    { key: "medium", label: "Med",    count: byPriority.medium },
    { key: "low",    label: "Low",    count: byPriority.low },
  ];

  return (
    <div className="dash-card priority-card">
      <span className="dash-card-label">Open by priority</span>
      <div className="p-bars">
        {bars.map(b => (
          <div key={b.key} className="p-bar-row">
            <span className="p-bar-label">{b.label}</span>
            <div className="p-bar-track">
              <div
                className={`p-bar-fill p-${b.key}`}
                style={{ width: `${(b.count / total) * 100}%`, transition: "width 0.5s ease" }}
              />
            </div>
            <span className="p-bar-count">{b.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Due horizon ───────────────────────────────────────────────────────────────

function DueHorizon({ horizon }) {
  const buckets = [
    { key: "overdue", label: "Overdue", count: horizon.overdue, cls: "h-overdue" },
    { key: "today",   label: "Today",   count: horizon.today,   cls: "h-today"   },
    { key: "week",    label: "This week", count: horizon.week,  cls: "h-week"    },
    { key: "later",   label: "Later",   count: horizon.later,   cls: "h-later"   },
  ];
  const max = Math.max(...buckets.map(b => b.count), 1);

  return (
    <div className="dash-card horizon-card">
      <span className="dash-card-label">Due date horizon</span>
      <div className="horizon-cols">
        {buckets.map(b => (
          <div key={b.key} className="horizon-col">
            <div className="horizon-bar-wrap">
              <div
                className={`horizon-bar ${b.cls}`}
                style={{ height: `${(b.count / max) * 52}px`, transition: "height 0.5s ease" }}
              />
            </div>
            <span className="horizon-count">{b.count}</span>
            <span className="horizon-label">{b.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 28-day activity grid ──────────────────────────────────────────────────────

function ActivityGrid({ activity, maxActivity }) {
  // 4 rows × 7 cols — last 28 days


  return (
    <div className="dash-card activity-card">
      <span className="dash-card-label">Task activity — last 28 days</span>
      <div className="activity-grid">
        {activity.map((count, i) => {
          const intensity = maxActivity === 0 ? 0 : count / maxActivity;
          // 4 levels
          const level = intensity === 0 ? 0 : intensity < 0.33 ? 1 : intensity < 0.66 ? 2 : 3;
          return (
            <div
              key={i}
              className={`activity-cell level-${level}`}
              title={`${count} task${count !== 1 ? "s" : ""} created`}
            />
          );
        })}
      </div>
      <div className="activity-legend">
        <span className="activity-legend-label">Less</span>
        {[0,1,2,3].map(l => (
          <div key={l} className={`activity-cell level-${l}`} />
        ))}
        <span className="activity-legend-label">More</span>
      </div>
    </div>
  );
}

// ── Insights ──────────────────────────────────────────────────────────────────

function Insights({ insights }) {
  return (
    <div className="dash-card insights-card">
      <span className="dash-card-label">Insights</span>
      <div className="insights-list">
        {insights.map((ins, i) => (
          <div key={i} className={`insight-row ins-${ins.type}`}>
            <span className="insight-dot" />
            <span className="insight-text">{ins.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
