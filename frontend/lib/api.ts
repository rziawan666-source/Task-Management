export type ApiError = {
  message: string;
  errors?: Record<string, string[]>;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

async function request<T>(
  path: string,
  options: RequestInit & { skipJson?: boolean } = {}
): Promise<T> {
  const { skipJson, ...rest } = options;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...rest,
  });

  if (!res.ok) {
    let errorBody: any = null;
    try {
      errorBody = skipJson ? null : await res.json();
    } catch {
      // ignore JSON parse errors
    }

    const error: ApiError = {
      message:
        errorBody?.message ||
        "Something went wrong. Please try again.",
      errors: errorBody?.errors,
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

type AuthResponse = {
  user: User;
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
      // no JSON body, but we still want credentials
      skipJson: true,
    }),
};

