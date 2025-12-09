// src/components/levels/create/OperatorsStep.jsx
"use client";

import { useState } from "react";
import {
  getNumbersGrid,
  shouldShowHorizontalOp,
  shouldShowVerticalOp,
  getOperatorIndex,
} from "@/components/Puzzle/puzzle-utils";

const OPS = ["+", "-", "*", "/"];

export default function OperatorsStep({
  size,
  numbers,
  operators,
  onChange,
  onPrev,
  onNext,
}) {
  const [activeSlot, setActiveSlot] = useState(null); // { index, orientation }
  const grid = getNumbersGrid(numbers, size);

  const allFilled = operators.every((op) => OPS.includes(op));

  const handleOpClick = (row, col, isHorizontal) => {
    const index = getOperatorIndex(row, col, isHorizontal, size);
    setActiveSlot({ index, isHorizontal });
  };

  const handlePickOp = (op) => {
    if (!activeSlot) return;
    if (!OPS.includes(op)) return;

    const next = operators.slice();
    next[activeSlot.index] = op;
    onChange(next);
    setActiveSlot(null);
  };

  const handleClear = () => {
    if (!activeSlot) return;
    const next = operators.slice();
    next[activeSlot.index] = null;
    onChange(next);
    setActiveSlot(null);
  };

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h2 style={{ 
        fontSize: 18, 
        fontWeight: 700,
        color: "var(--text-primary)",
        background: "var(--bg-secondary)",
        padding: "10px 16px",
        borderRadius: 12,
        border: "1px solid var(--border-color)",
        margin: 0,
        width: "fit-content",
      }}>3. Operators</h2>
      <p style={{ 
        fontSize: 14, 
        color: "var(--text-primary)", 
        background: "var(--bg-secondary)",
        padding: "10px 16px",
        borderRadius: 12,
        border: "1px solid var(--border-color)",
        margin: 0,
        width: "fit-content",
      }}>
        Click on the small slots between tiles to assign an operator (+, −, ×, ÷).
        All operator slots must be filled before continuing.
      </p>

      {/* Grid con operadores superpuestos */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${size}, 70px)`,
          gridAutoRows: "70px",
          gap: 0,
          background: "#fff",
          border: "3px solid #111",
          borderRadius: 12,
        //overflow: "hidden",
          overflow: "visible",
          width: "fit-content",
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((value, colIndex) => {
            const isLastCol = colIndex === size - 1;
            const isLastRow = rowIndex === size - 1;

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                style={{
                  position: "relative",
                  width: 70,
                  height: 70,
                  borderRight: isLastCol ? "none" : "3px solid #111",
                  borderBottom: isLastRow ? "none" : "3px solid #111",
                  background: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 26,
                  fontWeight: 800,
                  color: "#111827",
                }}
              >
                {value ?? ""}

                {/* Operador horizontal (derecha) */}
                {shouldShowHorizontalOp(rowIndex, colIndex, size) && (
                  <button
                    type="button"
                    onClick={() => handleOpClick(rowIndex, colIndex, true)}
                    style={{
                      position: "absolute",
                      right: -2,
                      top: "50%",
                      transform: "translate(50%, -50%)",
                      width: 20,
                      height: 20,
                      borderRadius: 999,
                      border: "1px solid #d1d5db",
                      background: "#ffffff",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                      zIndex: 5, 
                    }}
                  >
                    {operators[getOperatorIndex(rowIndex, colIndex, true, size)] ??
                      "?"}
                  </button>
                )}

                {/* Operador vertical (abajo) */}
                {shouldShowVerticalOp(rowIndex, colIndex, size) && (
                  <button
                    type="button"
                    onClick={() => handleOpClick(rowIndex, colIndex, false)}
                    style={{
                      position: "absolute",
                      bottom: -2,
                      left: "50%",
                      transform: "translate(-50%, 50%)",
                      width: 20,
                      height: 20,
                      borderRadius: 999,
                      border: "1px solid #d1d5db",
                      background: "#ffffff",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                      zIndex: 5,
                    }}
                  >
                    {operators[getOperatorIndex(rowIndex, colIndex, false, size)] ??
                      "?"}
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Navegación */}
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <button
          type="button"
          onClick={onPrev}
          style={{
            padding: "8px 16px",
            borderRadius: 999,
            border: "1px solid #d1d5db",
            background: "#ffffff",
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!allFilled}
          style={{
            padding: "8px 18px",
            borderRadius: 999,
            border: "1px solid #111827",
            background: allFilled ? "#111827" : "#9ca3af",
            color: "#f9fafb",
            fontSize: 14,
            fontWeight: 600,
            cursor: allFilled ? "pointer" : "not-allowed",
          }}
        >
          Continue to target →
        </button>
      </div>

      {!allFilled && (
        <p style={{ fontSize: 13, color: "#b45309" }}>
          You must assign an operator to all slots before continuing.
        </p>
      )}

      {/* Popup selección operador */}
      {activeSlot && (
        <div
          onClick={() => setActiveSlot(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 40,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#ffffff",
              borderRadius: 16,
              padding: 16,
              minWidth: 260,
              boxShadow: "0 20px 45px rgba(15,23,42,0.35)",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div style={{ fontWeight: 600, fontSize: 15 }}>Pick an operator</div>
            <div style={{ display: "flex", gap: 8, justifyContent: "space-between" }}>
              {OPS.map((op) => (
                <button
                  key={op}
                  type="button"
                  onClick={() => handlePickOp(op)}
                  style={{
                    flex: 1,
                    padding: "10px 0",
                    borderRadius: 10,
                    border: "1px solid #d1d5db",
                    background: "#f9fafb",
                    fontSize: 18,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {op}
                </button>
              ))}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 8,
                marginTop: 4,
              }}
            >
              <button
                type="button"
                onClick={handleClear}
                style={{
                  flex: 1,
                  padding: "8px 10px",
                  borderRadius: 999,
                  border: "1px solid #d1d5db",
                  background: "#ffffff",
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setActiveSlot(null)}
                style={{
                  flex: 1,
                  padding: "8px 10px",
                  borderRadius: 999,
                  border: "1px solid #111827",
                  background: "#111827",
                  color: "#f9fafb",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
