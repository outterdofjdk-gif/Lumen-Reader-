const KEY = "reader.history.v1";

export type HistoryEntry = {
  id: string;
  title: string;
  source: string;
  url?: string;
  category?: string;
  image?: string;
  openedAt: number;
  scrollPercent: number;
};

export function getHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function pushHistory(entry: Omit<HistoryEntry, "openedAt" | "scrollPercent"> & { scrollPercent?: number }) {
  const list = getHistory().filter((h) => h.id !== entry.id);
  list.unshift({
    ...entry,
    openedAt: Date.now(),
    scrollPercent: entry.scrollPercent ?? 0,
  });
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, 100)));
  window.dispatchEvent(new Event("reader:history-changed"));
}

export function updateHistoryProgress(id: string, scrollPercent: number) {
  const list = getHistory();
  const idx = list.findIndex((h) => h.id === id);
  if (idx === -1) return;
  list[idx].scrollPercent = scrollPercent;
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function clearHistory() {
  localStorage.setItem(KEY, "[]");
  window.dispatchEvent(new Event("reader:history-changed"));
}
