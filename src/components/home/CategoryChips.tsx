import { Link } from "@tanstack/react-router";
import { CATEGORIES } from "@/lib/sources/registry";

export function CategoryChips({ active }: { active?: string }) {
  return (
    <div className="sticky top-14 sm:top-16 z-30 -mx-4 sm:-mx-6 lg:-mx-10 px-4 sm:px-6 lg:px-10 py-3 bg-background/80 backdrop-blur-xl border-b border-border-subtle">
      <div className="max-w-7xl mx-auto flex gap-2 overflow-x-auto scrollbar-thin">
        <Link
          to="/"
          className={`shrink-0 inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-medium border transition-colors ${
            !active
              ? "bg-foreground text-background border-foreground"
              : "bg-surface text-muted-foreground border-border-subtle hover:text-foreground"
          }`}
        >
          All
        </Link>
        {CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            to="/category/$slug"
            params={{ slug: c.slug }}
            className={`shrink-0 inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-medium border transition-colors ${
              active === c.slug
                ? "bg-foreground text-background border-foreground"
                : "bg-surface text-muted-foreground border-border-subtle hover:text-foreground"
            }`}
          >
            {c.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
