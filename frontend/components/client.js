// client.js
const BASE = import.meta.env.VITE_API_BASE_URL; // t.ex. http://localhost:8000

async function request(path, { method = "GET", headers = {}, body } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });

  console.log("BASE", BASE)

  if (!res.ok) {
    let detail = await res.text().catch(() => "");
    try { detail = JSON.parse(detail).detail ?? detail; } catch {}
    throw new Error(detail || `${res.status} ${res.statusText}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export const api = { request };
