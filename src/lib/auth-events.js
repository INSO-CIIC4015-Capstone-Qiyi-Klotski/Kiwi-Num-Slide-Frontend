// src/lib/auth-events.js

const listeners = new Set();

/**
 * Suscribe un listener que se ejecuta cuando cambia algo de auth
 * (login, logout, cambio de avatar, etc.).
 * Devuelve una función para desuscribirse.
 */
export function onAuthChange(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Emite el evento global de cambio de auth.
 * Llamar esto después de login, logout, cambio de avatar, etc.
 */
export function emitAuthChange() {
  for (const fn of listeners) {
    try {
      fn();
    } catch (err) {
      console.error("[auth-events] listener error", err);
    }
  }
}
