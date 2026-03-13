"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../auth-context";

export default function DashboardPage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading || (!user && typeof window !== "undefined")) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          Loading your tasks...
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r border-slate-800 bg-slate-950/80 px-4 py-5">
        <div className="mb-6 flex items-center gap-2 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400/10 ring-1 ring-emerald-400/60">
            <span className="text-sm font-semibold text-emerald-300">TF</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-wide">
              Taskflow
            </span>
            <span className="text-[11px] text-slate-500">
              Your personal task hub
            </span>
          </div>
        </div>

        <nav className="space-y-1 text-sm">
          <button className="flex w-full items-center justify-between rounded-lg bg-slate-800/80 px-3 py-2 text-left font-medium text-slate-50">
            <span>Today</span>
            <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] text-slate-300">
              Focus
            </span>
          </button>
          <button className="flex w-full items-center rounded-lg px-3 py-2 text-left text-slate-300 hover:bg-slate-900/80">
            This week
          </button>
          <button className="flex w-full items-center rounded-lg px-3 py-2 text-left text-slate-300 hover:bg-slate-900/80">
            Upcoming
          </button>
          <button className="flex w-full items-center rounded-lg px-3 py-2 text-left text-slate-300 hover:bg-slate-900/80">
            Someday
          </button>
        </nav>

        <div className="mt-auto space-y-3 border-t border-slate-800 pt-4 text-xs text-slate-400">
          <p className="px-2">
            Signed in as{" "}
            <span className="font-medium text-slate-100">{user.name}</span>
          </p>
          <button
            onClick={logout}
            className="flex w-full items-center justify-center rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-slate-100 ring-1 ring-slate-700 hover:bg-slate-800"
          >
            Log out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex flex-1 flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-between border-b border-slate-800 bg-slate-950/70 px-6 py-4 backdrop-blur">
          <div className="flex flex-col">
           <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
  👋 Good day, {user.name.split(" ")[0] || "there"}
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

        {/* Content */}
        <section className="flex flex-1 flex-col gap-6 bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900 px-6 py-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-xs font-medium text-slate-300">
                Today&apos;s focus
              </p>
              <p className="mt-2 text-sm text-slate-400">
                Capture 3 tasks that will make today feel successful.
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-xs font-medium text-slate-300">
                Inbox
              </p>
              <p className="mt-2 text-sm text-slate-400">
                Drop quick thoughts here before organizing them later.
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-xs font-medium text-slate-300">
                Routines
              </p>
              <p className="mt-2 text-sm text-slate-400">
                Create simple daily or weekly checklists to stay on track.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-slate-100">
                  Getting started with Taskflow
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  This is your personal command center. Soon you&apos;ll add real
                  tasks, sections, and reminders here.
                </p>
              </div>
              <button className="hidden rounded-md bg-emerald-400 px-3 py-1.5 text-xs font-medium text-slate-950 shadow-md shadow-emerald-400/40 hover:bg-emerald-300 md:inline-flex">
                Add a task
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

