export type ApiError = {
  message: string;
  errors?: Record<string, string[]>;
};

/**
 * Empty string = same-origin requests via Next.js rewrite to Laravel (recommended).
 * Set NEXT_PUBLIC_API_BASE_URL only if you call the API host directly and accept
 * cross-origin cookie limitations unless both apps share the same site.
 */
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(
  /\/$/,
  ""
);

function apiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  if (!API_BASE_URL) {
    return p;
  }
  return `${API_BASE_URL}${p}`;
}

async function request<T>(
  path: string,
  options: RequestInit & { skipJson?: boolean } = {}
): Promise<T> {
  const { skipJson, ...rest } = options;

  const res = await fetch(apiUrl(path), {
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...rest,
  });

  if (!res.ok) {
    let errorBody: unknown = null;
    try {
      errorBody = skipJson ? null : await res.json();
    } catch {
      // ignore JSON parse errors
    }

    const body =
      errorBody && typeof errorBody === "object"
        ? (errorBody as { message?: string; errors?: Record<string, string[]> })
        : null;

    const error: ApiError = {
      message:
        body?.message || "Something went wrong. Please try again.",
      errors: body?.errors,
    };

    throw error;
  }

  if (skipJson) {
    // @ts-expect-error we know T is void in this case
    return undefined;
  }

  return (await res.json()) as T;
}

export type User = {
  id: number;
  name: string;
  email: string;
};

export type Category = {
  id: number;
  user_id: number;
  name: string;
  created_at: string;
  updated_at: string;
};

export type Task = {
  id: number;
  user_id: number;
  category_id: number | null;
  title: string;
  description: string | null;
  status: "pending" | "completed";
  /** ISO 8601 datetime from the API; null if no deadline */
  due_at: string | null;
  created_at: string;
  updated_at: string;
  category?: { id: number; name: string } | null;
};

export type DueSoonTask = {
  id: number;
  title: string;
  due_at: string;
  category: { id: number; name: string } | null;
};

export type TaskSummary = {
  today: number;
  completed: number;
  pending: number;
  overdue: number;
  due_soon: DueSoonTask[];
};

type AuthResponse = {
  user: User;
};

type CategoriesResponse = {
  data: Category[];
};

type CategoryResponse = {
  data: Category;
};

type TasksResponse = {
  data: Task[];
};

type TaskResponse = {
  data: Task;
};

export const api = {
  me: () => request<AuthResponse>("/api/me").then((r) => r.user),
  login: (data: { email: string; password: string }) =>
    request<AuthResponse>("/api/login", {
      method: "POST",
      body: JSON.stringify(data),
    }).then((r) => r.user),
  register: (data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) =>
    request<AuthResponse>("/api/register", {
      method: "POST",
      body: JSON.stringify(data),
    }).then((r) => r.user),
  logout: () =>
    request<void>("/api/logout", {
      method: "POST",
      skipJson: true,
    }),

  taskSummary: () => request<TaskSummary>("/api/tasks/summary"),
  tasks: () => request<TasksResponse>("/api/tasks").then((r) => r.data),
  createTask: (data: {
    title: string;
    description?: string | null;
    due_date?: string | null;
    /** HH:mm or HH:mm:ss; only used when due_date is set */
    due_time?: string | null;
    category_id?: number | null;
  }) =>
    request<TaskResponse>("/api/tasks", {
      method: "POST",
      body: JSON.stringify(data),
    }).then((r) => r.data),
  updateTask: (
    id: number,
    data: Partial<{
      title: string;
      description: string | null;
      due_date: string | null;
      due_time: string | null;
      category_id: number | null;
      status: "pending" | "completed";
    }>
  ) =>
    request<TaskResponse>(`/api/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }).then((r) => r.data),
  deleteTask: (id: number) =>
    request<void>(`/api/tasks/${id}`, {
      method: "DELETE",
      skipJson: true,
    }),

  categories: () =>
    request<CategoriesResponse>("/api/categories").then((r) => r.data),
  createCategory: (name: string) =>
    request<CategoryResponse>("/api/categories", {
      method: "POST",
      body: JSON.stringify({ name }),
    }).then((r) => r.data),
};
