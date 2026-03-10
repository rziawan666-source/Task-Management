"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { AuthLayout } from "../auth-layout";
import { ApiError } from "../../lib/api";
import { useAuth } from "../auth-context";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await login(email, password);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to Taskflow to pick up where you left off."
      footer={
        <p>
          New to Taskflow?{" "}
          <Link
            href="/register"
            className="font-medium text-emerald-300 hover:text-emerald-200"
          >
            Create an account
          </Link>
          .
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="text-xs font-medium text-slate-200"
          >
            Work email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-9 w-full rounded-md border border-slate-700 bg-slate-900/70 px-3 text-sm text-slate-50 outline-none ring-emerald-400/60 focus:border-emerald-400/60 focus:ring-2"
            placeholder="you@company.com"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label
              htmlFor="password"
              className="font-medium text-slate-200"
            >
              Password
            </label>
            <button
              type="button"
              className="text-[11px] text-slate-400 hover:text-slate-200"
            >
              Forgot password?
            </button>
          </div>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-9 w-full rounded-md border border-slate-700 bg-slate-900/70 px-3 text-sm text-slate-50 outline-none ring-emerald-400/60 focus:border-emerald-400/60 focus:ring-2"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex h-10 w-full items-center justify-center rounded-md bg-emerald-400 px-3 text-sm font-medium text-slate-950 shadow-md shadow-emerald-400/40 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </AuthLayout>
  );
}

