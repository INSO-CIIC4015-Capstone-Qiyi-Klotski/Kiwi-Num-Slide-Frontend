// src/services/users.service.js
import { apiFetch } from "@/lib/http.js";

/**
 * Mapea 1:1 los endpoints de /users (cookie-based auth + CSRF):
 *
 * GET    /users/ssg-seed?limit=...
 * GET    /users/me
 * PATCH  /users/me                         (body: { name?, avatar_key? })
 * GET    /users/:user_id
 * POST   /users/:user_id/follow
 * DELETE /users/:user_id/follow
 * GET    /users/me/following?limit=&cursor=
 * GET    /users/me/followers?limit=&cursor=
 * GET    /users/me/puzzle-likes?limit=&cursor=
 * GET    /users/me/solves?limit=&cursor=
 */
export const UsersService = {
  /** GET /users/ssg-seed */
  ssgSeed({ limit = 200 } = {}) {
    const qs = new URLSearchParams({ limit: String(limit) }).toString();
    return apiFetch(`/users/ssg-seed?${qs}`, { method: "GET" });
  },

  /** GET /users/me */
  me() {
    return apiFetch(`/users/me`, { method: "GET" });
  },

  /** PATCH /users/me  -> body: { name?, avatar_key? } */
  patchMe({ name, avatar_key } = {}) {
    // Envía solo campos definidos
    const body = {};
    if (typeof name !== "undefined") body.name = name;
    if (typeof avatar_key !== "undefined") body.avatar_key = avatar_key;

    return apiFetch(`/users/me`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  /** GET /users/:user_id */
  getPublic(userId) {
    const id = Number(userId);
    return apiFetch(`/users/${id}`, { method: "GET" });
  },

  /** POST /users/:user_id/follow */
  follow(userId) {
    const id = Number(userId);
    return apiFetch(`/users/${id}/follow`, { method: "POST" });
  },

  /** DELETE /users/:user_id/follow */
  unfollow(userId) {
    const id = Number(userId);
    return apiFetch(`/users/${id}/follow`, { method: "DELETE" });
  },

  /** GET /users/me/following?limit=&cursor= */
  myFollowing({ limit = 20, cursor } = {}) {
    const params = new URLSearchParams({ limit: String(limit) });
    if (cursor) params.set("cursor", cursor);
    return apiFetch(`/users/me/following?${params.toString()}`, {
      method: "GET",
    });
  },

  /** GET /users/me/followers?limit=&cursor= */
  myFollowers({ limit = 20, cursor } = {}) {
    const params = new URLSearchParams({ limit: String(limit) });
    if (cursor) params.set("cursor", cursor);
    return apiFetch(`/users/me/followers?${params.toString()}`, {
      method: "GET",
    });
  },

  /** GET /users/me/puzzle-likes?limit=&cursor= */
  myPuzzleLikes({ limit = 20, cursor } = {}) {
    const params = new URLSearchParams({ limit: String(limit) });
    if (cursor) params.set("cursor", cursor);
    return apiFetch(`/users/me/puzzle-likes?${params.toString()}`, {
      method: "GET",
    });
  },

  /** GET /users/me/solves?limit=&cursor= */
  mySolves({ limit = 20, cursor } = {}) {
    const params = new URLSearchParams({ limit: String(limit) });
    if (cursor) params.set("cursor", cursor);
    return apiFetch(`/users/me/solves?${params.toString()}`, {
      method: "GET",
    });
  },
};
