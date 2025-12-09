/**
 * Settings Store - Manages dark mode and key bindings
 * Persists to localStorage
 */

const SETTINGS_KEY = "kiwi-settings";

// Default key bindings for puzzle controls
export const DEFAULT_KEY_BINDINGS = {
  moveUp: "ArrowUp",
  moveDown: "ArrowDown",
  moveLeft: "ArrowLeft",
  moveRight: "ArrowRight",
};

// Default settings
const DEFAULT_SETTINGS = {
  darkMode: false,
  keyBindings: { ...DEFAULT_KEY_BINDINGS },
};

// Event listeners for settings changes
const listeners = new Set();

/**
 * Load settings from localStorage
 */
export function loadSettings() {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        darkMode: parsed.darkMode ?? DEFAULT_SETTINGS.darkMode,
        keyBindings: {
          ...DEFAULT_KEY_BINDINGS,
          ...(parsed.keyBindings || {}),
        },
      };
    }
  } catch (e) {
    console.error("Failed to load settings:", e);
  }
  
  return DEFAULT_SETTINGS;
}

/**
 * Save settings to localStorage
 */
export function saveSettings(settings) {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    // Notify all listeners
    listeners.forEach((fn) => fn(settings));
  } catch (e) {
    console.error("Failed to save settings:", e);
  }
}

/**
 * Subscribe to settings changes
 */
export function onSettingsChange(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

/**
 * Apply dark mode to document
 */
export function applyDarkMode(enabled) {
  if (typeof document === "undefined") return;
  
  if (enabled) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

/**
 * Get display name for a key
 */
export function getKeyDisplayName(key) {
  const keyNames = {
    ArrowUp: "↑",
    ArrowDown: "↓",
    ArrowLeft: "←",
    ArrowRight: "→",
    " ": "Space",
    Enter: "Enter",
    Escape: "Esc",
  };
  
  return keyNames[key] || key.toUpperCase();
}

/**
 * Get action display name
 */
export function getActionDisplayName(action) {
  const actionNames = {
    moveUp: "Move Up",
    moveDown: "Move Down",
    moveLeft: "Move Left",
    moveRight: "Move Right",
  };
  
  return actionNames[action] || action;
}

