// src/app/users/[id]/page.jsx
import UserProfileClient from "./UserProfileClient";
import { API_URL } from "../../../lib/env";
// Usa la misma URL que el backend público (ngrok o prod)
// const API_URL = "https://adc30854b4f7.ngrok-free.app";

/**
 * En build, preguntamos al backend por TODOS los usuarios (paginado)
 * y devolvemos la lista de IDs para que Next pueda exportar /users/[id]
 * con output: "export".
 */
export async function generateStaticParams() {


    const isLocal =
    typeof API_URL === "string" &&
    API_URL.includes("localhost");

    // 🔹 DEV MODE: usar ID mock
    if (isLocal) {
        const max = 60; //Numero magico, 60 es el numero de usuarios de prueba que el ETL crea en la base de datos
        return Array.from({ length: max }, (_, i) => ({
        id: String(i + 1),
        }));
    }
        
  const params = [];
  let cursor = null;
  const limit = 100;

  try {
    // loop de paginación
    // contrato esperado: { items: [...], next_cursor: string | null }
    /* eslint-disable no-constant-condition */
    while (true) {
      const qs = new URLSearchParams();
      qs.set("limit", String(limit));
      qs.set("sort", "created_at_desc");
      if (cursor) qs.set("cursor", cursor);

      const res = await fetch(`${API_URL}/users?${qs.toString()}`, {
        method: "GET",
      });

      if (!res.ok) {
        console.warn("generateStaticParams /users error:", res.status);
        break;
      }

      const data = await res.json();
      const items = Array.isArray(data.items) ? data.items : [];

      for (const u of items) {
        if (u?.id != null) {
          params.push({ id: String(u.id) });
        }
      }

      if (!data.next_cursor) break;
      cursor = data.next_cursor;
    }
  } catch (err) {
    console.warn("generateStaticParams /users exception:", err);
    // si falla, devolvemos lo que tengamos (o [])
  }

  return params;
}

export default function UserProfilePage({ params }) {
  const rawId = params?.id;

  // asegurar el ID
  const id = typeof rawId === "string" ? rawId : "";

  return <UserProfileClient userId={id} />;
}
