import { createFileRoute, Link } from "@tanstack/react-router";
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
import { CategoryChips } from "@/components/home/CategoryChips";
import { ReadingProgress } from "@/components/reader/ReadingProgress";
import { useReaderSettings } from "@/hooks/useReaderSettings";
import { pushHistory, getHistory } from "@/lib/history";
import { widthToPx } from "@/lib/settings";
import { sourceFor } from "@/lib/sources/registry";
import type { FeedArticle } from "@/lib/articles";
import type { Accent } from "@/lib/tts";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lumen Reader — A premium English reading platform" },
      {
        name: "description",
        content:
          "Read real stories from BBC, NPR, The Guardian, Smithsonian and more — with instant Arabic translation and natural pronunciation on every word.",
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

function Home() {
  const { settings, update } = useReaderSettings();
  const [text, setText] = useState("");
  const [article, setArticle] = useState<FeedArticle | null>(null);
  const [spokenWords, setSpokenWords] = useState<string[]>([]);
  const [continueReading, setContinueReading] = useState<ReturnType<typeof getHistory>>([]);

  const readerRef = useRef<HTMLDivElement | null>(null);
  const feedRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setContinueReading(getHistory().slice(0, 4));
    const onChange = () => setContinueReading(getHistory().slice(0, 4));
    window.addEventListener("reader:history-changed", onChange);
    return () => window.removeEventListener("reader:history-changed", onChange);
  }, []);

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

  const onLoadArticle = (t: string, a: FeedArticle) => {
    setText(t);
    setArticle(a);
    setSpokenWords([]);
    pushHistory({
      id: a.id,
      title: a.title,
      source: a.source,
      url: a.url,
      category: a.category,
      image: a.image,
    });
    setTimeout(() => scrollTo(readerRef.current), 50);
  };

  const readingWidth = widthToPx(settings.width);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster richColors position="top-center" />
      {settings.showProgressBar && <ReadingProgress targetRef={readerRef} />}

      <SiteHeader />

      <main>
        <Hero
          onStart={() => scrollTo(inputRef.current)}
          onBrowse={() => scrollTo(feedRef.current)}
        />

        <CategoryChips />

        {/* Continue reading */}
        {continueReading.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-8">
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-3">
              Continue reading
            </div>
            <div className="flex gap-3 overflow-x-auto scrollbar-thin pb-2">
              {continueReading.map((h) => (
                <Link
                  key={h.id}
                  to="/history"
                  className="shrink-0 w-64 rounded-xl bg-surface border border-border-subtle p-3 hover:border-border transition"
                >
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                    {sourceFor(h.source).name}
                  </div>
                  <div className="font-reading text-sm font-semibold leading-snug line-clamp-2">
                    {h.title}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Reader */}
        <section
          id="read"
          ref={readerRef}
          className="px-4 sm:px-6 lg:px-10 pb-20 pt-10 scroll-mt-20"
        >
          <div className="max-w-7xl mx-auto grid lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_320px] gap-8 lg:gap-12 items-start">
            <div className="min-w-0 space-y-6">
              <div className="flex justify-center">
                <ControlBar
                  fontSize={settings.fontSize}
                  setFontSize={(n) => update("fontSize", n)}
                  dark={false}
                  setDark={() => {}}
                  accent={settings.accentOrder[0] === "uk" ? "en-GB" : "en-US"}
                  setAccent={(a: Accent) =>
                    update("accentOrder", a === "en-GB" ? ["uk", "us"] : ["us", "uk"])
                  }
                  rate={settings.rate}
                  setRate={(r) => update("rate", r)}
                  showTranslations={settings.showTranslations}
                  setShowTranslations={(b) => update("showTranslations", b)}
                />
              </div>

              <div
                className="rounded-3xl bg-reading-bg border border-border-subtle"
                style={{ boxShadow: "var(--shadow-elevated)" }}
              >
                <div
                  className="mx-auto px-5 sm:px-10 md:px-16 lg:px-20 py-10 sm:py-16 lg:py-20"
                  style={{ maxWidth: readingWidth + 200 }}
                >
                  <ArticleReader
                    text={text}
                    article={article}
                    fontSize={settings.fontSize}
                    accent={settings.accentOrder[0] === "uk" ? "en-GB" : "en-US"}
                    rate={settings.rate}
                    showTranslations={settings.showTranslations}
                    onSpoken={handleSpoken}
                  />
                </div>
              </div>
            </div>

            <aside className="space-y-4 lg:sticky lg:top-24 scroll-mt-24">
              <Statistics
                text={text}
                spokenCount={spokenWords.length}
                uniqueSpoken={uniqueSpoken}
              />
              <SavedWords />
            </aside>
          </div>
        </section>

        {/* Input strip */}
        <section
          ref={inputRef}
          className="max-w-3xl mx-auto px-4 sm:px-6 mb-16 sm:mb-24 scroll-mt-24"
        >
          <div className="rounded-2xl bg-surface border border-border-subtle shadow-card p-4 sm:p-6 animate-fade-up">
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-3">
              Paste your own
            </div>
            <InputPanel text={text} setText={(t) => { setText(t); setArticle(null); }} />
          </div>
        </section>

        {/* Feed */}
        <section
          ref={feedRef}
          className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-10 py-16 sm:py-24 border-t border-border-subtle scroll-mt-20"
        >
          <ArticlesFeed onLoad={onLoadArticle} />
        </section>

        <footer className="border-t border-border-subtle">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <div className="font-reading text-foreground/70">
              Lumen Reader — designed for thoughtful readers.
            </div>
            <div>
              Stories from BBC · NPR · Guardian · Smithsonian · Aeon · Pronunciation by Cambridge
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
