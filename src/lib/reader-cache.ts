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

const NO_TRANSLATION = "لا يوجد ترجمة متاحة";

async function tryMyMemory(query: string): Promise<string> {
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(query)}&langpair=en|ar`;
    const res = await fetch(url);
    const data = await res.json();
    const t = (data?.responseData?.translatedText as string)?.trim();
    if (!t) return "";
    // For single words, reject if API returns the original English word
    if (t.toLowerCase() === query.toLowerCase()) return "";
    if (!/[\u0600-\u06FF]/.test(t)) return ""; // require Arabic chars
    return t;
  } catch {
    return "";
  }
}

async function tryLingva(query: string): Promise<string> {
  try {
    const res = await fetch(`https://lingva.ml/api/v1/en/ar/${encodeURIComponent(query)}`);
    if (!res.ok) return "";
    const data = await res.json();
    const t = (data?.translation as string)?.trim();
    if (!t) return "";
    // Only reject single-word fallback for simple words
    if (query.split(" ").length === 1 && t.toLowerCase() === query.toLowerCase()) return "";
    if (!/[\u0600-\u06FF]/.test(t)) return "";
    return t;
  } catch {
    return "";
  }
}

/**
 * Contextual Translation: Accepts word + optional context (sentence) for better translation.
 * Solves the "bank" problem: "bank" (financial) vs "bank" (river) depends on context.
 *
 * @param word - The word to translate
 * @param context - Optional full sentence containing the word, for context-aware translation
 * @returns Arabic translation
 */
export async function translateWord(word: string, context?: string): Promise<string> {
  // Check cache for the word alone first
  const cached = getCached(word);
  if (cached) return cached;

  // Use full context if available, otherwise just the word
  const query = context && context.length > word.length ? context : word;

  // Try primary translation service
  const primary = await tryMyMemory(query);
  if (primary) {
    // Cache the result for the word
    setCached(word, primary);
    return primary;
  }

  // Try secondary translation service
  const secondary = await tryLingva(query);
  if (secondary) {
    setCached(word, secondary);
    return secondary;
  }

  return NO_TRANSLATION;
}
