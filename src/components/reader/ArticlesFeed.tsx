import { useEffect, useState } from "react";
import { RefreshCw, BookOpen, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchArticles, fetchArticleBody, type FeedArticle } from "@/lib/articles";
import { toast } from "sonner";

type Props = {
  onLoad: (text: string, title: string) => void;
};

export function ArticlesFeed({ onLoad }: Props) {
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
      const body = await fetchArticleBody(a.id);
      onLoad(`${a.title}\n\n${body}`, a.title);
      toast.success("Article loaded");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      toast.error("Couldn't load article body.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-reading font-semibold text-foreground">
            Recommended Articles
          </h2>
          <p className="text-sm text-muted-foreground">
            Fresh English reads, updated daily.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => load(true)} disabled={loading}>
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {loading && articles.length === 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-64 rounded-xl bg-muted animate-pulse border border-border"
            />
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((a) => (
            <article
              key={a.id}
              className="group flex flex-col rounded-xl overflow-hidden bg-card border border-border hover:border-primary/40 hover:shadow-md transition-all"
            >
              {a.image ? (
                <div className="aspect-[16/9] overflow-hidden bg-muted">
                  <img
                    src={a.image}
                    alt=""
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                  />
                </div>
              ) : (
                <div className="aspect-[16/9] bg-gradient-to-br from-accent to-tint" />
              )}
              <div className="flex-1 flex flex-col p-4 gap-2">
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <span className="font-medium text-primary">{a.source}</span>
                  <span>·</span>
                  <span>{new Date(a.publishedAt).toLocaleDateString()}</span>
                </div>
                <h3 className="font-reading text-lg font-semibold leading-snug line-clamp-2">
                  {a.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {a.description}
                </p>
                <div className="flex items-center gap-2 mt-auto pt-2">
                  <Button
                    size="sm"
                    onClick={() => handleRead(a)}
                    disabled={loadingId === a.id}
                    className="flex-1"
                  >
                    {loadingId === a.id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <BookOpen className="size-4" />
                    )}
                    Read
                  </Button>
                  <Button asChild variant="ghost" size="icon" aria-label="Open source">
                    <a href={a.url} target="_blank" rel="noreferrer">
                      <ExternalLink className="size-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
