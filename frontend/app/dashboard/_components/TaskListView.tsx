"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api, type Task } from "../../../lib/api";

function formatDueAt(iso: string | null): string {
  if (!iso) return "No due date";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function compareTasks(a: Task, b: Task): number {
  const at = a.due_at ? new Date(a.due_at).getTime() : Number.POSITIVE_INFINITY;
  const bt = b.due_at ? new Date(b.due_at).getTime() : Number.POSITIVE_INFINITY;
  if (at !== bt) return at - bt;
  return a.title.localeCompare(b.title);
}

export type TaskListViewProps = {
  title: string;
  subtitle: string;
  filter: (task: Task) => boolean;
  emptyStateTitle: string;
  emptyStateHint?: string;
  showSearch?: boolean;
};

export function TaskListView({
  title,
  subtitle,
  filter,
  emptyStateTitle,
  emptyStateHint,
  showSearch = false,
}: TaskListViewProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    setLoadError(null);
    try {
      const t = await api.tasks();
      setTasks(t);
    } catch {
      setLoadError("Could not load tasks. Try refreshing the page.");
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks
      .filter(filter)
      .filter((t) => (q ? t.title.toLowerCase().includes(q) : true))
      .sort(compareTasks);
  }, [tasks, filter, query]);

  const toggleComplete = async (task: Task) => {
    const next = task.status === "completed" ? "pending" : "completed";
    setSavingId(task.id);
    setLoadError(null);
    try {
      await api.updateTask(task.id, { status: next });
      await refresh();
    } catch {
      setLoadError("Could not update the task.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <>
      <header className="border-b border-slate-800 bg-slate-950/70 px-6 py-4 backdrop-blur">
        <h1 className="text-2xl font-bold tracking-tight text-slate-50">
          {title}
        </h1>
        <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
      </header>

      <main className="flex flex-1 flex-col gap-6 bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900 px-6 py-6">
        {loadError ? (
          <p className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
            {loadError}
          </p>
        ) : null}

        {showSearch ? (
          <div className="max-w-xl">
            <label className="block text-xs font-medium text-slate-400">
              Search
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tasks by title..."
                className="mt-1 w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none ring-emerald-400/40 focus:border-emerald-400/60 focus:ring-2"
              />
            </label>
          </div>
        ) : null}

        <section className="rounded-xl border border-slate-800 bg-slate-950/60 p-5">
          <h2 className="text-sm font-medium text-slate-200">Tasks</h2>
          <p className="mt-1 text-xs text-slate-500">
            Toggle items complete or bring them back to pending.
          </p>
          <ul className="mt-4 space-y-2">
            {visible.length === 0 ? (
              <li className="rounded-lg border border-dashed border-slate-800 px-3 py-6 text-center text-sm text-slate-500">
                <p className="font-medium text-slate-300">{emptyStateTitle}</p>
                {emptyStateHint ? (
                  <p className="mt-1 text-xs text-slate-500">{emptyStateHint}</p>
                ) : null}
              </li>
            ) : (
              visible.map((task) => (
                <li
                  key={task.id}
                  className="flex flex-col gap-2 rounded-lg border border-slate-800/80 bg-slate-900/40 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <p
                      className={
                        task.status === "completed"
                          ? "text-sm text-slate-500 line-through"
                          : "text-sm text-slate-100"
                      }
                    >
                      {task.title}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500">
                      <span>{formatDueAt(task.due_at)}</span>
                      {task.category ? (
                        <span className="text-sky-400/80">
                          {task.category.name}
                        </span>
                      ) : null}
                      <span className="uppercase tracking-wide text-slate-600">
                        {task.status}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={savingId === task.id}
                    onClick={() => void toggleComplete(task)}
                    className="shrink-0 rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-emerald-500/50 hover:text-emerald-200 disabled:opacity-50"
                  >
                    {savingId === task.id
                      ? "Saving…"
                      : task.status === "completed"
                        ? "Mark pending"
                        : "Mark complete"}
                  </button>
                </li>
              ))
            )}
          </ul>
        </section>
      </main>
    </>
  );
}

