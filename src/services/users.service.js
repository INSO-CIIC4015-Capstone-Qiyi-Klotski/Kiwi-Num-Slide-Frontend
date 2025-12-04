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

    // user.service.js

getPuzzleLikedByUser(userId, { limit = 20, cursor } = {}) {
  const params = new URLSearchParams();

  // siempre envía limit (por defecto 20)
  if (limit != null) {
    params.append("limit", String(limit));
  }

  // opcional: cursor para paginación
  if (cursor) {
    params.append("cursor", cursor);
  }

  const queryString = params.toString();
  const url = `/users/${encodeURIComponent(userId)}/puzzles/likes${
    queryString ? `?${queryString}` : ""
  }`;

  return apiFetch(url, {
    method: "GET",
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


    // GET /users/avatar-catalog -> { items: [{ key, url }] }
  getAvatarCatalog() {
    return apiFetch("/users/avatar-catalog", {
      method: "GET",
      csrf: false,
    });
  },


};
