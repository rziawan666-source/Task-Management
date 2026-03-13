"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { AuthLayout } from "../auth-layout";
import { ApiError } from "../../lib/api";
import { useAuth } from "../auth-context";

export default function RegisterPage() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await register(name, email, password, passwordConfirmation);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create your Taskflow workspace"
      subtitle="Set up your account and start organizing your work."
      footer={
        <p>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-emerald-300 hover:text-emerald-200"
          >
            Sign in
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
            htmlFor="name"
            className="text-xs font-medium text-slate-200"
          >
            Full name
          </label>
          <input
            id="name"
            type="text"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-9 w-full rounded-md border border-slate-700 bg-slate-900/70 px-3 text-sm text-slate-50 outline-none ring-emerald-400/60 focus:border-emerald-400/60 focus:ring-2"
            placeholder="Alex Rivera"
          />
        </div>

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
          <label
            htmlFor="password"
            className="text-xs font-medium text-slate-200"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-9 w-full rounded-md border border-slate-700 bg-slate-900/70 px-3 text-sm text-slate-50 outline-none ring-emerald-400/60 focus:border-emerald-400/60 focus:ring-2"
            placeholder="At least 8 characters"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="passwordConfirmation"
            className="text-xs font-medium text-slate-200"
          >
            Confirm password
          </label>
          <input
            id="passwordConfirmation"
            type="password"
            required
            autoComplete="new-password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            className="h-9 w-full rounded-md border border-slate-700 bg-slate-900/70 px-3 text-sm text-slate-50 outline-none ring-emerald-400/60 focus:border-emerald-400/60 focus:ring-2"
            placeholder="Repeat your password"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex h-10 w-full items-center justify-center rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-3 text-sm font-semibold text-white shadow-xl transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}
        >
          {isSubmitting ? "Creating workspace..." : "Create account"}
        </button>
      </form>
    </AuthLayout>
  );
}

