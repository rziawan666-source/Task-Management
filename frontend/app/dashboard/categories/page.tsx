"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { api, type Category } from "../../../lib/api";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await api.categories();
      setCategories(data);
    } catch {
      setError("Could not load categories.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setSaving(true);
    setError(null);
    try {
      await api.createCategory(trimmed);
      setName("");
      await load();
    } catch {
      setError("Could not create category. It may already exist.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <header className="border-b border-slate-800 bg-slate-950/70 px-6 py-4 backdrop-blur">
        <h1 className="text-2xl font-bold tracking-tight text-slate-50">
          Categories
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Group tasks with labels that make sense for you.
        </p>
      </header>

      <main className="flex flex-1 flex-col gap-6 bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900 px-6 py-6">
        {error ? (
          <p className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
            {error}
          </p>
        ) : null}

        <form
          onSubmit={(e) => void onSubmit(e)}
          className="flex max-w-xl flex-col gap-3 rounded-xl border border-slate-800 bg-slate-950/80 p-5 sm:flex-row sm:items-end"
        >
          <label className="min-w-0 flex-1 text-xs font-medium text-slate-400">
            New category name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Work, Home, Deep work"
              className="mt-1 w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none ring-emerald-400/40 focus:border-emerald-400/60 focus:ring-2"
            />
          </label>
          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="shrink-0 rounded-md bg-emerald-400 px-4 py-2 text-xs font-medium text-slate-950 hover:bg-emerald-300 disabled:opacity-50"
          >
            {saving ? "Adding…" : "Add category"}
          </button>
        </form>

        <section className="max-w-xl rounded-xl border border-slate-800 bg-slate-950/60 p-5">
          <h2 className="text-sm font-medium text-slate-200">Your categories</h2>
          <ul className="mt-3 divide-y divide-slate-800/80">
            {categories.length === 0 ? (
              <li className="py-6 text-center text-sm text-slate-500">
                No categories yet. Add one above.
              </li>
            ) : (
              categories.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between py-3 text-sm text-slate-200"
                >
                  <span>{c.name}</span>
                  <span className="text-[11px] text-slate-600">#{c.id}</span>
                </li>
              ))
            )}
          </ul>
        </section>
      </main>
    </>
  );
}
