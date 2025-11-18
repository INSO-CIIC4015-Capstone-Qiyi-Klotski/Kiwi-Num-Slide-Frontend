import { Suspense } from "react";
import VerifyConfirmClient from "./VerifyConfirmClient";

export default function VerifyConfirmPage() {
  return (
    <Suspense
      fallback={
        <main
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#fdf5ff",
            padding: 16,
          }}
        >
          <div
            style={{
              maxWidth: 420,
              width: "100%",
              background: "#ffffff",
              borderRadius: 18,
              padding: 24,
              boxShadow: "0 18px 45px rgba(15, 23, 42, 0.09)",
              border: "1px solid #f1e4ff",
              textAlign: "center",
            }}
          >
            <h1
              style={{
                fontSize: 22,
                fontWeight: 800,
                marginBottom: 8,
              }}
            >
              Email verification
            </h1>
            <p style={{ color: "#4b5563", fontSize: 14 }}>
              Verifying your email…
            </p>
          </div>
        </main>
      }
    >
      <VerifyConfirmClient />
    </Suspense>
  );
}
