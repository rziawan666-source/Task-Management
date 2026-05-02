"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { api, type Category } from "../../../lib/api";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [editName, setEditName] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

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

  const openEdit = (category: Category) => {
    setError(null);
    setEditCategory(category);
    setEditName(category.name);
    setEditOpen(true);
  };

  const submitEdit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editCategory) return;
    const trimmed = editName.trim();
    if (!trimmed) return;
    setEditSaving(true);
    setError(null);
    try {
      await api.updateCategory(editCategory.id, trimmed);
      setEditOpen(false);
      setEditCategory(null);
      await load();
    } catch {
      setError("Could not update category. It may already exist.");
    } finally {
      setEditSaving(false);
    }
  };

  const deleteCategory = async (category: Category) => {
    const ok = window.confirm(
      `Delete "${category.name}"? Tasks in this category will keep their tasks but may lose the label.`
    );
    if (!ok) return;
    setDeletingId(category.id);
    setError(null);
    try {
      await api.deleteCategory(category.id);
      await load();
    } catch {
      setError("Could not delete category.");
    } finally {
      setDeletingId(null);
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
                  className="flex flex-col gap-2 py-3 text-sm text-slate-200 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="truncate">{c.name}</span>
                    <span className="text-[11px] text-slate-600">#{c.id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(c)}
                      className="rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-sky-500/40 hover:text-sky-200"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={deletingId === c.id}
                      onClick={() => void deleteCategory(c)}
                      className="rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-rose-500/50 hover:text-rose-200 disabled:opacity-50"
                    >
                      {deletingId === c.id ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
        </section>
      </main>

      {editOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-category-title"
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
              id="edit-category-title"
              className="text-sm font-semibold text-slate-100"
            >
              Edit category
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Choose a short, memorable label.
            </p>
            <label className="mt-4 block text-xs font-medium text-slate-400">
              Name
              <input
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none ring-emerald-400/40 focus:border-emerald-400/60 focus:ring-2"
                placeholder="e.g. Work"
                autoFocus
              />
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
                disabled={editSaving || !editName.trim()}
                className="rounded-md bg-emerald-400 px-3 py-2 text-xs font-medium text-slate-950 hover:bg-emerald-300 disabled:opacity-50"
              >
                {editSaving ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}
