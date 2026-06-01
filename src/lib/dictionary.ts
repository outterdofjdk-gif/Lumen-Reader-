export type DictMeaning = {
  partOfSpeech: string;
  definitions: { definition: string; example?: string }[];
};

export type DictEntry = {
  word: string;
  phonetic?: string;
  audio?: string;
  meanings: DictMeaning[];
  sourceUrl?: string;
};

const CACHE = new Map<string, DictEntry | null>();

/**
 * Naive English lemmatizer. Returns candidate base forms for a word, in
 * priority order. Used as a fallback when Cambridge has no entry/audio for
 * the inflected form (e.g. "studies" -> "study", "running" -> "run").
 */
export function lemmaCandidates(word: string): string[] {
  const w = word.toLowerCase();
  const out = new Set<string>();
  const add = (s: string) => {
    if (s && s !== w && s.length >= 2) out.add(s);
  };

  // Plurals / 3rd person singular
  if (w.endsWith("ies") && w.length > 3) add(w.slice(0, -3) + "y"); // studies -> study
  if (w.endsWith("sses")) add(w.slice(0, -2)); // kisses -> kiss
  if (w.endsWith("xes") || w.endsWith("zes") || w.endsWith("ches") || w.endsWith("shes"))
    add(w.slice(0, -2));
  if (w.endsWith("s") && !w.endsWith("ss") && w.length > 3) add(w.slice(0, -1));

  // Past tense / past participle "-ed"
  if (w.endsWith("ied") && w.length > 3) add(w.slice(0, -3) + "y"); // studied -> study
  if (w.endsWith("ed") && w.length > 3) {
    add(w.slice(0, -2)); // worked -> work
    add(w.slice(0, -1)); // liked  -> like
    // doubled consonant: stopped -> stop
    const stem = w.slice(0, -2);
    if (stem.length >= 3 && stem[stem.length - 1] === stem[stem.length - 2]) {
      add(stem.slice(0, -1));
    }
  }

  // -ing
  if (w.endsWith("ing") && w.length > 4) {
    add(w.slice(0, -3)); // working -> work
    add(w.slice(0, -3) + "e"); // making  -> make
    const stem = w.slice(0, -3);
    if (stem.length >= 3 && stem[stem.length - 1] === stem[stem.length - 2]) {
      add(stem.slice(0, -1)); // running -> run
    }
  }

  // Adverb -ly
  if (w.endsWith("ly") && w.length > 3) add(w.slice(0, -2));

  // Comparative / superlative
  if (w.endsWith("er") && w.length > 3) add(w.slice(0, -2));
  if (w.endsWith("est") && w.length > 4) add(w.slice(0, -3));

  return Array.from(out);
}

async function fetchEntry(key: string): Promise<DictEntry | null> {
  if (CACHE.has(key)) return CACHE.get(key)!;
  try {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(key)}`,
    );
    if (!res.ok) {
      CACHE.set(key, null);
      return null;
    }
    const data = await res.json();
    const first = Array.isArray(data) ? data[0] : null;
    if (!first) {
      CACHE.set(key, null);
      return null;
    }
    const phoneticObj = first.phonetics?.find(
      (p: { text?: string; audio?: string }) => p.text || p.audio,
    );
    const audio = first.phonetics?.find(
      (p: { audio?: string }) => p.audio && p.audio.length,
    )?.audio;
    const entry: DictEntry = {
      word: first.word,
      phonetic: first.phonetic || phoneticObj?.text,
      audio: audio || undefined,
      meanings: (first.meanings || []).map(
        (m: {
          partOfSpeech: string;
          definitions: { definition: string; example?: string }[];
        }) => ({
          partOfSpeech: m.partOfSpeech,
          definitions: (m.definitions || []).slice(0, 3).map((d) => ({
            definition: d.definition,
            example: d.example,
          })),
        }),
      ),
      sourceUrl: first.sourceUrls?.[0],
    };
    CACHE.set(key, entry);
    return entry;
  } catch {
    CACHE.set(key, null);
    return null;
  }
}

/**
 * Look up a word with automatic lemma fallback so plural/past/derived forms
 * still resolve to Cambridge audio when only the base form has it.
 */
export async function lookupWord(word: string): Promise<DictEntry | null> {
  const original = word.toLowerCase();
  console.log("[dict] Word clicked:", word);

  const tried: string[] = [];
  const tryKey = async (k: string): Promise<DictEntry | null> => {
    tried.push(k);
    console.log("[dict] Lookup word:", k);
    const e = await fetchEntry(k);
    console.log("[dict] Audio URL:", e?.audio || "(none)");
    return e;
  };

  let entry = await tryKey(original);
  if (entry?.audio) {
    console.log("[dict] Audio status: ok (original)");
    return entry;
  }

  // Try lemma candidates to recover audio for inflected forms.
  for (const cand of lemmaCandidates(original)) {
    const e = await tryKey(cand);
    if (e?.audio) {
      console.log("[dict] Audio status: ok (lemma:", cand, ")");
      // Merge: keep original word label, take audio/phonetic from lemma if missing.
      return {
        ...(entry || e),
        word: entry?.word || e.word,
        audio: e.audio,
        phonetic: entry?.phonetic || e.phonetic,
        meanings: entry?.meanings?.length ? entry.meanings : e.meanings,
        sourceUrl: entry?.sourceUrl || e.sourceUrl,
      };
    }
    if (!entry && e) entry = e;
  }

  console.warn(
    "[dict] Audio status: missing — no Cambridge audio for",
    original,
    "(tried:",
    tried.join(", "),
    ")",
  );
  return entry;
}
