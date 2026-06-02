import { createServerFn } from "@tanstack/react-start";
import { XMLParser } from "fast-xml-parser";

type Category =
  | "news" | "technology" | "science" | "business"
  | "history" | "culture" | "travel" | "stories" | "learning";

type Article = {
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

type Feed = { source: string; url: string; category: Category };

const FEEDS: Feed[] = [
  // BBC
  { source: "bbc", category: "news", url: "https://feeds.bbci.co.uk/news/world/rss.xml" },
  { source: "bbc", category: "technology", url: "https://feeds.bbci.co.uk/news/technology/rss.xml" },
  { source: "bbc", category: "science", url: "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml" },
  { source: "bbc", category: "business", url: "https://feeds.bbci.co.uk/news/business/rss.xml" },
  // NPR
  { source: "npr", category: "news", url: "https://feeds.npr.org/1001/rss.xml" },
  { source: "npr", category: "science", url: "https://feeds.npr.org/1007/rss.xml" },
  { source: "npr", category: "culture", url: "https://feeds.npr.org/1008/rss.xml" },
  // Guardian
  { source: "guardian", category: "news", url: "https://www.theguardian.com/world/rss" },
  { source: "guardian", category: "technology", url: "https://www.theguardian.com/technology/rss" },
  { source: "guardian", category: "science", url: "https://www.theguardian.com/science/rss" },
  { source: "guardian", category: "travel", url: "https://www.theguardian.com/travel/rss" },
  { source: "guardian", category: "culture", url: "https://www.theguardian.com/culture/rss" },
  { source: "guardian", category: "business", url: "https://www.theguardian.com/uk/business/rss" },
  // Smithsonian
  { source: "smithsonian", category: "history", url: "https://www.smithsonianmag.com/rss/history/" },
  { source: "smithsonian", category: "science", url: "https://www.smithsonianmag.com/rss/science-nature/" },
  { source: "smithsonian", category: "travel", url: "https://www.smithsonianmag.com/rss/travel/" },
  // Aeon (long-form stories)
  { source: "aeon", category: "stories", url: "https://aeon.co/feed.rss" },
  // VOA Learning English
  { source: "voa", category: "learning", url: "https://learningenglish.voanews.com/api/zq$omeqvi" },
  // BBC Learning English
  { source: "bbcle", category: "learning", url: "https://www.bbc.co.uk/learningenglish/english/news_archive/rss" },
];

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  parseAttributeValue: false,
});

function stripHtml(s: string): string {
  return (s || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function extractImage(item: any): string | undefined {
  const enc = item["enclosure"];
  if (enc?.["@_url"] && /image|jpg|jpeg|png|webp/i.test(enc["@_type"] || enc["@_url"])) {
    return enc["@_url"];
  }
  const media = item["media:content"] || item["media:thumbnail"];
  if (Array.isArray(media)) {
    for (const m of media) if (m?.["@_url"]) return m["@_url"];
  } else if (media?.["@_url"]) {
    return media["@_url"];
  }
  const content = item["content:encoded"] || item.description || "";
  const m = /<img[^>]+src=["']([^"']+)["']/i.exec(content);
  return m?.[1];
}

function readingTime(text: string): number {
  const words = (text || "").trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}

async function fetchFeed(feed: Feed): Promise<Article[]> {
  try {
    const res = await fetch(feed.url, {
      headers: { "User-Agent": "Mozilla/5.0 LumenReader/1.0" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const parsed = parser.parse(xml);
    const channel = parsed?.rss?.channel || parsed?.feed;
    if (!channel) return [];
    const items: any[] = []
      .concat(channel.item || [])
      .concat(channel.entry || []);
    return items.slice(0, 12).map((it, i) => {
      const title = stripHtml(typeof it.title === "string" ? it.title : it.title?.["#text"] || "");
      const linkRaw = it.link;
      const url =
        typeof linkRaw === "string"
          ? linkRaw
          : Array.isArray(linkRaw)
            ? linkRaw[0]?.["@_href"] || linkRaw[0]
            : linkRaw?.["@_href"] || linkRaw?.["#text"] || "";
      const desc = stripHtml(it.description || it.summary || it["content:encoded"] || "");
      const pubDate = it.pubDate || it.published || it.updated || new Date().toISOString();
      const author = stripHtml(
        typeof it.author === "string"
          ? it.author
          : it.author?.name || it["dc:creator"] || ""
      );
      const image = extractImage(it);
      return {
        id: `${feed.source}-${feed.category}-${i}-${url.slice(-32)}`,
        title,
        description: desc.slice(0, 280),
        url,
        source: feed.source,
        image,
        publishedAt: new Date(pubDate).toISOString(),
        category: feed.category,
        author: author || undefined,
        readingTime: readingTime(desc),
        body: desc,
      } satisfies Article;
    });
  } catch {
    return [];
  }
}

export const fetchAggregatedFeed = createServerFn({ method: "GET" }).handler(
  async (): Promise<Article[]> => {
    const all = await Promise.all(FEEDS.map(fetchFeed));
    const flat = all.flat();
    // Dedupe by URL
    const seen = new Set<string>();
    const deduped: Article[] = [];
    for (const a of flat) {
      const key = a.url.split("?")[0];
      if (!key || seen.has(key)) continue;
      if (a.title.length < 18) continue;
      seen.add(key);
      deduped.push(a);
    }
    // Sort by published date desc
    deduped.sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
    return deduped.slice(0, 80);
  },
);

export const fetchArticleContent = createServerFn({ method: "GET" })
  .inputValidator((data: { url: string }) => data)
  .handler(async ({ data }): Promise<{ text: string }> => {
    try {
      // Use r.jina.ai for clean text extraction
      const target = `https://r.jina.ai/${data.url}`;
      const res = await fetch(target, { signal: AbortSignal.timeout(15000) });
      if (!res.ok) return { text: "" };
      const text = await res.text();
      return { text: text.slice(0, 30000) };
    } catch {
      return { text: "" };
    }
  });
