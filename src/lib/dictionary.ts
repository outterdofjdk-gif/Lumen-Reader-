export type DictMeaning = {
  partOfSpeech: string;
  definitions: { definition: string; example?: string }[];
};

export type DictEntry = {
  word: string;
  phonetic?: string; // IPA pronunciation
  syllables?: string; // Syllable breakdown (e.g., "hel-lo")
  audio?: string;
  audioSource?: string;
  meanings: DictMeaning[];
  sourceUrl?: string;
};

const CACHE = new Map<string, DictEntry | null>();
const PRON_CACHE_KEY = "reader.pron.cache.v1";

type PronCache = Record<string, { url: string; source: string }>;

function loadPronCache(): PronCache {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(PRON_CACHE_KEY) || "{}");
  } catch {
    return {};
  }
}
let pronCache: PronCache | null = null;
function pron(): PronCache {
  if (!pronCache) pronCache = loadPronCache();
  return pronCache;
}
function setPron(word: string, url: string, source: string) {
  pron()[word.toLowerCase()] = { url, source };
  try {
    localStorage.setItem(PRON_CACHE_KEY, JSON.stringify(pron()));
  } catch {
    /* quota */
  }
}

export function lemmaCandidates(word: string): string[] {
  const w = word.toLowerCase();
  const out = new Set<string>();
  const add = (s: string) => {
    if (s && s !== w && s.length >= 2) out.add(s);
  };
  if (w.endsWith("ies") && w.length > 3) add(w.slice(0, -3) + "y");
  if (w.endsWith("sses")) add(w.slice(0, -2));
  if (w.endsWith("xes") || w.endsWith("zes") || w.endsWith("ches") || w.endsWith("shes"))
    add(w.slice(0, -2));
  if (w.endsWith("s") && !w.endsWith("ss") && w.length > 3) add(w.slice(0, -1));
  if (w.endsWith("ied") && w.length > 3) add(w.slice(0, -3) + "y");
  if (w.endsWith("ed") && w.length > 3) {
    add(w.slice(0, -2));
    add(w.slice(0, -1));
    const stem = w.slice(0, -2);
    if (stem.length >= 3 && stem[stem.length - 1] === stem[stem.length - 2]) {
      add(stem.slice(0, -1));
    }
  }
  if (w.endsWith("ing") && w.length > 4) {
    add(w.slice(0, -3));
    add(w.slice(0, -3) + "e");
    const stem = w.slice(0, -3);
    if (stem.length >= 3 && stem[stem.length - 1] === stem[stem.length - 2]) {
      add(stem.slice(0, -1));
    }
  }
  if (w.endsWith("ly") && w.length > 3) add(w.slice(0, -2));
  if (w.endsWith("er") && w.length > 3) add(w.slice(0, -2));
  if (w.endsWith("est") && w.length > 4) add(w.slice(0, -3));
  return Array.from(out);
}

type AudioCandidate = { url: string; source: string };

function classifySource(audioUrl: string): string {
  if (!audioUrl) return "unknown";
  if (/-uk\.mp3/i.test(audioUrl)) return "cambridge-uk";
  if (/-us\.mp3/i.test(audioUrl)) return "cambridge-us";
  if (/ssec\.cambridge\.org|dictionary\.cambridge/i.test(audioUrl)) return "cambridge";
  if (/wikimedia|wikipedia/i.test(audioUrl)) return "wiktionary";
  if (/merriam/i.test(audioUrl)) return "merriam-webster";
  return "dictionaryapi";
}

async function fetchFromDictionaryApi(
  key: string,
): Promise<{ entry: DictEntry | null; audios: AudioCandidate[] }> {
  try {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(key)}`,
    );
    if (!res.ok) return { entry: null, audios: [] };
    const data = await res.json();
    const first = Array.isArray(data) ? data[0] : null;
    if (!first) return { entry: null, audios: [] };

    // Collect ALL audio URLs across phonetics, sorted by preference (UK > US > generic)
    const audios: AudioCandidate[] = [];
    for (const ph of first.phonetics || []) {
      if (ph.audio && ph.audio.length) {
        let url = ph.audio;
        if (url.startsWith("//")) url = "https:" + url;
        audios.push({ url, source: classifySource(url) });
      }
    }
    // Dedupe + sort: uk > us > other
    const order = (s: string) =>
      s === "cambridge-uk" ? 0 : s === "cambridge-us" ? 1 : s === "cambridge" ? 2 : 3;
    audios.sort((a, b) => order(a.source) - order(b.source));

    const phoneticObj = first.phonetics?.find(
      (p: { text?: string; audio?: string }) => p.text || p.audio,
    );

    // Extract IPA phonetic (prioritize)
    const phonetic = first.phonetic || phoneticObj?.text || "";

    // Extract syllables if available
    const syllables = first.syllables?.list?.join("-") || "";

    const entry: DictEntry = {
      word: first.word,
      phonetic,
      syllables,
      audio: audios[0]?.url,
      audioSource: audios[0]?.source,
      meanings: (first.meanings || []).map((m: any) => ({
        partOfSpeech: m.partOfSpeech,
        definitions: (m.definitions || []).slice(0, 3).map((d: any) => ({
          definition: d.definition,
          example: d.example,
        })),
      })),
      sourceUrl: first.sourceUrls?.[0],
    };
    return { entry, audios };
  } catch {
    return { entry: null, audios: [] };
  }
}

/** Wiktionary REST: extract audio URL and IPA when available. */
async function fetchFromWiktionary(key: string): Promise<AudioCandidate | null> {
  try {
    const res = await fetch(
      `https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(key)}`,
    );
    if (!res.ok) return null;
    const data = await res.json();
    const en = data?.en;
    if (!Array.isArray(en)) return null;
    // Wiktionary REST does not always carry audio — scan for any pronunciation field.
    // Many pages include an "audio" property at the top of section[0].
    for (const section of en) {
      const audio = section?.audio;
      if (typeof audio === "string" && audio.startsWith("http")) {
        return { url: audio, source: "wiktionary" };
      }
    }
    return null;
  } catch {
    return null;
  }
}

async function lookupOnce(
  key: string,
): Promise<{ entry: DictEntry | null; audios: AudioCandidate[] }> {
  if (CACHE.has(key)) {
    const e = CACHE.get(key)!;
    return { entry: e, audios: e?.audio ? [{ url: e.audio, source: e.audioSource || "unknown" }] : [] };
  }
  const dapi = await fetchFromDictionaryApi(key);
  CACHE.set(key, dapi.entry);
  return dapi;
}

/**
 * Improved lookup with prioritized IPA and syllables.
 * Prefers high-quality audio sources before falling back to speech synthesis.
 */
export async function lookupWord(word: string): Promise<DictEntry | null> {
  const original = word.toLowerCase();
  console.log("[pron] Word clicked:", word);

  // 1) check pronunciation cache for instant audio
  const cached = pron()[original];
  if (cached) {
    console.log("[pron]", original, "| source: CACHE (" + cached.source + ") | url:", cached.url);
    return {
      word: original,
      audio: cached.url,
      audioSource: cached.source,
      meanings: [],
    };
  }

  const tried: string[] = [];
  const keys = [original, ...lemmaCandidates(original)];
  let bestEntry: DictEntry | null = null;
  const allAudios: AudioCandidate[] = [];

  for (const k of keys) {
    tried.push(k);
    const r = await lookupOnce(k);
    if (!bestEntry && r.entry) bestEntry = r.entry;
    for (const a of r.audios) allAudios.push(a);
    // Only break if we found HIGH-QUALITY audio (cambridge sources)
    if (allAudios.some((a) => a.source.startsWith("cambridge"))) break;
  }

  // Fallback: Wiktionary only if no good audio found yet
  if (!allAudios.some((a) => a.source.startsWith("cambridge"))) {
    const w = await fetchFromWiktionary(original);
    if (w) allAudios.push(w);
  }

  if (allAudios.length) {
    // Prioritize high-quality sources over fallback
    const prioritized = allAudios.sort((a, b) => {
      const scoreA = a.source.startsWith("cambridge") ? 0 : a.source === "merriam-webster" ? 1 : 2;
      const scoreB = b.source.startsWith("cambridge") ? 0 : b.source === "merriam-webster" ? 1 : 2;
      return scoreA - scoreB;
    });

    const chosen = prioritized[0];
    setPron(original, chosen.url, chosen.source);
    console.log("[pron]", original, "| source:", chosen.source, "| url:", chosen.url);
    return {
      ...(bestEntry || { word: original, meanings: [] }),
      audio: chosen.url,
      audioSource: chosen.source,
      phonetic: bestEntry?.phonetic,
      syllables: bestEntry?.syllables,
    };
  }

  // No audio found - but still return best entry with IPA + syllables for reference
  console.warn(
    "[pron] No audio found",
    original,
    "(tried:",
    tried.join(", "),
    "+ wiktionary)",
  );
  return bestEntry;
}
