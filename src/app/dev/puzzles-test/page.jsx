"use client";

import { useState } from "react";
import { PuzzlesService } from "@/services/puzzles.service";

// ---------- Utilidad para mostrar JSON ----------
function JSONView({ data }) {
  return (
    <pre
      style={{
        background: "#0b1220",
        color: "#c9e4ff",
        padding: 12,
        borderRadius: 8,
        overflowX: "auto",
        fontSize: 12,
      }}
    >
      {data ? JSON.stringify(data, null, 2) : "Sin resultados aún..."}
    </pre>
  );
}

// ---------- Helper para parsear JSON ----------
function safeJSON(str, fallback = null) {
  try {
    if (!str || !str.trim()) return fallback;
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

export default function PuzzlesTestPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  async function run(action, fn) {
    try {
      setLoading(true);
      const res = await fn();
      setResult({ action, ...res });
    } catch (e) {
      setResult({ action, ok: false, error: String(e) });
    } finally {
      setLoading(false);
    }
  }

  // Campos generales
  const [title, setTitle] = useState("Sample Puzzle");
  const [size, setSize] = useState(4);
  const [difficulty, setDifficulty] = useState("easy");
  const [numSolutions, setNumSolutions] = useState(1);
  const [boardSpecStr, setBoardSpecStr] = useState(
    JSON.stringify(
      {
        rows: 4,
        cols: 4,
        blocks: [{ id: "A", r: 1, c: 1, w: 2, h: 1 }],
        goal: { r: 2, c: 2 },
      },
      null,
      2
    )
  );

  // IDs / filtros
  const [puzzleId, setPuzzleId] = useState(1);
  const [browseQ, setBrowseQ] = useState("");
  const [browseSize, setBrowseSize] = useState("");
  const [browseSort, setBrowseSort] = useState("created_at_desc");
  const [browseLimit, setBrowseLimit] = useState(20);
  const [browseCursor, setBrowseCursor] = useState("");

  // Solves
  const [solveMovements, setSolveMovements] = useState("U,R,D,L");
  const [solveDuration, setSolveDuration] = useState(1200);
  const [solveSolutionStr, setSolveSolutionStr] = useState(
    JSON.stringify({ path: "URDL" }, null, 2)
  );

  // Daily y generación
  const [dailyDate, setDailyDate] = useState("2025-01-01");
  const [genSecret, setGenSecret] = useState("");
  const [cfgStr, setCfgStr] = useState(
    JSON.stringify(
      {
        count: 2,
        max_attempts: 50,
        sizes: [3, 4],
        difficulties: ["easy", "medium"],
      },
      null,
      2
    )
  );

  return (
    <div style={{ maxWidth: 980, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 26, fontWeight: 700 }}>🧩 Puzzles Test</h1>

      {/* ---------- Crear puzzle ---------- */}
      <section style={card}>
        <h2 style={h2}>POST /puzzles (Crear Puzzle)</h2>
        <label>Título (title)</label>
        <input style={input} value={title} onChange={e => setTitle(e.target.value)} />

        <label>Tamaño (size)</label>
        <input style={input} type="number" value={size} onChange={e => setSize(Number(e.target.value || 0))} />

        <label>Dificultad (difficulty)</label>
        <input style={input} value={difficulty} onChange={e => setDifficulty(e.target.value)} />

        <label>Número de soluciones (num_solutions)</label>
        <input
          style={input}
          type="number"
          value={numSolutions}
          onChange={e => setNumSolutions(Number(e.target.value || 0))}
        />

        <label>Board Spec (JSON)</label>
        <textarea style={textarea} rows={5} value={boardSpecStr} onChange={e => setBoardSpecStr(e.target.value)} />

        <button
          style={btn}
          disabled={loading}
          onClick={() =>
            run("create", () =>
              PuzzlesService.create({
                title,
                size,
                difficulty,
                num_solutions: numSolutions,
                board_spec: safeJSON(boardSpecStr),
              })
            )
          }
        >
          Crear Puzzle
        </button>
      </section>

      {/* ---------- Obtener Puzzle ---------- */}
      <section style={card}>
        <h2 style={h2}>GET /puzzles/:id (Obtener Puzzle)</h2>
        <label>Puzzle ID</label>
        <input style={input} type="number" value={puzzleId} onChange={e => setPuzzleId(Number(e.target.value))} />
        <button style={btn} disabled={loading} onClick={() => run("get", () => PuzzlesService.get(puzzleId))}>
          Obtener Puzzle
        </button>
      </section>

      {/* ---------- Actualizar Puzzle ---------- */}
      <section style={card}>
        <h2 style={h2}>PATCH /puzzles/:id (Actualizar)</h2>
        <label>ID del Puzzle (puzzle_id)</label>
        <input style={input} type="number" value={puzzleId} onChange={e => setPuzzleId(Number(e.target.value))} />

        <label>Título (title)</label>
        <input style={input} value={title} onChange={e => setTitle(e.target.value)} />

        <label>Tamaño (size)</label>
        <input style={input} type="number" value={size} onChange={e => setSize(Number(e.target.value))} />

        <label>Board Spec (JSON)</label>
        <textarea style={textarea} rows={5} value={boardSpecStr} onChange={e => setBoardSpecStr(e.target.value)} />

        <label>Dificultad (difficulty)</label>
        <input style={input} value={difficulty} onChange={e => setDifficulty(e.target.value)} />

        <label>Número de soluciones (num_solutions)</label>
        <input
          style={input}
          type="number"
          value={numSolutions}
          onChange={e => setNumSolutions(Number(e.target.value))}
        />

        <button
          style={btn}
          disabled={loading}
          onClick={() =>
            run("update", () =>
              PuzzlesService.update(puzzleId, {
                title,
                size,
                board_spec: safeJSON(boardSpecStr),
                difficulty,
                num_solutions: numSolutions,
              })
            )
          }
        >
          Actualizar Puzzle
        </button>
      </section>

      {/* ---------- Eliminar ---------- */}
      <section style={card}>
        <h2 style={h2}>DELETE /puzzles/:id (Eliminar)</h2>
        <label>Puzzle ID</label>
        <input style={input} type="number" value={puzzleId} onChange={e => setPuzzleId(Number(e.target.value))} />
        <button style={btnDanger} disabled={loading} onClick={() => run("delete", () => PuzzlesService.remove(puzzleId))}>
          Eliminar Puzzle
        </button>
      </section>

      {/* ---------- Likes ---------- */}
      <section style={card}>
        <h2 style={h2}>POST /puzzles/:id/like (Like) / DELETE (Unlike)</h2>
        <label>Puzzle ID</label>
        <input style={input} type="number" value={puzzleId} onChange={e => setPuzzleId(Number(e.target.value))} />
        <div style={row}>
          <button style={btn} disabled={loading} onClick={() => run("like", () => PuzzlesService.like(puzzleId))}>
            Like
          </button>
          <button style={btn} disabled={loading} onClick={() => run("unlike", () => PuzzlesService.unlike(puzzleId))}>
            Unlike
          </button>
        </div>
      </section>

      {/* ---------- Solve ---------- */}
      <section style={card}>
        <h2 style={h2}>POST /puzzles/:id/solves (Enviar Solve)</h2>
        <label>Puzzle ID</label>
        <input style={input} type="number" value={puzzleId} onChange={e => setPuzzleId(Number(e.target.value))} />

        <label>Movimientos (movements)</label>
        <input style={input} value={solveMovements} onChange={e => setSolveMovements(e.target.value)} />

        <label>Duración (duration_ms)</label>
        <input style={input} type="number" value={solveDuration} onChange={e => setSolveDuration(Number(e.target.value))} />

        <label>Solución (solution JSON)</label>
        <textarea style={textarea} rows={4} value={solveSolutionStr} onChange={e => setSolveSolutionStr(e.target.value)} />

        <button
          style={btn}
          disabled={loading}
          onClick={() =>
            run("submitSolve", () =>
              PuzzlesService.submitSolve(puzzleId, {
                movements: solveMovements.split(",").map(s => s.trim()),
                duration_ms: solveDuration,
                solution: safeJSON(solveSolutionStr),
              })
            )
          }
        >
          Enviar Solve
        </button>
      </section>

      {/* ---------- Resultado ---------- */}
      <section style={card}>
        <h2 style={h2}>Resultado</h2>
        {loading ? <p>Cargando…</p> : <JSONView data={result} />}
      </section>
    </div>
  );
}

/* Estilos */
const card = { border: "1px solid #e5e7eb", borderRadius: 10, padding: 16, marginBottom: 16, background: "#fff" };
const h2 = { fontSize: 18, fontWeight: 700, marginBottom: 12 };
const row = { display: "flex", gap: 8, flexWrap: "wrap" };
const input = { padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: 8, minWidth: 180, display: "block", marginBottom: 6 };
const textarea = { ...input, width: "100%", minHeight: 80 };
const btn = { padding: "10px 14px", borderRadius: 8, border: "1px solid #111827", background: "#111827", color: "#fff", cursor: "pointer" };
const btnDanger = { ...btn, background: "#7f1d1d", border: "1px solid #7f1d1d" };
