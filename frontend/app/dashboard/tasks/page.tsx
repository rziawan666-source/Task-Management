"use client";

import { useCallback } from "react";
import { type Task } from "../../../lib/api";
import { TaskListView } from "../_components/TaskListView";

export default function AllTasksPage() {
  const filter = useCallback((_task: Task) => true, []);

  return (
    <TaskListView
      title="All tasks"
      subtitle="Everything in one place, sorted by due date."
      filter={filter}
      emptyStateTitle="No tasks yet."
      emptyStateHint='Create one from the "Today" page.'
      showSearch
    />
  );
}

