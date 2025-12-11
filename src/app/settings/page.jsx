"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  loadSettings,
  saveSettings,
  applyDarkMode,
  DEFAULT_KEY_BINDINGS,
  getKeyDisplayName,
  getActionDisplayName,
} from "@/lib/settings-store";
import PageLayout from "@/components/layout/PageLayout";
import styles from "./page.module.css";

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const backHref = searchParams.get("backTo") || "/";
  
  // Settings state
  const [darkMode, setDarkMode] = useState(false);
  const [keyBindings, setKeyBindings] = useState(DEFAULT_KEY_BINDINGS);
  const [editingKey, setEditingKey] = useState(null); // which action is being edited
  const [isLoading, setIsLoading] = useState(true);

  // Load settings on mount
  useEffect(() => {
    const settings = loadSettings();
    setDarkMode(settings.darkMode);
    setKeyBindings(settings.keyBindings);
    applyDarkMode(settings.darkMode);
    setIsLoading(false);
  }, []);

  // Handle dark mode toggle
  function handleDarkModeToggle() {
    const newValue = !darkMode;
    setDarkMode(newValue);
    applyDarkMode(newValue);
    saveSettings({ darkMode: newValue, keyBindings });
  }

  // Handle key binding change
  const handleKeyPress = useCallback((e) => {
    if (!editingKey) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const key = e.key;
    
    // Ignore modifier keys alone
    if (["Shift", "Control", "Alt", "Meta"].includes(key)) return;
    
    // Check if key is already bound to another action
    const existingAction = Object.entries(keyBindings).find(
      ([action, boundKey]) => boundKey === key && action !== editingKey
    );
    
    if (existingAction) {
      // Swap the bindings
      const newBindings = {
        ...keyBindings,
        [existingAction[0]]: keyBindings[editingKey],
        [editingKey]: key,
      };
      setKeyBindings(newBindings);
      saveSettings({ darkMode, keyBindings: newBindings });
    } else {
      const newBindings = { ...keyBindings, [editingKey]: key };
      setKeyBindings(newBindings);
      saveSettings({ darkMode, keyBindings: newBindings });
    }
    
    setEditingKey(null);
  }, [editingKey, keyBindings, darkMode]);

  // Listen for key press when editing
  useEffect(() => {
    if (editingKey) {
      window.addEventListener("keydown", handleKeyPress);
      return () => window.removeEventListener("keydown", handleKeyPress);
    }
  }, [editingKey, handleKeyPress]);

  // Reset key bindings to default
  function handleResetBindings() {
    setKeyBindings(DEFAULT_KEY_BINDINGS);
    saveSettings({ darkMode, keyBindings: DEFAULT_KEY_BINDINGS });
  }

  if (isLoading) {
    return (
      <PageLayout title="Settings" backHref={backHref}>
        <div className={styles.loading}>Loading...</div>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title="Settings" 
      backHref={backHref}
      titleFontSize="clamp(36px, 6vw, 72px)"
      titleFontSizeTablet="clamp(32px, 5vw, 56px)"
      titleFontSizeMobile="clamp(32px, 8vw, 48px)"
    >
      <div className={styles.container}>
        {/* Appearance Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Appearance</h2>
          
          <div className={styles.cardGroup}>
            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <span className={styles.settingIcon}>🌙</span>
                <span className={styles.settingLabel}>Dark Mode</span>
              </div>
              <button 
                className={`${styles.toggle} ${darkMode ? styles.toggleOn : ""}`}
                onClick={handleDarkModeToggle}
                aria-label={`Dark mode ${darkMode ? "on" : "off"}`}
              >
                <span className={styles.toggleThumb} />
              </button>
            </div>
          </div>
        </section>

        {/* Controls Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Controls</h2>
          
          <div className={styles.cardGroup}>
            {Object.entries(keyBindings).map(([action, key]) => (
              <div key={action} className={styles.keyBindingRow}>
                <span className={styles.keyAction}>{getActionDisplayName(action)}</span>
                <button
                  className={`${styles.keyButton} ${editingKey === action ? styles.keyButtonEditing : ""}`}
                  onClick={() => setEditingKey(editingKey === action ? null : action)}
                >
                  {editingKey === action ? (
                    <span className={styles.pressKey}>Press a key...</span>
                  ) : (
                    <span className={styles.keyDisplay}>{getKeyDisplayName(key)}</span>
                  )}
                </button>
              </div>
            ))}
            
            <button onClick={handleResetBindings} className={styles.resetBtn}>
              <span className={styles.linkIcon}>↺</span>
              <span className={styles.linkText}>Reset to Defaults</span>
            </button>
          </div>
        </section>

        {/* About Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>About</h2>
          
          <div className={styles.cardGroup}>
            <div className={styles.aboutCard}>
              <div className={styles.appName}>Kiwi Num Slide</div>
              <div className={styles.appVersion}>Version 1.0.0</div>
              <p className={styles.appDesc}>
                A numeric sliding puzzle game inspired by Klotski. 
                Capstone Project 2025.
              </p>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
