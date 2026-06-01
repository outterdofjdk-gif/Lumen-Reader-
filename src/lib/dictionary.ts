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

export async function lookupWord(word: string): Promise<DictEntry | null> {
  const key = word.toLowerCase();
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
