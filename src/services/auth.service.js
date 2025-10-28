// src/services/auth.service.js
import { apiFetch } from "../lib/http.js";

/**
 * Mapea 1:1 los endpoints del BE (vía cookies HttpOnly):
 * POST   /auth/register
 * POST   /auth/verify
 * GET    /auth/verify/confirm?token=...
 * POST   /auth/login            -> BE setea cookies (access/refresh) + csrf
 * POST   /auth/refresh          -> usa cookie refresh, devuelve nuevo access y lo vuelve a setear en cookie
 * POST   /auth/logout           -> borra cookies
 * GET    /auth/me               -> protegido (lee cookie access)
 * GET    /auth/status           -> opcional (si hay cookie access)
 */
export const AuthService = {
  /** body: { name, email, password } -> UserOut */
  register(body) {
    return apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  /** body: { email } -> { ok:true, message?:string } */
  sendVerificationEmail(body) {
    return apiFetch("/auth/verify", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  /** token (string) -> { ok:true, message:"Email verified successfully" } */
  confirmVerification(token) {
    const qs = new URLSearchParams({ token }).toString();
    return apiFetch(`/auth/verify/confirm?${qs}`, { method: "GET" });
  },

  /**
   * body: { email, password } -> { ..., user, ... }
   * El BE setea cookies; NO guardamos nada en localStorage.
   */
  login(body) {
    return apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  /** Refresca usando la cookie refresh (no body) */
  refresh() {
    return apiFetch("/auth/refresh", {
      method: "POST",
      // sin body; el BE lee la cookie refresh_token
    });
  },

  /** GET /auth/me -> UserOut (protegido por cookie) */
  me() {
    return apiFetch("/auth/me", { method: "GET" });
  },

  /** GET /auth/status -> { verified:boolean, user?:User } (auth opcional) */
  status() {
    // ya no marcamos auth:true; el BE usa cookie si existe
    return apiFetch("/auth/status", { method: "GET" });
  },

  /** POST /auth/logout -> borra cookies en el BE */
  logout() {
    return apiFetch("/auth/logout", { method: "POST" });
  },
};
