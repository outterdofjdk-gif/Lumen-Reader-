export type Category =
  | "news"
  | "technology"
  | "science"
  | "business"
  | "history"
  | "culture"
  | "travel"
  | "stories"
  | "learning";

export const CATEGORIES: { slug: Category; label: string }[] = [
  { slug: "news", label: "News" },
  { slug: "technology", label: "Technology" },
  { slug: "science", label: "Science" },
  { slug: "business", label: "Business" },
  { slug: "history", label: "History" },
  { slug: "culture", label: "Culture" },
  { slug: "travel", label: "Travel" },
  { slug: "stories", label: "Stories" },
  { slug: "learning", label: "Learning English" },
];

export type SourceInfo = {
  id: string;
  name: string;
  homepage: string;
  favicon: string;
};

export const SOURCES: Record<string, SourceInfo> = {
  bbc: { id: "bbc", name: "BBC News", homepage: "https://www.bbc.com/news", favicon: "https://www.google.com/s2/favicons?sz=64&domain=bbc.com" },
  npr: { id: "npr", name: "NPR", homepage: "https://www.npr.org", favicon: "https://www.google.com/s2/favicons?sz=64&domain=npr.org" },
  guardian: { id: "guardian", name: "The Guardian", homepage: "https://www.theguardian.com", favicon: "https://www.google.com/s2/favicons?sz=64&domain=theguardian.com" },
  smithsonian: { id: "smithsonian", name: "Smithsonian Magazine", homepage: "https://www.smithsonianmag.com", favicon: "https://www.google.com/s2/favicons?sz=64&domain=smithsonianmag.com" },
  aeon: { id: "aeon", name: "Aeon", homepage: "https://aeon.co", favicon: "https://www.google.com/s2/favicons?sz=64&domain=aeon.co" },
  voa: { id: "voa", name: "VOA Learning English", homepage: "https://learningenglish.voanews.com", favicon: "https://www.google.com/s2/favicons?sz=64&domain=voanews.com" },
  bbcle: { id: "bbcle", name: "BBC Learning English", homepage: "https://www.bbc.co.uk/learningenglish", favicon: "https://www.google.com/s2/favicons?sz=64&domain=bbc.co.uk" },
  natgeo: { id: "natgeo", name: "National Geographic", homepage: "https://www.nationalgeographic.com", favicon: "https://www.google.com/s2/favicons?sz=64&domain=nationalgeographic.com" },
  dev: { id: "dev", name: "DEV Community", homepage: "https://dev.to", favicon: "https://www.google.com/s2/favicons?sz=64&domain=dev.to" },
};

export function sourceFor(id: string): SourceInfo {
  return SOURCES[id] || { id, name: id, homepage: "#", favicon: "" };
}
