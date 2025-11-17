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
  getPublicProfile(userId) {
    return apiFetch(`/users/${userId}`, {
      method: "GET",
      csrf: false, // es un GET público
    });
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

  browse({
    q = null,
    followersOf = null,  // id | "me"
    followingOf = null,  // id | "me"
    sort = "created_at_desc",
    limit = 20,
    cursor = null,
  } = {}) {
    const qs = new URLSearchParams();

    if (q) qs.set("q", String(q));
    if (followersOf) qs.set("followersOf", String(followersOf));
    if (followingOf) qs.set("followingOf", String(followingOf));
    if (sort) qs.set("sort", String(sort));
    if (limit != null) qs.set("limit", String(limit));
    if (cursor) qs.set("cursor", String(cursor));

    return apiFetch(`/users?${qs.toString()}`, { method: "GET" });
  },


  /** GET /puzzles?authorId=... → lista de puzzles creados por el user */
  getCreatedPuzzles(userId, { limit = 12, sort = "created_at_desc" } = {}) {
    const qs = new URLSearchParams({
      authorId: String(userId),
      limit: String(limit),
      sort,
    }).toString();

    return apiFetch(`/puzzles?${qs}`, {
      method: "GET",
      csrf: false,
    });
  },


};
