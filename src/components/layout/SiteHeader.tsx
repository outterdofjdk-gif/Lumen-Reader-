import { useEffect, useState } from "react";
import { BookOpen, Moon, Sun, Bookmark, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  dark: boolean;
  setDark: (b: boolean) => void;
  onJumpToFeed?: () => void;
  onJumpToSaved?: () => void;
};

export function SiteHeader({ dark, setDark, onJumpToFeed, onJumpToSaved }: Props) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 backdrop-blur-xl ${
        scrolled
          ? "bg-background/75 border-b border-border-subtle shadow-[0_1px_0_0_color-mix(in_oklab,var(--color-foreground)_4%,transparent)]"
          : "bg-background/40 border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 h-14 sm:h-16 flex items-center justify-between gap-4">
        <a href="/" className="flex items-center gap-2.5 group">
          <div className="size-8 sm:size-9 rounded-xl bg-foreground text-background grid place-items-center shadow-card group-hover:scale-105 transition-transform duration-300">
            <BookOpen className="size-4 sm:size-[18px]" strokeWidth={2.2} />
          </div>
          <div className="leading-tight">
            <div className="font-reading font-semibold text-[17px] sm:text-lg tracking-tight">
              Lumen
            </div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground hidden sm:block">
              Reader
            </div>
          </div>
        </a>

        <nav className="hidden md:flex items-center gap-1 text-sm">
          <button
            onClick={onJumpToFeed}
            className="px-3 py-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors"
          >
            Articles
          </button>
          <button
            onClick={onJumpToSaved}
            className="px-3 py-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors inline-flex items-center gap-1.5"
          >
            <Bookmark className="size-3.5" /> Saved
          </button>
          <a
            href="#read"
            className="px-3 py-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors inline-flex items-center gap-1.5"
          >
            <Sparkles className="size-3.5" /> Reader
          </a>
        </nav>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            aria-label="Toggle theme"
            onClick={() => setDark(!dark)}
          >
            {dark ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
          </Button>
        </div>
      </div>
    </header>
  );
}
