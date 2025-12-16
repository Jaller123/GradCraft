import { supabase } from "../lib/supabaseClient";

const BASE = import.meta.env.VITE_API_BASE_URL as string;

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  headers?: Record<string, string>;
  body?: unknown;
};

const request = async <T = unknown>(
  path: string,
  { method = "GET", headers = {}, body = undefined }: RequestOptions = {}
): Promise<T | null> => {
  // Attach Supabase access token if present
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let detail: string = await res.text().catch(() => "");
    try {
      const parsed = JSON.parse(detail);
      detail = parsed?.detail ?? detail;
    } catch {}
    throw new Error(detail || `${res.status} ${res.statusText}`);
  }

  const text = await res.text();
  return text ? (JSON.parse(text) as T) : null;
};

export const api = { request };
