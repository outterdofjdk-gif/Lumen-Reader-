// Simple in-memory + localStorage cache for translations
const MEM = new Map<string, string>();
const LS_KEY = "reader.translations.v1";

function loadLS(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "{}");
  } catch {
    return {};
  }
}

let lsSnapshot: Record<string, string> | null = null;
function ls(): Record<string, string> {
  if (!lsSnapshot) lsSnapshot = loadLS();
  return lsSnapshot;
}

export function getCached(word: string): string | undefined {
  const k = word.toLowerCase();
  if (MEM.has(k)) return MEM.get(k);
  const v = ls()[k];
  if (v) MEM.set(k, v);
  return v;
}

export function setCached(word: string, translation: string) {
  const k = word.toLowerCase();
  MEM.set(k, translation);
  const all = ls();
  all[k] = translation;
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(all));
  } catch {
    /* ignore quota */
  }
}

export async function translateWord(word: string): Promise<string> {
  const cached = getCached(word);
  if (cached) return cached;

  // MyMemory free API, no key required
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      word,
    )}&langpair=en|ar`;
    const res = await fetch(url);
    const data = await res.json();
    const t = (data?.responseData?.translatedText as string)?.trim();
    if (t) {
      setCached(word, t);
      return t;
    }
  } catch {
    /* fallthrough */
  }
  return "—";
}
