"use client";

import { useCallback } from "react";
import { type Task } from "../../../lib/api";
import { TaskListView } from "../_components/TaskListView";

function startOfTodayMs(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export default function ThisWeekPage() {
  const filter = useCallback((task: Task) => {
    if (task.status !== "pending") return false;
    if (!task.due_at) return false;
    const t = new Date(task.due_at).getTime();
    if (Number.isNaN(t)) return false;
    const start = startOfTodayMs();
    const end = start + 7 * 24 * 60 * 60 * 1000;
    return t >= start && t < end;
  }, []);

  return (
    <TaskListView
      title="This week"
      subtitle="A focused list of what’s due over the next 7 days."
      filter={filter}
      emptyStateTitle="Nothing due this week."
      emptyStateHint="Add a due date to a task and it will show up here."
    />
  );
}

