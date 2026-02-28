const configuredBase = import.meta.env.VITE_API_BASE_URL as string | undefined;
const BASE = configuredBase
  ? configuredBase.replace(/\/$/, "")
  : "/api";

export async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem("token");
  const res = await fetch(BASE + url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  if (!res.ok) {
    let message = "API error";
    try {
      const data = await res.json();
      if (data?.message) message = data.message;
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}
