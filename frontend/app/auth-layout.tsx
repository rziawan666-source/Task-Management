"use client";

import Link from "next/link";
import { ReactNode } from "react";

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <div className="hidden w-1/2 flex-col justify-between px-16 py-12 lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/10 ring-1 ring-emerald-400/50">
            <span className="text-lg font-semibold text-emerald-300">TF</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-wide text-emerald-200">
              Taskflow
            </span>
            <span className="text-xs text-slate-400">
              Your personal task manager.
            </span>
          </div>
        </div>

        <div className="max-w-lg space-y-6">
          <h1 className="text-4xl font-bold leading-tight tracking-tight 
bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 
bg-clip-text text-transparent 
drop-shadow-lg 
transition-all duration-300 
hover:scale-105 hover:drop-shadow-2xl hover:from-blue-500 hover:to-purple-600">
            Bring clarity to your day.
          </h1>
          <p className="text-sm text-slate-300">
            Taskflow helps you capture everything, prioritize what matters, and
            stay on top of your personal life and work.
          </p>
          <div className="grid gap-3 text-sm text-slate-200 sm:grid-cols-2">
            <div className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
             <p className="font-medium text-red-500">Plan with confidence</p> 
              <p className="mt-1 text-xs text-slate-300">
                Break your day into simple lists and sections that fit how you
                actually think.
              </p>
            </div>
            <div className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
              <p className="font-medium">Track progress at a glance</p>
              <p className="mt-1 text-xs text-slate-300">
                See what&apos;s due today, what can wait, and what you&apos;ve
                already finished.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>© {new Date().getFullYear()} Taskflow. All rights reserved.</span>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-slate-300">
              Privacy
            </Link>
            <Link href="#" className="hover:text-slate-300">
              Terms
            </Link>
          </div>
        </div>
      </div>

      <div className="flex w-full items-center justify-center px-6 py-10 sm:px-10 lg:w-1/2 lg:px-12">
        <div className="w-full max-w-md rounded-2xl bg-slate-950/60 p-8 shadow-2xl ring-1 ring-white/10 backdrop-blur">
          <div className="mb-6 flex flex-col gap-1">
            <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
            <p className="text-xs text-slate-400">{subtitle}</p>
          </div>
          {children}
          {footer && <div className="mt-6 text-xs text-slate-400">{footer}</div>}
        </div>
      </div>
    </div>
  );
}

