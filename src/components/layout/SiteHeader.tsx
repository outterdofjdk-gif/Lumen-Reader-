import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { BookOpen, Moon, Sun, Bookmark, Settings, History, Library, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReaderSettings } from "@/hooks/useReaderSettings";
import { resolveTheme } from "@/lib/settings";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { settings, update, hydrated } = useReaderSettings();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isDark = hydrated ? resolveTheme(settings.theme) === "dark" : false;

  const navItems = [
    { to: "/", label: "Read", icon: BookOpen },
    { to: "/saved", label: "Saved", icon: Bookmark },
    { to: "/vocabulary", label: "Vocabulary", icon: Library },
    { to: "/history", label: "History", icon: History },
    { to: "/settings", label: "Settings", icon: Settings },
  ] as const;

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 backdrop-blur-xl ${
        scrolled
          ? "bg-background/75 border-b border-border-subtle"
          : "bg-background/40 border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 h-14 sm:h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="size-8 sm:size-9 rounded-xl bg-foreground text-background grid place-items-center shadow-card group-hover:scale-105 transition-transform duration-300">
            <BookOpen className="size-4 sm:size-[18px]" strokeWidth={2.2} />
          </div>
          <div className="leading-tight">
            <div className="font-reading font-semibold text-[17px] sm:text-lg tracking-tight">Lumen</div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground hidden sm:block">Reader</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1 text-sm">
          {navItems.slice(0, 4).map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="px-3 py-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors inline-flex items-center gap-1.5"
              activeProps={{ className: "px-3 py-1.5 rounded-full text-foreground bg-surface-hover inline-flex items-center gap-1.5" }}
            >
              <n.icon className="size-3.5" /> {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            aria-label="Toggle theme"
            onClick={() => update("theme", isDark ? "light" : "dark")}
          >
            {isDark ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
          </Button>
          <Link to="/settings" className="hidden md:inline-flex">
            <Button variant="ghost" size="icon" className="rounded-full" aria-label="Settings">
              <Settings className="size-[18px]" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full md:hidden"
            aria-label="Menu"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="size-[18px]" /> : <Menu className="size-[18px]" />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border-subtle bg-background/95 backdrop-blur-xl">
          <nav className="px-4 py-3 grid gap-1">
            {navItems.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="px-3 py-2.5 rounded-lg text-sm text-foreground hover:bg-surface-hover inline-flex items-center gap-2.5"
              >
                <n.icon className="size-4" /> {n.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
