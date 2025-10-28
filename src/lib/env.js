
const raw = process.env.NEXT_PUBLIC_API_URL?.trim();
if (!raw) throw new Error("Falta NEXT_PUBLIC_API_URL en .env.local");

// quita trailing slash y espacios raros
export const API_URL = raw.replace(/#.*/g, "").trim().replace(/\/$/, "");

