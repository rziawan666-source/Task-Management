"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../auth-context";
import {
  api,
  type Category,
  type Task,
  type TaskSummary,
} from "../../lib/api";

function formatDueAt(iso: string | null): string {
  if (!iso) return "No due date";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatDueInWords(iso: string): string {
  const t = new Date(iso).getTime();
  const now = Date.now();
  const ms = t - now;
  const mins = Math.max(0, Math.round(ms / 60000));
  if (mins <= 1) return "in about a minute";
  if (mins < 60) return `in ${mins} minutes`;
  const hours = Math.floor(mins / 60);
  const rest = mins % 60;
  if (rest === 0) return `in ${hours} hour${hours === 1 ? "" : "s"}`;
  return `in ${hours}h ${rest}m`;
}

function isTaskDueSoon(task: Task): boolean {
  if (task.status !== "pending" || !task.due_at) return false;
  const t = new Date(task.due_at).getTime();
  const now = Date.now();
  return t > now && t <= now + 60 * 60 * 1000;
}

function IconCalendar({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
    </svg>
  );
}

function IconCheck({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function IconList({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  );
}

function IconAlert({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  );
}

const statCardStyles = {
  today: "border-emerald-500/25 bg-emerald-500/5",
  completed: "border-sky-500/25 bg-sky-500/5",
  pending: "border-amber-500/25 bg-amber-500/5",
  overdue: "border-rose-500/25 bg-rose-500/5",
} as const;

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<TaskSummary | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formDue, setFormDue] = useState("");
  const [formTime, setFormTime] = useState("");
  const [formCategoryId, setFormCategoryId] = useState<string>("");

  const refresh = useCallback(async () => {
    setLoadError(null);
    try {
      const [s, t, c] = await Promise.all([
        api.taskSummary(),
        api.tasks(),
        api.categories(),
      ]);
      setSummary(s);
      setTasks(t);
      setCategories(c);
    } catch {
      setLoadError("Could not load tasks. Try refreshing the page.");
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const openModal = () => {
    setFormTitle("");
    setFormDue("");
    setFormTime("");
    setFormCategoryId("");
    setModalOpen(true);
  };

  const submitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;
    setSaving(true);
    try {
      await api.createTask({
        title: formTitle.trim(),
        due_date: formDue || null,
        due_time: formDue && formTime ? formTime : null,
        category_id: formCategoryId ? Number(formCategoryId) : null,
      });
      setModalOpen(false);
      await refresh();
    } catch {
      setLoadError("Could not create the task.");
    } finally {
      setSaving(false);
    }
  };

  const toggleComplete = async (task: Task) => {
    const next = task.status === "completed" ? "pending" : "completed";
    try {
      await api.updateTask(task.id, { status: next });
      await refresh();
    } catch {
      setLoadError("Could not update the task.");
    }
  };

  const counts: TaskSummary = summary ?? {
    today: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
    due_soon: [],
  };

  return (
    <>
      <header className="flex items-center justify-between border-b border-slate-800 bg-slate-950/70 px-6 py-4 backdrop-blur">
        <div className="flex flex-col">
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            👋 Good day, {user?.name.split(" ")[0] || "there"}
          </h1>
          <p className="text-xs text-slate-400">
            Here&apos;s a calm view of what matters today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="search"
            placeholder="Quick search..."
            className="h-8 w-44 rounded-md border border-slate-800 bg-slate-900 px-3 text-xs text-slate-100 outline-none ring-emerald-400/50 focus:border-emerald-400/60 focus:ring-2"
          />
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-6 bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900 px-6 py-6">
        {loadError ? (
          <p className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
            {loadError}
          </p>
        ) : null}

        {counts.due_soon.length > 0 ? (
          <section
            className="rounded-xl border border-amber-500/35 bg-amber-500/[0.07] px-4 py-4"
            aria-live="polite"
          >
            <div className="flex gap-3">
              <div className="mt-0.5 shrink-0 rounded-lg bg-amber-500/15 p-2 text-amber-300">
                <IconAlert className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-amber-100">
                  Due soon — within the next hour
                </p>
                <p className="mt-0.5 text-xs text-amber-200/70">
                  These open tasks have a deadline coming up. You asked for a
                  one-hour heads-up; here it is when you open the dashboard.
                </p>
                <ul className="mt-3 space-y-2">
                  {counts.due_soon.map((t) => (
                    <li
                      key={t.id}
                      className="rounded-lg border border-amber-500/20 bg-slate-950/40 px-3 py-2 text-xs text-amber-50/95"
                    >
                      <span className="font-medium text-amber-50">
                        {t.title}
                      </span>
                      <span className="text-amber-200/75">
                        {" "}
                        · {formatDueInWords(t.due_at)} (
                        {formatDueAt(t.due_at)})
                      </span>
                      {t.category ? (
                        <span className="ml-1 text-sky-300/90">
                          · {t.category.name}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div
            className={`rounded-xl border p-4 ${statCardStyles.today}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-medium text-emerald-200/90">
                  Today&apos;s tasks
                </p>
                <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-50">
                  {counts.today}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Due today (any status)
                </p>
              </div>
              <div className="rounded-lg bg-emerald-500/15 p-2 text-emerald-300">
                <IconCalendar />
              </div>
            </div>
          </div>

          <div
            className={`rounded-xl border p-4 ${statCardStyles.completed}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-medium text-sky-200/90">
                  Completed
                </p>
                <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-50">
                  {counts.completed}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Finished tasks (all time)
                </p>
              </div>
              <div className="rounded-lg bg-sky-500/15 p-2 text-sky-300">
                <IconCheck />
              </div>
            </div>
          </div>

          <div
            className={`rounded-xl border p-4 ${statCardStyles.pending}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-medium text-amber-200/90">
                  Pending
                </p>
                <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-50">
                  {counts.pending}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Open, not yet overdue
                </p>
              </div>
              <div className="rounded-lg bg-amber-500/15 p-2 text-amber-300">
                <IconList />
              </div>
            </div>
          </div>

          <div
            className={`rounded-xl border p-4 ${statCardStyles.overdue}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-medium text-rose-200/90">
                  Overdue
                </p>
                <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-50">
                  {counts.overdue}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Past due, still open
                </p>
              </div>
              <div className="rounded-lg bg-rose-500/15 p-2 text-rose-300">
                <IconAlert />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-100">
                Getting started with Taskflow
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Add a due date and optional time. You&apos;ll see an alert when a
                deadline is within one hour.
              </p>
            </div>
            <button
              type="button"
              onClick={openModal}
              className="inline-flex shrink-0 items-center justify-center rounded-md bg-emerald-400 px-4 py-2 text-xs font-medium text-slate-950 shadow-md shadow-emerald-400/40 hover:bg-emerald-300"
            >
              Add a task
            </button>
          </div>
        </div>

        <section className="rounded-xl border border-slate-800 bg-slate-950/60 p-5">
          <h2 className="text-sm font-medium text-slate-200">Your tasks</h2>
          <p className="mt-1 text-xs text-slate-500">
            Mark items done or bring them back to pending.
          </p>
          <ul className="mt-4 space-y-2">
            {tasks.length === 0 ? (
              <li className="rounded-lg border border-dashed border-slate-800 px-3 py-6 text-center text-sm text-slate-500">
                No tasks yet. Use &quot;Add a task&quot; to create one.
              </li>
            ) : (
              tasks.map((task) => (
                <li
                  key={task.id}
                  className={`flex flex-col gap-2 rounded-lg border bg-slate-900/40 px-3 py-3 sm:flex-row sm:items-center sm:justify-between ${
                    isTaskDueSoon(task)
                      ? "border-amber-500/45 ring-1 ring-amber-500/25"
                      : "border-slate-800/80"
                  }`}
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
                      {task.due_at ? (
                        <span
                          className={
                            isTaskDueSoon(task)
                              ? "text-amber-200/90"
                              : undefined
                          }
                        >
                          {isTaskDueSoon(task) ? (
                            <span className="font-semibold text-amber-300">
                              Due soon ({formatDueInWords(task.due_at)}) ·{" "}
                            </span>
                          ) : null}
                          {formatDueAt(task.due_at)}
                        </span>
                      ) : (
                        <span>No due date</span>
                      )}
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
                    onClick={() => void toggleComplete(task)}
                    className="shrink-0 rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-emerald-500/50 hover:text-emerald-200"
                  >
                    {task.status === "completed"
                      ? "Mark pending"
                      : "Mark complete"}
                  </button>
                </li>
              ))
            )}
          </ul>
        </section>
      </main>

      {modalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-task-title"
        >
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label="Close dialog"
            onClick={() => !saving && setModalOpen(false)}
          />
          <form
            onSubmit={(e) => void submitTask(e)}
            className="relative z-10 w-full max-w-md rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-xl shadow-black/40"
          >
            <h2
              id="add-task-title"
              className="text-sm font-semibold text-slate-100"
            >
              New task
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Title is required. Due date, time, and category are optional. If
              you set a date without a time, the task is due at the end of that
              day.
            </p>
            <label className="mt-4 block text-xs font-medium text-slate-400">
              Title
              <input
                required
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none ring-emerald-400/40 focus:border-emerald-400/60 focus:ring-2"
                placeholder="e.g. Finish project brief"
                autoFocus
              />
            </label>
            <label className="mt-3 block text-xs font-medium text-slate-400">
              Due date
              <input
                type="date"
                value={formDue}
                onChange={(e) => {
                  const v = e.target.value;
                  setFormDue(v);
                  if (!v) setFormTime("");
                }}
                className="mt-1 w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none ring-emerald-400/40 focus:border-emerald-400/60 focus:ring-2"
              />
            </label>
            <label className="mt-3 block text-xs font-medium text-slate-400">
              Due time
              <input
                type="time"
                value={formTime}
                onChange={(e) => setFormTime(e.target.value)}
                disabled={!formDue}
                className="mt-1 w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none ring-emerald-400/40 focus:border-emerald-400/60 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-40"
              />
              {!formDue ? (
                <span className="mt-1 block text-[11px] text-slate-600">
                  Choose a due date to enable a specific time.
                </span>
              ) : (
                <span className="mt-1 block text-[11px] text-slate-600">
                  Leave empty for end of day — still counts for &quot;today&quot;
                  and overdue by date.
                </span>
              )}
            </label>
            <label className="mt-3 block text-xs font-medium text-slate-400">
              Category
              <select
                value={formCategoryId}
                onChange={(e) => setFormCategoryId(e.target.value)}
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
                disabled={saving}
                onClick={() => setModalOpen(false)}
                className="rounded-md border border-slate-700 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-900 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-emerald-400 px-3 py-2 text-xs font-medium text-slate-950 hover:bg-emerald-300 disabled:opacity-50"
              >
                {saving ? "Saving…" : "Create task"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}
