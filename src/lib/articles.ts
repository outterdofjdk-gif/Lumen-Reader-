export type FeedArticle = {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  image?: string;
  publishedAt: string;
  body?: string;
};

type DevToArticle = {
  id: number;
  title: string;
  description: string;
  url: string;
  cover_image: string | null;
  social_image: string | null;
  published_at: string;
  body_markdown?: string;
};

const FEED_KEY = "reader.feed.v1";
const FEED_TS_KEY = "reader.feed.ts.v1";
const ONE_DAY = 24 * 60 * 60 * 1000;

export async function fetchArticles(force = false): Promise<FeedArticle[]> {
  if (!force) {
    const ts = Number(localStorage.getItem(FEED_TS_KEY) || 0);
    const cached = localStorage.getItem(FEED_KEY);
    if (cached && Date.now() - ts < ONE_DAY) {
      try {
        return JSON.parse(cached) as FeedArticle[];
      } catch {
        /* refetch */
      }
    }
  }

  const res = await fetch(
    "https://dev.to/api/articles?per_page=12&top=7",
  );
  if (!res.ok) throw new Error("Failed to fetch articles");
  const raw = (await res.json()) as DevToArticle[];
  const articles: FeedArticle[] = raw.map((a) => ({
    id: String(a.id),
    title: a.title,
    description: a.description,
    url: a.url,
    source: "DEV Community",
    image: a.cover_image || a.social_image || undefined,
    publishedAt: a.published_at,
  }));
  localStorage.setItem(FEED_KEY, JSON.stringify(articles));
  localStorage.setItem(FEED_TS_KEY, String(Date.now()));
  return articles;
}

export async function fetchArticleBody(id: string): Promise<string> {
  const res = await fetch(`https://dev.to/api/articles/${id}`);
  if (!res.ok) throw new Error("Failed to load article");
  const data = (await res.json()) as DevToArticle;
  const md = data.body_markdown || data.description || "";
  // strip markdown / html for clean reading
  return md
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]*`/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/[#>*_~]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
