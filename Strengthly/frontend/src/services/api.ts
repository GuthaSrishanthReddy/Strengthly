const configuredBase = import.meta.env.VITE_API_BASE_URL as string | undefined;
const BASE = configuredBase
  ? configuredBase.replace(/\/$/, "")
  : "/api";

export async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem("token");
  const isAuthRoute = url.startsWith("/auth/");
  let res: Response;
  try {
    res = await fetch(BASE + url, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(token && !isAuthRoute ? { Authorization: `Bearer ${token}` } : {}),
        ...(options?.headers ?? {}),
      },
      ...options,
    });
  } catch {
    throw new Error(
      "Unable to reach API server. Make sure backend is running and API base URL/proxy is configured."
    );
  }

  if (!res.ok) {
    let message = `API error (${res.status})`;
    try {
      const data = await res.json();
      if (data?.message) message = data.message;
    } catch {
      // Non-JSON error body (e.g., HTML from wrong host/proxy)
    }
    throw new Error(message);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}
