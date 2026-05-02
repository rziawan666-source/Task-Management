"use client";

import { useCallback } from "react";
import { type Task } from "../../../lib/api";
import { TaskListView } from "../_components/TaskListView";

export default function CompletedPage() {
  const filter = useCallback((task: Task) => task.status === "completed", []);

  return (
    <TaskListView
      title="Completed"
      subtitle="A calm archive of what you’ve finished."
      filter={filter}
      emptyStateTitle="No completed tasks yet."
      emptyStateHint="Mark a task complete and it will appear here."
      showSearch
    />
  );
}

