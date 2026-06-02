import { useEffect, useState, useCallback } from "react";
import {
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
  resolveTheme,
  type ReaderSettings,
} from "@/lib/settings";

export function useReaderSettings() {
  const [settings, setSettings] = useState<ReaderSettings>(DEFAULT_SETTINGS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSettings(loadSettings());
    setHydrated(true);

    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<ReaderSettings>).detail;
      if (detail) setSettings(detail);
    };
    window.addEventListener("reader:settings-changed", onChange);
    return () => window.removeEventListener("reader:settings-changed", onChange);
  }, []);

  // Apply theme + CSS vars live
  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.classList.toggle("dark", resolveTheme(settings.theme) === "dark");
    document.documentElement.style.setProperty("--reading-lh-user", String(settings.lineHeight));
    document.documentElement.style.setProperty("--reading-fs-user", `${settings.fontSize}px`);
  }, [settings.theme, settings.fontSize, settings.lineHeight, hydrated]);

  const update = useCallback(<K extends keyof ReaderSettings>(k: K, v: ReaderSettings[K]) => {
    setSettings((s) => {
      const next = { ...s, [k]: v };
      saveSettings(next);
      return next;
    });
  }, []);

  const replace = useCallback((s: ReaderSettings) => {
    setSettings(s);
    saveSettings(s);
  }, []);

  return { settings, update, replace, hydrated };
}
