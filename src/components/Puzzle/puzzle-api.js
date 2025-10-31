// src/components/Puzzle/puzzle-api.js
import { PuzzlesService } from "@/services/puzzles.service";

// Mapeo visual para el UI
const OP_DISPLAY = { "*": "×", "/": "÷", "+": "+", "-": "-" };

// Si tu apiFetch envuelve como { ok, status, data }, destapa aquí;
// si NO envuelve, esto simplemente devuelve el objeto tal cual.
const unwrap = (res) => (res && typeof res === "object" && "data" in res ? res.data : res);

export function toUIPuzzle(boardSpec) {
  if (!boardSpec) throw new Error("board_spec is missing");
  const { N, numbers, operators, expected } = boardSpec;

  // El backend NO incluye la celda vacía; el UI SÍ la quiere (null)
  const uiNumbers = numbers.slice();
  uiNumbers.push(null);

  const uiOperators = operators.map((op) => OP_DISPLAY[op] ?? op);

  return { N, numbers: uiNumbers, operators: uiOperators, expected };
}

/** Trae el daily del backend, luego el detalle por id y lo transforma al formato UI */
export async function fetchPuzzleDataFromBE() {
  performance.mark('daily_fetch_start');
  const daily = await PuzzlesService.getDailyPuzzle();
  performance.mark('daily_fetch_end');

    if (!daily || daily.ok === false) {
    throw new Error(daily?.error || "Failed to fetch daily puzzle");
  }

  const id = (daily?.data ?? daily)?.puzzle?.id ?? daily?.puzzle?.id;

  if (!id) {
    throw new Error("Daily puzzle ID is missing");
  }

  performance.mark('detail_fetch_start');
  const detail = await PuzzlesService.get(id);
  performance.mark('detail_fetch_end');

    if (!detail || detail.ok === false) {
    throw new Error(detail?.error || "Puzzle not found");
  }

    const boardSpec = (detail?.data ?? detail)?.board_spec;
  if (!boardSpec) {
    throw new Error("Puzzle not found");
  }

  // ---- NUEVA SECCIÓN: medir transformación UI ----
  performance.mark('ui_transform_start');
  const ui = toUIPuzzle((detail?.data ?? detail).board_spec);
  performance.mark('ui_transform_end');

  // ---- Medidas ----
  performance.measure('daily_fetch', 'daily_fetch_start', 'daily_fetch_end');
  performance.measure('detail_fetch', 'detail_fetch_start', 'detail_fetch_end');
  performance.measure('ui_transform', 'ui_transform_start', 'ui_transform_end');

  return ui;
}
