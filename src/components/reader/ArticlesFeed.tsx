import { useEffect, useState } from "react";
import { RefreshCw, ArrowUpRight, Loader2, Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Shimmer } from "@/components/ui/shimmer";
import { fetchArticles, fetchArticleBody, type FeedArticle } from "@/lib/articles";
import { sourceFor, CATEGORIES, type Category } from "@/lib/sources/registry";
import { toast } from "sonner";

type Props = {
  onLoad: (text: string, article: FeedArticle) => void;
  category?: Category;
  limit?: number;
  title?: string;
  subtitle?: string;
  variant?: "featured" | "grid" | "list";
};

export function ArticlesFeed({
  onLoad,
  category,
  limit,
  title = "Today's Reading",
  subtitle = "Fresh stories, picked for you",
  variant = "featured",
}: Props) {
  const [articles, setArticles] = useState<FeedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const load = async (force = false) => {
    setLoading(true);
    try {
      const a = await fetchArticles(force);
      setArticles(a);
    } catch {
      toast.error("Couldn't fetch articles. Try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(false);
  }, []);

  const handleRead = async (a: FeedArticle) => {
    setLoadingId(a.id);
    try {
      const body = await fetchArticleBody(a);
      onLoad(`${a.title}\n\n${body}`, a);
      toast.success("Article loaded");
    } catch {
      toast.error("Couldn't load article body.");
    } finally {
      setLoadingId(null);
    }
  };

  const filtered = category ? articles.filter((a) => a.category === category) : articles;
  const items = limit ? filtered.slice(0, limit) : filtered;
  const featured = variant === "featured" ? items[0] : undefined;
  const rest = featured ? items.slice(1) : items;

  return (
    <section className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-2">
            {title}
          </div>
          <h2 className="font-reading text-2xl sm:text-4xl font-semibold tracking-tight">
            {subtitle}
          </h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => load(true)}
          disabled={loading}
          className="rounded-full"
        >
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>

      {loading && articles.length === 0 ? (
        <div className="space-y-8">
          {variant === "featured" && <Shimmer className="h-72 sm:h-96 rounded-2xl" />}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Shimmer key={i} className="h-72 rounded-2xl" />
            ))}
          </div>
        </div>
      ) : items.length === 0 ? (
        <p className="text-muted-foreground text-sm py-12 text-center">
          No articles yet for this section. Try refreshing.
        </p>
      ) : (
        <>
          {featured && (
            <article
              onClick={() => handleRead(featured)}
              className="group relative grid md:grid-cols-2 gap-6 lg:gap-10 items-center cursor-pointer rounded-2xl overflow-hidden bg-surface border border-border-subtle hover:border-border transition-all duration-300 hover:shadow-elevated p-5 sm:p-8"
            >
              <div className="relative aspect-[5/4] sm:aspect-[4/3] rounded-xl overflow-hidden bg-muted">
                {featured.image ? (
                  <img
                    src={featured.image}
                    alt=""
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-accent via-tint to-muted" />
                )}
                <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-background/85 backdrop-blur-sm px-2.5 py-1 text-[11px] font-medium text-foreground">
                  Featured · {sourceFor(featured.source).name}
                </div>
              </div>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                  <span className="font-semibold text-foreground tracking-wide uppercase text-[10px]">
                    {sourceFor(featured.source).name}
                  </span>
                  <span className="size-1 rounded-full bg-muted-foreground/40" />
                  <span>{new Date(featured.publishedAt).toLocaleDateString()}</span>
                  <span className="size-1 rounded-full bg-muted-foreground/40" />
                  <span className="inline-flex items-center gap-1"><Clock className="size-3" />{featured.readingTime}m read</span>
                  <span className="size-1 rounded-full bg-muted-foreground/40" />
                  <span className="capitalize">{categoryLabel(featured.category)}</span>
                </div>
                <h3 className="font-reading text-2xl sm:text-3xl lg:text-4xl font-semibold leading-[1.15] tracking-tight group-hover:text-primary transition-colors">
                  {featured.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed line-clamp-3">
                  {featured.description}
                </p>
                <div className="pt-2 inline-flex items-center gap-2 text-sm font-medium text-foreground">
                  {loadingId === featured.id ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <ArrowUpRight className="size-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  )}
                  Read article
                </div>
              </div>
            </article>
          )}

          {variant === "list" ? (
            <ul className="divide-y divide-border-subtle border-y border-border-subtle">
              {rest.map((a) => (
                <li
                  key={a.id}
                  onClick={() => handleRead(a)}
                  className="group flex gap-4 py-4 cursor-pointer"
                >
                  {a.image && (
                    <div className="size-20 sm:size-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <img src={a.image} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">{sourceFor(a.source).name} · {a.readingTime}m</div>
                    <h3 className="font-reading text-base sm:text-lg font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">{a.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{a.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
              {rest.map((a, idx) => (
                <article
                  key={a.id}
                  onClick={() => handleRead(a)}
                  className="group cursor-pointer card-elevated overflow-hidden flex flex-col active:scale-[0.99]"
                  style={{ animation: `fade-up 500ms var(--ease-out-quart) both`, animationDelay: `${idx * 40}ms` }}
                >
                  <div className="aspect-[5/3] overflow-hidden bg-muted relative">
                    {a.image ? (
                      <img
                        src={a.image}
                        alt=""
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-700 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-accent to-tint" />
                    )}
                    <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-background/85 backdrop-blur-sm px-2 py-0.5 text-[10px] font-medium text-foreground capitalize">
                      {categoryLabel(a.category)}
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col p-5 gap-2.5">
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span className="font-semibold text-foreground/80 uppercase tracking-wider">
                        {sourceFor(a.source).name}
                      </span>
                      <span className="size-1 rounded-full bg-muted-foreground/40" />
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3" />
                        {a.readingTime}m
                      </span>
                    </div>
                    <h3 className="font-reading text-[19px] font-semibold leading-snug tracking-tight line-clamp-2 group-hover:text-primary transition-colors">
                      {a.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {a.description}
                    </p>
                    <div className="mt-auto pt-3 flex items-center justify-between">
                      <div className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground/70 group-hover:text-foreground transition-colors">
                        {loadingId === a.id ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <ArrowUpRight className="size-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        )}
                        Read
                      </div>
                      <a
                        href={a.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Original <ExternalLink className="size-3" />
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

function categoryLabel(c: Category): string {
  return CATEGORIES.find((x) => x.slug === c)?.label || c;
}
