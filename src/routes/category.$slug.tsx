import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef } from "react";
import { Toaster } from "@/components/ui/sonner";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { CategoryChips } from "@/components/home/CategoryChips";
import { ArticlesFeed } from "@/components/reader/ArticlesFeed";
import { ReadingProgress } from "@/components/reader/ReadingProgress";
import { ArticleReader } from "@/components/reader/ArticleReader";
import { ControlBar } from "@/components/reader/ControlBar";
import { useReaderSettings } from "@/hooks/useReaderSettings";
import { widthToPx } from "@/lib/settings";
import { CATEGORIES, type Category } from "@/lib/sources/registry";
import { pushHistory } from "@/lib/history";
import { useState } from "react";
import type { FeedArticle } from "@/lib/articles";
import type { Accent } from "@/lib/tts";

export const Route = createFileRoute("/category/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${labelFor(params.slug)} — Lumen Reader` },
      { name: "description", content: `Latest ${labelFor(params.slug).toLowerCase()} stories in English with instant Arabic translation.` },
    ],
  }),
  component: CategoryPage,
});

function labelFor(slug: string): string {
  return CATEGORIES.find((c) => c.slug === slug)?.label || "Category";
}

function CategoryPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const { settings, update } = useReaderSettings();
  const [text, setText] = useState("");
  const [article, setArticle] = useState<FeedArticle | null>(null);
  const readerRef = useRef<HTMLDivElement | null>(null);

  const valid = CATEGORIES.some((c) => c.slug === slug);
  if (!valid) {
    navigate({ to: "/" });
    return null;
  }

  const category = slug as Category;
  const label = labelFor(slug);
  const readingWidth = widthToPx(settings.width);

  const onLoad = (t: string, a: FeedArticle) => {
    setText(t);
    setArticle(a);
    pushHistory({
      id: a.id,
      title: a.title,
      source: a.source,
      url: a.url,
      category: a.category,
      image: a.image,
    });
    setTimeout(() => readerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster richColors position="top-center" />
      {settings.showProgressBar && <ReadingProgress targetRef={readerRef} />}
      <SiteHeader />

      <main>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-10 sm:pt-16 pb-6">
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-2">Category</div>
          <h1 className="font-reading text-3xl sm:text-5xl font-semibold tracking-tight">{label}</h1>
        </section>

        <CategoryChips active={category} />

        {text && (
          <section ref={readerRef} className="px-4 sm:px-6 lg:px-10 pt-10 pb-16 scroll-mt-20">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex justify-center">
                <ControlBar
                  fontSize={settings.fontSize}
                  setFontSize={(n) => update("fontSize", n)}
                  dark={false}
                  setDark={() => {}}
                  accent={settings.accentOrder[0] === "uk" ? "en-GB" : "en-US"}
                  setAccent={(a: Accent) => update("accentOrder", a === "en-GB" ? ["uk", "us"] : ["us", "uk"])}
                  rate={settings.rate}
                  setRate={(r) => update("rate", r)}
                  showTranslations={settings.showTranslations}
                  setShowTranslations={(b) => update("showTranslations", b)}
                />
              </div>
              <div className="rounded-3xl bg-reading-bg border border-border-subtle" style={{ boxShadow: "var(--shadow-elevated)" }}>
                <div className="mx-auto px-5 sm:px-10 md:px-16 lg:px-20 py-10 sm:py-16 lg:py-20" style={{ maxWidth: readingWidth + 200 }}>
                  <ArticleReader
                    text={text}
                    article={article}
                    fontSize={settings.fontSize}
                    accent={settings.accentOrder[0] === "uk" ? "en-GB" : "en-US"}
                    rate={settings.rate}
                    showTranslations={settings.showTranslations}
                    onSpoken={() => {}}
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-16">
          <ArticlesFeed
            onLoad={onLoad}
            category={category}
            title={label}
            subtitle={`Latest in ${label.toLowerCase()}`}
            variant="grid"
          />
        </section>
      </main>
    </div>
  );
}
