// src/app/daily/loading.jsx
export default function LoadingDailyPuzzle() {
  return (
    <main
      style={{
        padding: 32,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 16,
          padding: 24,
          background: "#f9fafb",
          width: "100%",
          maxWidth: 520,
          minHeight: 140,
          animation: "pulse 1.5s ease-in-out infinite",
        }}
      >
        <div
          style={{
            width: 140,
            height: 12,
            background: "#e5e7eb",
            borderRadius: 8,
            marginBottom: 10,
          }}
        />
        <div
          style={{
            width: "70%",
            height: 22,
            background: "#e5e7eb",
            borderRadius: 8,
            marginBottom: 16,
          }}
        />
        <div
          style={{
            width: 120,
            height: 32,
            background: "#e5e7eb",
            borderRadius: 999,
          }}
        />
      </div>
    </main>
  );
}
