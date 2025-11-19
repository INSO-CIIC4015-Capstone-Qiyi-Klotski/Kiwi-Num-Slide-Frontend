// src/app/levels/[id]/LevelGameClient.jsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import SlidingPuzzle from "../../../components/Puzzle/SlidingPuzzle";
import { PuzzlesService } from "@/services/puzzles.service";

export default function LevelGameClient({ puzzleId, initialUiPuzzle, meta }) {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isSolved, setIsSolved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null);

  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  // Arranca timer cuando el puzzle está listo (una sola vez)
  useEffect(() => {
    if (!initialUiPuzzle) return;
    if (timerRef.current) return; // ya corriendo

    startTimeRef.current = performance.now();
    timerRef.current = setInterval(() => {
      if (startTimeRef.current == null) return;
      const diff = performance.now() - startTimeRef.current;
      setElapsedMs(diff);
    }, 200);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      timerRef.current = null;
    };
  }, [initialUiPuzzle]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleSolved = useCallback(
    async (finalState) => {
      if (isSolved) return;

      setIsSolved(true);
      stopTimer();

      const durationMs = Math.round(elapsedMs);
      setIsSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(null);

      try {
        // limpiamos nulls de la solución
        const cleanNumbers = Array.isArray(finalState.numbers)
          ? finalState.numbers.filter((n) => n != null)
          : [];

        const movementsCount =
          typeof finalState.movementsCount === "number"
            ? finalState.movementsCount
            : 0;

        // 👇 importante: solution como objeto { solution: [...] }
        const res = await PuzzlesService.submitSolve(puzzleId, {
          movements: movementsCount,
          duration_ms: durationMs,
          solution: { solution: cleanNumbers },
        });

        // Si tu wrapper devuelve { ok, error }, manejamos el error como string
        if (res && res.ok === false) {
          const err = res.error;
          let msg = "Failed to submit solve.";

          if (typeof err === "string") {
            msg = err;
          } else if (err && typeof err === "object") {
            if (Array.isArray(err)) {
              msg = err.map((e) => e.msg || String(e)).join("; ");
            } else if (err.msg) {
              msg = err.msg;
            } else if (err.detail) {
              if (Array.isArray(err.detail)) {
                msg = err.detail
                  .map((e) => e.msg || String(e))
                  .join("; ");
              } else {
                msg = String(err.detail);
              }
            }
          }

          setSubmitError(msg);
          setIsSubmitting(false);
          return;
        }

        setSubmitSuccess("Solve submitted successfully! 🎉");
      } catch (e) {
        console.error(e);
        setSubmitError("Failed to submit solve.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [elapsedMs, isSolved, puzzleId, stopTimer]
  );

  const seconds = Math.floor(elapsedMs / 1000);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Info del nivel + timer */}
      <section
        aria-label="Level info"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontSize: 14, color: "#4b5563" }}>
            {meta.author ? `By ${meta.author}` : "Anonymous author"}
          </span>
          <span style={{ fontSize: 13, color: "#6b7280" }}>
            Size {meta.size}
            {meta.difficulty != null
              ? ` • Difficulty ${meta.difficulty}`
              : ""}
          </span>
        </div>

        <div
          style={{
            padding: "6px 12px",
            borderRadius: 999,
            border: "1px solid #e5e7eb",
            background: "#f9fafb",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          ⏱ {seconds}s
        </div>
      </section>

      {/* Puzzle jugable */}
      <SlidingPuzzle
        mode="level"
        initialUiPuzzle={initialUiPuzzle}
        puzzleId={puzzleId}
        onSolved={handleSolved}
      />

      {/* Mensajes de estado */}
      {isSubmitting && (
        <p style={{ fontSize: 14, color: "#4b5563" }}>Submitting solve…</p>
      )}
      {submitError && (
        <p style={{ fontSize: 14, color: "#b91c1c" }}>{submitError}</p>
      )}
      {submitSuccess && (
        <p style={{ fontSize: 14, color: "#15803d" }}>{submitSuccess}</p>
      )}
    </div>
  );
}
