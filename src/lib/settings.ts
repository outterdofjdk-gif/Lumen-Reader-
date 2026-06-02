export type Theme = "light" | "dark" | "system";
export type Width = "narrow" | "standard" | "wide";

export type ReaderSettings = {
  theme: Theme;
  fontSize: number; // px 16-22
  width: Width;
  lineHeight: number; // 1.6 - 1.95
  autoPronounce: boolean;
  popupDurationMs: number; // 1500 - 4000
  accentOrder: ("uk" | "us")[];
  englishLevel: "any" | "a2" | "b1" | "b2";
  showProgressBar: boolean;
  showTranslations: boolean;
  rate: number;
};

export const DEFAULT_SETTINGS: ReaderSettings = {
  theme: "system",
  fontSize: 19,
  width: "standard",
  lineHeight: 1.78,
  autoPronounce: true,
  popupDurationMs: 2600,
  accentOrder: ["uk", "us"],
  englishLevel: "any",
  showProgressBar: true,
  showTranslations: true,
  rate: 1,
};

export const SETTINGS_KEY = "reader.settings.v1";

export function loadSettings(): ReaderSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}") };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(s: ReaderSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  window.dispatchEvent(new CustomEvent("reader:settings-changed", { detail: s }));
}

export function widthToPx(w: Width): number {
  return w === "narrow" ? 640 : w === "wide" ? 880 : 760;
}

export function resolveTheme(t: Theme): "light" | "dark" {
  if (t === "system" && typeof window !== "undefined") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return t === "dark" ? "dark" : "light";
}
