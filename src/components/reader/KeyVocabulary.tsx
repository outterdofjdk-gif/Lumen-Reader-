import { useEffect, useMemo, useState } from "react";
import { Volume2 } from "lucide-react";
import { lookupWord } from "@/lib/dictionary";
import { translateWord } from "@/lib/reader-cache";
import { loadSettings } from "@/lib/settings";

// Common English stopwords to exclude
const STOP = new Set(
  "the a an and or but if while of in on at to for from by with as is are was were be been being have has had do does did will would can could should may might must this that these those it its i you he she we they them us our your their his her not no so than then there here what which who whom whose how when where why about into over under again more most some such only own same very just also any all each every other".split(
    /\s+/,
  ),
);

type Item = {
  word: string;
  audio?: string;
  definition?: string;
  translation?: string;
};

function pickKeyWords(text: string, n = 4): string[] {
  const counts = new Map<string, number>();
  const tokens = text.toLowerCase().match(/[a-z][a-z'-]{4,}/g) || [];
  for (const t of tokens) {
    if (STOP.has(t)) continue;
    counts.set(t, (counts.get(t) || 0) + 1);
  }
  // Prefer longer + more frequent words
  return Array.from(counts.entries())
    .sort((a, b) => b[1] * 2 + b[0].length - (a[1] * 2 + a[0].length))
    .slice(0, n)
    .map(([w]) => w);
}

export function KeyVocabulary({ text }: { text: string }) {
  const words = useMemo(() => pickKeyWords(text, 4), [text]);
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const results = await Promise.all(
        words.map(async (w) => {
          const [entry, tr] = await Promise.all([lookupWord(w), translateWord(w)]);
          let audio = entry?.audio || "";
          if (audio.startsWith("//")) audio = "https:" + audio;
          const def = entry?.meanings?.[0]?.definitions?.[0]?.definition;
          return { word: w, audio, definition: def, translation: tr };
        }),
      );
      if (!cancelled) setItems(results);
    })();
    return () => {
      cancelled = true;
    };
  }, [words]);

  const playWord = (it: Item) => {
    if (it.audio) {
      try {
        new Audio(it.audio).play().catch(() => fallbackTTS(it.word));
        return;
      } catch {
        /* */
      }
    }
    fallbackTTS(it.word);
  };

  const fallbackTTS = (w: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const s = loadSettings();
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(w);
    u.lang = s.accentOrder?.[0] === "us" ? "en-US" : "en-GB";
    u.rate = s.rate || 1;
    window.speechSynthesis.speak(u);
  };

  if (!words.length) return null;

  return (
    <section className="not-prose mt-14 pt-10 border-t border-border">
      <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-5">
        Key Vocabulary
      </div>
      <ul className="grid sm:grid-cols-2 gap-4">
        {items.map((it) => (
          <li
            key={it.word}
            className="rounded-xl border border-border-subtle bg-surface p-4 shadow-[var(--shadow-card)]"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="font-reading text-lg font-semibold">{it.word}</span>
              <button
                onClick={() => playWord(it)}
                aria-label={`Play pronunciation of ${it.word}`}
                className="inline-flex items-center justify-center size-8 rounded-full bg-accent hover:bg-surface-hover text-foreground/80 transition-colors"
              >
                <Volume2 className="size-3.5" />
              </button>
            </div>
            {it.definition && (
              <p className="mt-2 text-sm text-muted-foreground leading-snug">{it.definition}</p>
            )}
            {it.translation && (
              <p dir="rtl" className="mt-2 text-sm font-arabic text-foreground/85">
                {it.translation}
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
