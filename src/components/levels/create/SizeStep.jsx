// src/components/levels/create/SizeStep.jsx
"use client";

export default function SizeStep({ size, onChange, onNext }) {
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
      }}>1. Choose board size</h2>
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
        Select the grid size for your level. Bigger boards usually mean harder puzzles.
      </p>

      <div style={{ display: "flex", gap: 8 }}>
        {[3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            style={{
              padding: "8px 18px",
              borderRadius: 8,
              border: size === n ? "2px solid #111827" : "1px solid #d1d5db",
              background: size === n ? "#111827" : "#f9fafb",
              color: size === n ? "#f9fafb" : "#111827",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {n} × {n}
          </button>
        ))}
      </div>

      <div>
        <button
          type="button"
          onClick={onNext}
          disabled={!size}
          style={{
            marginTop: 8,
            padding: "8px 18px",
            borderRadius: 999,
            border: "1px solid #111827",
            background: "#111827",
            color: "#f9fafb",
            fontSize: 14,
            fontWeight: 600,
            cursor: size ? "pointer" : "not-allowed",
            opacity: size ? 1 : 0.5,
          }}
        >
          Continue to numbers →
        </button>
      </div>
    </section>
  );
}
