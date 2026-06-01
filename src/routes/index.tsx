import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { ControlBar } from "@/components/reader/ControlBar";
import { InputPanel } from "@/components/reader/InputPanel";
import { ArticleReader } from "@/components/reader/ArticleReader";
import { Statistics } from "@/components/reader/Statistics";
import { ArticlesFeed } from "@/components/reader/ArticlesFeed";
import { SavedWords, saveWord } from "@/components/reader/SavedWords";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Hero } from "@/components/home/Hero";
import { ReadingProgress } from "@/components/reader/ReadingProgress";

import type { Accent } from "@/lib/tts";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lumen Reader — Tap any word, hear it, understand it" },
      {
        name: "description",
        content:
          "A premium English reader with instant Arabic translations, Cambridge pronunciation, and a calm, focused reading experience.",
      },
      { property: "og:title", content: "Lumen Reader" },
      {
        property: "og:description",
        content:
          "Tap any English word for instant Arabic meaning and natural pronunciation. Read like Medium, learn like Cambridge.",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;0,6..72,700;1,6..72,400;1,6..72,500&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap",
      },
    ],
  }),
  component: Home,
});

type Prefs = {
  fontSize: number;
  dark: boolean;
  accent: Accent;
  rate: number;
  showTranslations: boolean;
};

const PREFS_KEY = "reader.prefs.v1";
const DEFAULT: Prefs = {
  fontSize: 19,
  dark: false,
  accent: "en-US",
  rate: 1,
  showTranslations: true,
};

function loadPrefs(): Prefs {
  if (typeof window === "undefined") return DEFAULT;
  try {
    return { ...DEFAULT, ...JSON.parse(localStorage.getItem(PREFS_KEY) || "{}") };
  } catch {
    return DEFAULT;
  }
}

function Home() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT);
  const [hydrated, setHydrated] = useState(false);
  const [text, setText] = useState("");
  const [spokenWords, setSpokenWords] = useState<string[]>([]);

  const readerRef = useRef<HTMLDivElement | null>(null);
  const feedRef = useRef<HTMLDivElement | null>(null);
  const savedRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setPrefs(loadPrefs());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  }, [prefs, hydrated]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", prefs.dark);
  }, [prefs.dark]);

  const update = <K extends keyof Prefs>(k: K, v: Prefs[K]) =>
    setPrefs((p) => ({ ...p, [k]: v }));

  const tapTimers = useMemo(() => new Map<string, number>(), []);
  const handleSpoken = (word: string) => {
    setSpokenWords((s) => [...s, word.toLowerCase()]);
    const last = tapTimers.get(word.toLowerCase());
    const now = Date.now();
    if (last && now - last < 600) {
      saveWord(word);
      toast.success(`Saved "${word}"`);
      tapTimers.delete(word.toLowerCase());
    } else {
      tapTimers.set(word.toLowerCase(), now);
    }
  };

  const uniqueSpoken = useMemo(() => new Set(spokenWords).size, [spokenWords]);

  const scrollTo = (el: HTMLElement | null) =>
    el?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster richColors position="top-center" />
      <ReadingProgress targetRef={readerRef} />

      <SiteHeader
        dark={prefs.dark}
        setDark={(b) => update("dark", b)}
        onJumpToFeed={() => scrollTo(feedRef.current)}
        onJumpToSaved={() => scrollTo(savedRef.current)}
      />

      <main>
        <Hero
          onStart={() => scrollTo(inputRef.current)}
          onBrowse={() => scrollTo(feedRef.current)}
        />

        {/* Input strip */}
        <section
          ref={inputRef}
          className="max-w-3xl mx-auto px-4 sm:px-6 -mt-2 sm:-mt-4 mb-16 sm:mb-24 scroll-mt-24"
        >
          <div className="rounded-2xl bg-surface border border-border-subtle shadow-card p-4 sm:p-6 animate-fade-up">
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-3">
              Start
            </div>
            <InputPanel text={text} setText={setText} />
          </div>
        </section>

        {/* Reader */}
        <section
          id="read"
          ref={readerRef}
          className="px-4 sm:px-6 lg:px-10 pb-20 scroll-mt-20"
        >
          <div className="max-w-7xl mx-auto grid lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_320px] gap-8 lg:gap-12 items-start">
            <div className="min-w-0 space-y-6">
              <div className="flex justify-center">
                <ControlBar
                  fontSize={prefs.fontSize}
                  setFontSize={(n) => update("fontSize", n)}
                  dark={prefs.dark}
                  setDark={(b) => update("dark", b)}
                  accent={prefs.accent}
                  setAccent={(a) => update("accent", a)}
                  rate={prefs.rate}
                  setRate={(r) => update("rate", r)}
                  showTranslations={prefs.showTranslations}
                  setShowTranslations={(b) => update("showTranslations", b)}
                />
              </div>

              <div
                className="rounded-3xl bg-reading-bg border border-border-subtle shadow-card"
                style={{ boxShadow: "var(--shadow-elevated)" }}
              >
                <div className="mx-auto max-w-[820px] px-5 sm:px-10 md:px-16 lg:px-20 py-10 sm:py-16 lg:py-20">
                  <ArticleReader
                    text={text}
                    fontSize={prefs.fontSize}
                    accent={prefs.accent}
                    rate={prefs.rate}
                    showTranslations={prefs.showTranslations}
                    onSpoken={handleSpoken}
                  />
                </div>
              </div>
            </div>

            <aside ref={savedRef} className="space-y-4 lg:sticky lg:top-24 scroll-mt-24">
              <Statistics
                text={text}
                spokenCount={spokenWords.length}
                uniqueSpoken={uniqueSpoken}
              />
              <SavedWords />
            </aside>
          </div>
        </section>

        {/* Feed */}
        <section
          ref={feedRef}
          className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-10 py-16 sm:py-24 border-t border-border-subtle scroll-mt-20"
        >
          <ArticlesFeed
            onLoad={(t) => {
              setText(t);
              setSpokenWords([]);
              scrollTo(readerRef.current);
            }}
          />
        </section>

        <footer className="border-t border-border-subtle">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <div className="font-reading text-foreground/70">
              Lumen Reader — designed for thoughtful readers.
            </div>
            <div>
              Pronunciation by Cambridge · Translations by MyMemory
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
