// src/lib/http.js
import { API_URL } from "./env.js";

/** Lee una cookie de document.cookie */
function getCookie(name) {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

function isStateChanging(method = "GET") {
  const m = method.toUpperCase();
  return m !== "GET" && m !== "HEAD" && m !== "OPTIONS";
}

/**
 * @param {string} path
 * @param {RequestInit & { timeoutMs?: number, csrf?: boolean }} opts
 */
export async function apiFetch(path, opts = {}) {
  const { timeoutMs = 12000, headers, csrf = true, ...rest } = opts;

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);

  // Headers
  const h = { "Content-Type": "application/json", ...headers };

  // CSRF en mutaciones (doble submit cookie+header)
  if (csrf && isStateChanging(rest.method)) {
    const token = getCookie("csrf_token");
    if (token) h["X-CSRF-Token"] = token;
  }

  // 1ª llamada
  let res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: h,
    signal: controller.signal,
    credentials: "include", // << cookies HttpOnly van y vienen
  });

  // Si expira el access, intentamos refrescar y reintentar 1 vez
  if (res.status === 401) {
    const refreshed = await tryCookieRefresh();
    if (refreshed) {
      res = await fetch(`${API_URL}${path}`, {
        ...rest,
        headers: h,
        signal: controller.signal,
        credentials: "include",
      });
    }
  }

  clearTimeout(t);

  // Parseo tolerante
  let data = null;
  const text = await res.text().catch(() => "");
  try { data = text ? JSON.parse(text) : null; } catch { data = text || null; }

  if (!res.ok) {
    return { ok: false, status: res.status, error: data?.detail || data || "Request failed" };
  }
  return { ok: true, status: res.status, data };
}

/** Intenta refrescar usando la cookie refresh_token (HttpOnly) */
async function tryCookieRefresh() {
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // necesario para que el BE lea la cookie refresh
    });
    return res.ok;
  } catch {
    return false;
  }
}
