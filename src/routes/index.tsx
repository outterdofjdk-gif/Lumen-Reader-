import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { BookOpen, Sparkles } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { ControlBar } from "@/components/reader/ControlBar";
import { InputPanel } from "@/components/reader/InputPanel";
import { ArticleReader } from "@/components/reader/ArticleReader";
import { Statistics } from "@/components/reader/Statistics";
import { ArticlesFeed } from "@/components/reader/ArticlesFeed";
import { SavedWords, saveWord } from "@/components/reader/SavedWords";
import { WordPopup } from "@/components/reader/WordPopup";
import type { Accent } from "@/lib/tts";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lumen Reader — Tap any word, hear it, understand it" },
      {
        name: "description",
        content:
          "An advanced English article reader with instant Arabic translations, natural pronunciation, and a calm reading experience.",
      },
      { property: "og:title", content: "Lumen Reader" },
      {
        property: "og:description",
        content:
          "Tap any word for instant translation and pronunciation. Read English articles beautifully.",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Poppins:wght@300;400;500;600;700&display=swap",
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
  fontSize: 18,
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
  const [showWelcome, setShowWelcome] = useState(false);
  const [popupWord, setPopupWord] = useState<string | null>(null);
  const [popupOpen, setPopupOpen] = useState(false);

  useEffect(() => {
    setPrefs(loadPrefs());
    setHydrated(true);
    if (!localStorage.getItem("reader.welcomed.v1")) {
      setShowWelcome(true);
      localStorage.setItem("reader.welcomed.v1", "1");
    }
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  }, [prefs, hydrated]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", prefs.dark);
  }, [prefs.dark]);

  const update = <K extends keyof Prefs>(k: K, v: Prefs[K]) =>
    setPrefs((p) => ({ ...p, [k]: v }));

  // double-tap on a word to save it
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-tint via-background to-background">
      <Toaster richColors position="top-center" />

      {showWelcome && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4 animate-in fade-in"
          onClick={() => setShowWelcome(false)}
        >
          <div
            className="max-w-md w-full bg-card rounded-2xl p-7 border border-border shadow-xl animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="size-11 rounded-xl bg-primary/15 text-primary grid place-items-center">
                <Sparkles className="size-5" />
              </div>
              <h2 className="font-reading text-2xl font-semibold">Welcome to Lumen</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-5">
              Read English articles with the gentle help of instant translations and
              natural pronunciation. <strong>Tap any word</strong> to hear it and see
              its Arabic meaning. Tap twice to save it to your word list.
            </p>
            <button
              onClick={() => setShowWelcome(false)}
              className="w-full rounded-lg bg-primary text-primary-foreground py-2.5 font-medium hover:bg-primary/90 transition-colors"
            >
              Start reading
            </button>
          </div>
        </div>
      )}

      <header className="border-b border-border bg-card/70 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-lg bg-primary text-primary-foreground grid place-items-center shadow-sm">
              <BookOpen className="size-5" />
            </div>
            <div className="leading-tight">
              <div className="font-reading font-semibold text-lg">Lumen Reader</div>
              <div className="text-[11px] text-muted-foreground hidden sm:block">
                Read · Tap · Understand
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-10 py-6 sm:py-10 space-y-12">
        {/* Hero / Input */}
        <section className="space-y-5 max-w-4xl mx-auto">
          <div className="text-center space-y-3">
            <h1 className="font-reading text-3xl sm:text-5xl font-semibold tracking-tight">
              Read English with quiet confidence.
            </h1>
            <p className="text-muted-foreground sm:text-lg">
              Paste an article, fetch one from the web, or pick from today's feed. Every
              word becomes a tap away from meaning and pronunciation.
            </p>
          </div>

          <div className="rounded-2xl bg-card border border-border p-4 sm:p-6 shadow-sm">
            <InputPanel text={text} setText={setText} />
          </div>
        </section>

        {/* Reader */}
        <section className="space-y-4">
          <div className="max-w-5xl mx-auto">
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

          <div className="grid xl:grid-cols-[minmax(0,1fr)_340px] gap-6 xl:gap-10 items-start">
            <div className="rounded-2xl bg-card border border-border shadow-sm">
              <div className="mx-auto max-w-[72ch] px-5 sm:px-10 lg:px-16 py-8 sm:py-12">
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
            <aside className="space-y-4 xl:sticky xl:top-20">
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
        <div className="max-w-6xl mx-auto w-full">
          <ArticlesFeed
            onLoad={(t) => {
              setText(t);
              setSpokenWords([]);
            }}
          />
        </div>

        <footer className="text-center text-xs text-muted-foreground py-6">
          Built for thoughtful readers · Translations via MyMemory · Pronunciation via your
          browser's Web Speech API
        </footer>
      </main>
    </div>
  );
}
