"use client";

import { useEffect } from "react";
import { loadSettings, applyDarkMode, onSettingsChange } from "@/lib/settings-store";

/**
 * Initializes dark mode on page load and listens for changes.
 * This component renders nothing - it just applies the dark class.
 */
export default function DarkModeInit() {
  useEffect(() => {
    // Apply dark mode on initial load
    const settings = loadSettings();
    applyDarkMode(settings.darkMode);

    // Listen for settings changes (from settings page)
    const unsubscribe = onSettingsChange((newSettings) => {
      applyDarkMode(newSettings.darkMode);
    });

    return () => unsubscribe();
  }, []);

  return null;
}

