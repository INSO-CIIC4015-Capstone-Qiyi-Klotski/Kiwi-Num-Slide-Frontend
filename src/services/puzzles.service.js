// src/services/puzzles.service.js
import { apiFetch } from "../lib/http.js";

// Workaround: para el GET /puzzles/{id}/solves/me que pide CSRF en el BE
function getCsrfToken() {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/(?:^|; )csrf_token=([^;]*)/);
  return m ? decodeURIComponent(m[1]) : null;
}

/**
 * Tipos esperados (referencia):
 * PuzzleCreate: { title, size, board_spec, difficulty, num_solutions }
 * PuzzleUpdate: { title?, size?, board_spec?, difficulty?, num_solutions? }
 * PuzzleSolveCreate: { movements: string[], duration_ms: number, solution?: any }
 */

export const PuzzlesService = {
  // --- Crear puzzle (auth + CSRF) ---
  create(body) {
    return apiFetch("/puzzles", {
      method: "POST",
      body: JSON.stringify(body),
      // CSRF lo añade http.js automáticamente en mutaciones
    });
  },

  // --- SSG seed público ---
  getSSGSeed(limit = 200) {
    const qs = new URLSearchParams({ limit: String(limit) }).toString();
    return apiFetch(`/puzzles/ssg-seed?${qs}`, { method: "GET" });
  },

  // --- Daily puzzle (hoy) público ---
  getDailyPuzzle() {
    return apiFetch("/puzzles/daily-puzzle", { method: "GET" });
  },

  // --- Daily puzzle por fecha (YYYY-MM-DD) ---
  getDailyPuzzleByDate(dateStr) {
    return apiFetch(`/puzzles/daily-puzzle/${encodeURIComponent(dateStr)}`, {
      method: "GET",
    });
  },

  // --- Detalle de puzzle público ---
  get(puzzleId) {
    return apiFetch(`/puzzles/${encodeURIComponent(puzzleId)}`, {
      method: "GET",
    });
  },

  // --- Actualizar puzzle (PATCH) (auth + CSRF) ---
  update(puzzleId, patch) {
    return apiFetch(`/puzzles/${encodeURIComponent(puzzleId)}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
  },

  // --- Eliminar puzzle (auth + CSRF) ---
  remove(puzzleId) {
    return apiFetch(`/puzzles/${encodeURIComponent(puzzleId)}`, {
      method: "DELETE",
    });
  },

  // --- Like (auth + CSRF) ---
  like(puzzleId) {
    return apiFetch(`/puzzles/${encodeURIComponent(puzzleId)}/like`, {
      method: "POST",
    });
  },

  // --- Unlike (auth + CSRF) ---
  unlike(puzzleId) {
    return apiFetch(`/puzzles/${encodeURIComponent(puzzleId)}/like`, {
      method: "DELETE",
    });
  },

  // --- Conteo de likes (público) ---
  getLikesCount(puzzleId) {
    return apiFetch(`/puzzles/${encodeURIComponent(puzzleId)}/likes/count`, {
      method: "GET",
    });
  },

  // --- Enviar solve (auth + CSRF) ---
 submitSolve(puzzleId, { movements, duration_ms, solution }) {
  const body = {
    movements: Number(movements),
    duration_ms: Number(duration_ms),
    solution: solution ?? null,
  };
  return apiFetch(`/puzzles/${Number(puzzleId)}/solves`, {
    method: "POST",
    body: JSON.stringify(body),
  });
},

  // --- Mis solves para un puzzle (AUTH) ---
  // Workaround de CSRF en GET: añadimos el header manualmente
  getMySolvesForPuzzle(puzzleId, { limit = 20, cursor = null } = {}) {
    const qs = new URLSearchParams();
    if (limit != null) qs.set("limit", String(limit));
    if (cursor) qs.set("cursor", String(cursor));

    const headers = {};
    const csrf = getCsrfToken();
    if (csrf) headers["X-CSRF-Token"] = csrf; // solo porque el BE exige CSRF en este GET

    return apiFetch(
      `/puzzles/${encodeURIComponent(puzzleId)}/solves/me?${qs.toString()}`,
      {
        method: "GET",
        headers,
      }
    );
  },

  // --- Browse público ---
  browse({
    size = null,
    q = null,
    sort = "created_at_desc", // valor interno del BE
    limit = 20,
    cursor = null,
    authorId = null,
    generatedBy = null,      // "algorithm" | "user"
    operators = null,        // array o string "add,sub"
    minLikes = null,
  } = {}) {
    const qs = new URLSearchParams();

    if (size != null) qs.set("size", String(size));
    if (q) qs.set("q", String(q));
    if (sort) qs.set("sort", String(sort));
    if (limit != null) qs.set("limit", String(limit));
    if (cursor) qs.set("cursor", String(cursor));

    if (authorId) qs.set("authorId", String(authorId));
    if (generatedBy) qs.set("generatedBy", String(generatedBy));

    if (Array.isArray(operators) ? operators.length > 0 : operators) {
      const ops = Array.isArray(operators) ? operators.join(",") : String(operators);
      qs.set("operators", ops);
    }

    if (minLikes != null && minLikes !== "") {
      qs.set("minLikes", String(minLikes));
    }

    return apiFetch(`/puzzles?${qs.toString()}`, { method: "GET" });
  },

  // --- Admin: generar puzzles (secret por query o header) ---
  generate(cfg, { secret = null, useHeader = true } = {}) {
    const init = {
      method: "POST",
      body: JSON.stringify(cfg),
      headers: {},
    };
    if (secret) {
      if (useHeader) {
        init.headers["X-Gen-Secret"] = secret;
      } else {
        // por query
        const qs = new URLSearchParams({ secret }).toString();
        return apiFetch(`/puzzles/generate?${qs}`, init);
      }
    }
    return apiFetch(`/puzzles/generate`, init);
  },

  // --- Admin: asegurar daily (secret por query o header) ---
  ensureDaily({ secret = null, useHeader = true } = {}) {
    const init = { method: "POST", headers: {} };
    if (secret) {
      if (useHeader) {
        init.headers["X-Gen-Secret"] = secret;
      } else {
        const qs = new URLSearchParams({ secret }).toString();
        return apiFetch(`/puzzles/daily/ensure?${qs}`, init);
      }
    }
    return apiFetch(`/puzzles/daily/ensure`, init);
  },
};
