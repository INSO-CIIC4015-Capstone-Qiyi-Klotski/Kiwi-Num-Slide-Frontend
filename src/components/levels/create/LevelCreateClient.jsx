// src/components/levels/create/LevelCreateClient.jsx
"use client";

import { useState, useMemo } from "react";
import SizeStep from "./SizeStep";
import NumbersStep from "./NumbersStep";
import OperatorsStep from "./OperatorsStep";
import TargetStep from "./TargetStep";
import SummaryStep from "./SummaryStep";
import { PuzzlesService } from "@/services/puzzles.service";

const MIN_N = 3;
const MAX_N = 5;

function makeDefaultNumbers(N) {
  const arr = [];
  let number = 1;
  for (let i = 0; i < N * N - 1; i++) {
    if (number === 10) number = 1;
    arr.push(number);
    number++;
  }
  arr.push(null); // hueco
  return arr;
}

// por ahora simplemente todos "+" para arrancar
function makeDefaultOperators(N) {
  const totalOps = 2 * N * (N - 1) - 2;
  return Array(totalOps).fill("+");
}

export default function LevelCreateClient() {
  const [step, setStep] = useState(1);
  const [size, setSize] = useState(3);

  // Estado del tablero inicial (Numbers step)
  const [numbers, setNumbers] = useState(makeDefaultNumbers(3));

  // Estado del tablero “mezclado” usado en Target step
  const [targetNumbers, setTargetNumbers] = useState(null);

  const [operators, setOperators] = useState(makeDefaultOperators(3));
  const [expected, setExpected] = useState(Array(2 * 3).fill(null));

  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [createdLevelId, setCreatedLevelId] = useState(null);

  // cuando cambie size, reseteamos estructuras
  const handleSizeChange = (newN) => {
    setSize(newN);
    setNumbers(makeDefaultNumbers(newN));
    setTargetNumbers(null);                    
    setOperators(makeDefaultOperators(newN));
    setExpected(Array(2 * newN).fill(null));  
    // regresamos a step 2 automáticamente
    if (step < 2) setStep(2);
  };

  // validaciones básicas por step
  const canGoToStep2 = size >= MIN_N && size <= MAX_N;
  const canGoToStep3 = useMemo(
    () => numbers.filter((n) => n !== null).length === size * size - 1,
    [numbers, size]
  );
  const canGoToStep4 = useMemo(
    () => operators.filter(Boolean).length === operators.length,
    [operators]
  );
  const canSubmit = useMemo(
    () =>
      canGoToStep2 &&
      canGoToStep3 &&
      canGoToStep4 &&
      expected.every((v) => typeof v === "number"),
    [canGoToStep2, canGoToStep3, canGoToStep4, expected]
  );

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      // quitamos el null del final para board_spec.numbers
      const boardNumbers = numbers.filter((n) => n !== null);

      const payload = {
        title: title || `Custom Level (${size}x${size})`,
        size,
        board_spec: {
          N: size,
          numbers: boardNumbers,   
          operators,               // ya en formato "+-*/"
          expected,
        },
        difficulty,
        num_solutions: 0,
      };

      const res = await PuzzlesService.create(payload);
      if (!res || res.ok === false) {
        throw new Error(res?.error || "Failed to create level");
      }

      const data = res.data ?? res;
      setCreatedLevelId(data.id);
      setStep(5);
    } catch (err) {
      console.error(err);
      setSubmitError(err.message || "Error creating level");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Step indicators / navegación simple */}
      <div style={{ display: "flex", gap: 8, fontSize: 13 }}>
        {["Size", "Numbers", "Operators", "Target", "Summary"].map(
          (label, idx) => {
            const s = idx + 1;
            const active = step === s;
            return (
              <div
                key={label}
                style={{
                  padding: "4px 10px",
                  borderRadius: 999,
                  border: "1px solid #d1d5db",
                  background: active ? "#111827" : "#f9fafb",
                  color: active ? "#f9fafb" : "#111827",
                }}
              >
                {s}. {label}
              </div>
            );
          }
        )}
      </div>

      {step === 1 && (
        <SizeStep
          size={size}
          onChange={handleSizeChange}
          onNext={() => canGoToStep2 && setStep(2)}
        />
      )}

      {step === 2 && (
        <NumbersStep
          size={size}
          numbers={numbers}
          onChange={(next) => {
            setNumbers(next);
            setTargetNumbers(null);     // si cambias los números iniciales, resetea target
            setExpected(Array(2 * size).fill(null));
          }}
          onPrev={() => setStep(1)}
          onNext={() => canGoToStep3 && setStep(3)}
        />
      )}

      {step === 3 && (
        <OperatorsStep
          size={size}
          numbers={numbers}
          operators={operators}
          onChange={(next) => {
            setOperators(next);
            setExpected(Array(2 * size).fill(null)); // cambiar operadores invalida expected
          }}
          onPrev={() => setStep(2)}
          onNext={() => canGoToStep4 && setStep(4)}
        />
      )}

      {step === 4 && (
        <TargetStep
          size={size}
          numbers={numbers}                   // estado inicial
          targetNumbers={targetNumbers}    
          onTargetNumbersChange={setTargetNumbers}
          operators={operators}
          expected={expected}
          onExpectedChange={setExpected}
          onPrev={() => setStep(3)}
          onNext={() => setStep(5)}
        />
      )}

      {step === 5 && (
        <SummaryStep
          size={size}
          numbers={numbers}
          targetNumbers={targetNumbers}    
          operators={operators}
          expected={expected}
          title={title}
          difficulty={difficulty}
          onTitleChange={setTitle}
          onDifficultyChange={setDifficulty}
          onPrev={() => setStep(4)}
          onSubmit={handleSubmit}
          canSubmit={canSubmit}
          submitting={submitting}
          submitError={submitError}
          createdLevelId={createdLevelId}
        />
      )}
    </div>
  );
}
