import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Toaster } from "@/components/ui/sonner";
import { getHistory, clearHistory, type HistoryEntry } from "@/lib/history";
import { sourceFor } from "@/lib/sources/registry";
import { Button } from "@/components/ui/button";
import { History as HistoryIcon, Trash2 } from "lucide-react";

export const Route = createFileRoute("/history")({
  head: () => ({ meta: [{ title: "Reading history — Lumen Reader" }] }),
  component: HistoryPage,
});

function HistoryPage() {
  const [list, setList] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setList(getHistory());
    const h = () => setList(getHistory());
    window.addEventListener("reader:history-changed", h);
    return () => window.removeEventListener("reader:history-changed", h);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster richColors position="top-center" />
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-16">
        <header className="mb-8 flex items-end justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-2">Recently read</div>
            <h1 className="font-reading text-3xl sm:text-5xl font-semibold tracking-tight inline-flex items-center gap-3">
              <HistoryIcon className="size-7 text-primary" /> History
            </h1>
          </div>
          {list.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => clearHistory()} className="rounded-full">
              <Trash2 className="size-4" /> Clear
            </Button>
          )}
        </header>

        {list.length === 0 ? (
          <p className="text-muted-foreground">
            Nothing read yet. <Link to="/" className="text-primary underline">Pick a story</Link> from the feed.
          </p>
        ) : (
          <ul className="divide-y divide-border-subtle border-y border-border-subtle">
            {list.map((h) => (
              <li key={h.id} className="flex gap-4 py-4">
                {h.image && (
                  <div className="size-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <img src={h.image} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
                    {sourceFor(h.source).name} · {new Date(h.openedAt).toLocaleDateString()}
                  </div>
                  <div className="font-reading text-base sm:text-lg font-semibold leading-snug line-clamp-2">{h.title}</div>
                  {h.url && (
                    <a href={h.url} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mt-1">
                      View original
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
