// src/lib/http.js
import { API_URL } from "./env.js";

/** Lee una cookie de document.cookie */
function getCookie(name) {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

/**
 * @param {string} path
 * @param {RequestInit & { timeoutMs?: number, csrf?: boolean }} opts
 */
export async function apiFetch(path, opts = {}) {
  const { timeoutMs = 12000, headers, csrf = true, ...rest } = opts;

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);

  // Headers base
  const h = { "Content-Type": "application/json", ...headers };

  // Enviar CSRF si existe cookie
  if (csrf) {
    const token = getCookie("csrf_token");
    if (token) h["X-CSRF-Token"] = token;
  }

  // 1ª llamada
  let res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: h,
    signal: controller.signal,
    credentials: "include",
  });

  // Si expira el access, intentamos refresh y reintentamos 1 vez
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
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text || null;
  }

  if (!res.ok) {
    const defaultError =
      res.status === 401
        ? "Your session has expired. Please sign in again."
        : "Request failed";

    return {
      ok: false,
      status: res.status,
      error: data?.detail || data || defaultError,
    };
  }

  return { ok: true, status: res.status, data };
}

/** Hace logout best-effort llamando al backend para limpiar cookies */
async function forceLogout() {
  try {
    const csrf = getCookie("csrf_token");
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(csrf ? { "X-CSRF-Token": csrf } : {}),
      },
      credentials: "include",
    });
  } catch {
    // ignore
  }
}

/** Intenta refrescar usando la cookie refresh_token (HttpOnly) */
async function tryCookieRefresh() {
  try {
    const csrf = getCookie("csrf_token");
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(csrf ? { "X-CSRF-Token": csrf } : {}),
      },
      credentials: "include",
    });

    if (res.ok) {
      // Refreshed successfully, nuevo access_token seteado en cookie
      return true;
    }

    // Refresh falló (por ejemplo, refresh_token expirado) -> hacemos logout
    await forceLogout();
    return false;
  } catch {
    await forceLogout();
    return false;
  }
}
