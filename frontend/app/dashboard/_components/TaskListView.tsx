"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api, type Category, type Task } from "../../../lib/api";

function parseDateTimeToInputs(
  dueAt: string | null
): { dueDate: string; dueTime: string } {
  if (!dueAt) return { dueDate: "", dueTime: "" };
  const d = new Date(dueAt);
  if (Number.isNaN(d.getTime())) return { dueDate: "", dueTime: "" };
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return { dueDate: `${yyyy}-${mm}-${dd}`, dueTime: `${hh}:${mi}` };
}

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
  allowEditDelete?: boolean;
};

export function TaskListView({
  title,
  subtitle,
  filter,
  emptyStateTitle,
  emptyStateHint,
  showSearch = false,
  allowEditDelete = false,
}: TaskListViewProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editDueTime, setEditDueTime] = useState("");
  const [editCategoryId, setEditCategoryId] = useState<string>("");
  const [editSaving, setEditSaving] = useState(false);

  const refresh = useCallback(async () => {
    setLoadError(null);
    try {
      const [t, c] = await Promise.all([
        api.tasks(),
        allowEditDelete ? api.categories() : Promise.resolve([] as Category[]),
      ]);
      setTasks(t);
      setCategories(c);
    } catch {
      setLoadError("Could not load tasks. Try refreshing the page.");
    }
  }, [allowEditDelete]);

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

  const openEdit = (task: Task) => {
    setLoadError(null);
    setEditTask(task);
    setEditTitle(task.title ?? "");
    const { dueDate, dueTime } = parseDateTimeToInputs(task.due_at);
    setEditDueDate(dueDate);
    setEditDueTime(dueTime);
    setEditCategoryId(task.category_id ? String(task.category_id) : "");
    setEditOpen(true);
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTask) return;
    const titleTrimmed = editTitle.trim();
    if (!titleTrimmed) return;

    setEditSaving(true);
    setLoadError(null);
    try {
      await api.updateTask(editTask.id, {
        title: titleTrimmed,
        due_date: editDueDate || null,
        due_time: editDueDate && editDueTime ? editDueTime : null,
        category_id: editCategoryId ? Number(editCategoryId) : null,
      });
      setEditOpen(false);
      setEditTask(null);
      await refresh();
    } catch {
      setLoadError("Could not update the task.");
    } finally {
      setEditSaving(false);
    }
  };

  const deleteTask = async (task: Task) => {
    const ok = window.confirm(`Delete "${task.title}"? This cannot be undone.`);
    if (!ok) return;
    setDeletingId(task.id);
    setLoadError(null);
    try {
      await api.deleteTask(task.id);
      await refresh();
    } catch {
      setLoadError("Could not delete the task.");
    } finally {
      setDeletingId(null);
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
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    {allowEditDelete ? (
                      <>
                        <button
                          type="button"
                          disabled={savingId === task.id || deletingId === task.id}
                          onClick={() => openEdit(task)}
                          className="rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-sky-500/40 hover:text-sky-200 disabled:opacity-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={deletingId === task.id || savingId === task.id}
                          onClick={() => void deleteTask(task)}
                          className="rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-rose-500/50 hover:text-rose-200 disabled:opacity-50"
                        >
                          {deletingId === task.id ? "Deleting…" : "Delete"}
                        </button>
                      </>
                    ) : null}
                    <button
                      type="button"
                      disabled={savingId === task.id || deletingId === task.id}
                      onClick={() => void toggleComplete(task)}
                      className="rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-emerald-500/50 hover:text-emerald-200 disabled:opacity-50"
                    >
                      {savingId === task.id
                        ? "Saving…"
                        : task.status === "completed"
                          ? "Mark pending"
                          : "Mark complete"}
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
        </section>
      </main>

      {allowEditDelete && editOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-task-title"
        >
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label="Close dialog"
            onClick={() => !editSaving && setEditOpen(false)}
          />
          <form
            onSubmit={(e) => void submitEdit(e)}
            className="relative z-10 w-full max-w-md rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-xl shadow-black/40"
          >
            <h2
              id="edit-task-title"
              className="text-sm font-semibold text-slate-100"
            >
              Edit task
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Update the title, due date/time, or category.
            </p>

            <label className="mt-4 block text-xs font-medium text-slate-400">
              Title
              <input
                required
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none ring-emerald-400/40 focus:border-emerald-400/60 focus:ring-2"
                placeholder="e.g. Finish project brief"
                autoFocus
              />
            </label>

            <label className="mt-3 block text-xs font-medium text-slate-400">
              Due date
              <input
                type="date"
                value={editDueDate}
                onChange={(e) => {
                  const v = e.target.value;
                  setEditDueDate(v);
                  if (!v) setEditDueTime("");
                }}
                className="mt-1 w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none ring-emerald-400/40 focus:border-emerald-400/60 focus:ring-2"
              />
            </label>

            <label className="mt-3 block text-xs font-medium text-slate-400">
              Due time
              <input
                type="time"
                value={editDueTime}
                onChange={(e) => setEditDueTime(e.target.value)}
                disabled={!editDueDate}
                className="mt-1 w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none ring-emerald-400/40 focus:border-emerald-400/60 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-40"
              />
              {!editDueDate ? (
                <span className="mt-1 block text-[11px] text-slate-600">
                  Choose a due date to enable a specific time.
                </span>
              ) : (
                <span className="mt-1 block text-[11px] text-slate-600">
                  Leave empty for end of day.
                </span>
              )}
            </label>

            <label className="mt-3 block text-xs font-medium text-slate-400">
              Category
              <select
                value={editCategoryId}
                onChange={(e) => setEditCategoryId(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none ring-emerald-400/40 focus:border-emerald-400/60 focus:ring-2"
              >
                <option value="">None</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={String(cat.id)}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                disabled={editSaving}
                onClick={() => setEditOpen(false)}
                className="rounded-md border border-slate-700 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-900 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={editSaving || !editTitle.trim()}
                className="rounded-md bg-emerald-400 px-3 py-2 text-xs font-medium text-slate-950 hover:bg-emerald-300 disabled:opacity-50"
              >
                {editSaving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}

