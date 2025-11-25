// src/services/puzzles.service.js
import { apiFetch } from "../lib/http.js";

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

};
