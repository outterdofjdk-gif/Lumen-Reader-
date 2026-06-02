import { fetchAggregatedFeed, fetchArticleContent } from "./api/feeds.functions";
import type { Category } from "./sources/registry";

export type FeedArticle = {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  image?: string;
  publishedAt: string;
  category: Category;
  author?: string;
  readingTime: number;
  body?: string;
};

const FEED_KEY = "reader.feed.v2";
const FEED_TS_KEY = "reader.feed.ts.v2";
const SIX_HOURS = 6 * 60 * 60 * 1000;

export async function fetchArticles(force = false): Promise<FeedArticle[]> {
  if (!force && typeof window !== "undefined") {
    const ts = Number(localStorage.getItem(FEED_TS_KEY) || 0);
    const cached = localStorage.getItem(FEED_KEY);
    if (cached && Date.now() - ts < SIX_HOURS) {
      try {
        return JSON.parse(cached) as FeedArticle[];
      } catch {
        /* refetch */
      }
    }
  }
  const result = (await fetchAggregatedFeed()) as FeedArticle[];
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(FEED_KEY, JSON.stringify(result));
      localStorage.setItem(FEED_TS_KEY, String(Date.now()));
    } catch {
      /* quota */
    }
  }
  return result;
}

export async function fetchArticleBody(article: FeedArticle): Promise<string> {
  if (article.body && article.body.length > 600) return article.body;
  try {
    const res = await fetchArticleContent({ data: { url: article.url } });
    if (res.text && res.text.length > 200) return res.text;
  } catch {
    /* fall back */
  }
  return article.body || article.description || "";
}
