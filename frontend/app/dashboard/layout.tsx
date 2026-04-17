"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "../auth-context";

function NavIconToday({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
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
    </svg>
  );
}

function NavIconCategories({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
    </svg>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

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

  const navLink = (href: string, current: boolean) =>
    current
      ? "flex w-full items-center gap-2 rounded-lg bg-slate-800/80 px-3 py-2 text-left text-sm font-medium text-slate-50"
      : "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-900/80";

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <aside className="flex w-64 flex-col border-r border-slate-800 bg-slate-950/80 px-4 py-5">
        <div className="mb-6 flex items-center gap-2 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400/10 ring-1 ring-emerald-400/60">
            <span className="text-sm font-semibold text-emerald-300">TF</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-wide">Taskflow</span>
            <span className="text-[11px] text-slate-500">
              Your personal task hub
            </span>
          </div>
        </div>

        <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Views
        </p>
        <nav className="space-y-1 text-sm">
          <Link
            href="/dashboard"
            className={navLink("/dashboard", pathname === "/dashboard")}
          >
            <NavIconToday className="shrink-0 text-emerald-400/90" />
            <span className="flex-1">Today</span>
            {pathname === "/dashboard" ? (
              <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] text-slate-300">
                Home
              </span>
            ) : null}
          </Link>
          <button
            type="button"
            className="flex w-full cursor-default items-center gap-2 rounded-lg px-3 py-2 text-left text-slate-500"
            disabled
          >
            <span className="w-[18px]" />
            This week
            <span className="ml-auto text-[10px] text-slate-600">Soon</span>
          </button>
          <button
            type="button"
            className="flex w-full cursor-default items-center gap-2 rounded-lg px-3 py-2 text-left text-slate-500"
            disabled
          >
            <span className="w-[18px]" />
            Upcoming
            <span className="ml-auto text-[10px] text-slate-600">Soon</span>
          </button>
          <button
            type="button"
            className="flex w-full cursor-default items-center gap-2 rounded-lg px-3 py-2 text-left text-slate-500"
            disabled
          >
            <span className="w-[18px]" />
            Someday
            <span className="ml-auto text-[10px] text-slate-600">Soon</span>
          </button>
        </nav>

        <p className="mb-2 mt-6 px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Organize
        </p>
        <nav className="space-y-1 text-sm">
          <Link
            href="/dashboard/categories"
            className={navLink(
              "/dashboard/categories",
              pathname === "/dashboard/categories"
            )}
          >
            <NavIconCategories className="shrink-0 text-sky-400/90" />
            <span>Categories</span>
          </Link>
        </nav>

        <div className="mt-auto space-y-3 border-t border-slate-800 pt-4 text-xs text-slate-400">
          <p className="px-2">
            Signed in as{" "}
            <span className="font-medium text-slate-100">{user.name}</span>
          </p>
          <button
            type="button"
            onClick={() => void logout()}
            className="flex w-full items-center justify-center rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-slate-100 ring-1 ring-slate-700 hover:bg-slate-800"
          >
            Log out
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">{children}</div>
    </div>
  );
}
