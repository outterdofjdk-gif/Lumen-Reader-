import { useMemo } from "react";
import { ExternalLink, Clock, User } from "lucide-react";
import { KeyVocabulary } from "./KeyVocabulary";
import { InteractiveWord } from "./InteractiveWord";
import { sourceFor } from "@/lib/sources/registry";
import type { Accent } from "@/lib/tts";
import type { FeedArticle } from "@/lib/articles";

type Props = {
  text: string;
  fontSize: number;
  accent: Accent;
  rate: number;
  showTranslations: boolean;
  onSpoken: (word: string) => void;
  onOpenPopup?: (word: string) => void;
  article?: FeedArticle | null;
};

export function ArticleReader({
  text,
  fontSize,
  accent,
  rate,
  showTranslations,
  onSpoken,
  article,
}: Props) {
  type Token =
    | { kind: "text"; value: string; key: string }
    | { kind: "word"; value: string; key: string };

  const paragraphs = useMemo(() => {
    return text
      .replace(/\r\n/g, "\n")
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean);
  }, [text]);

  const tokenize = (chunk: string, pIdx: number): Token[] => {
    const out: Token[] = [];
    chunk.split(/(\s+)/).forEach((piece, i) => {
      if (!piece) return;
      if (/^\s+$/.test(piece)) {
        out.push({ kind: "text", value: piece, key: `s${pIdx}-${i}` });
        return;
      }
      const m = piece.match(/^([^A-Za-z0-9'’-]*)([A-Za-z][A-Za-z'’-]*)(.*)$/);
      if (!m) {
        out.push({ kind: "text", value: piece, key: `t${pIdx}-${i}` });
        return;
      }
      const [, pre, word, post] = m;
      if (pre) out.push({ kind: "text", value: pre, key: `p${pIdx}-${i}` });
      out.push({ kind: "word", value: word, key: `w${pIdx}-${i}` });
      if (post) out.push({ kind: "text", value: post, key: `po${pIdx}-${i}` });
    });
    return out;
  };

  if (!text.trim()) {
    return (
      <div className="text-muted-foreground text-center py-20 sm:py-28">
        <div className="font-reading italic text-xl mb-2 text-foreground/70">
          A quiet page, waiting.
        </div>
        <p className="text-sm">
          Pick a story from the feed, paste an article, or load a sample to begin.
        </p>
      </div>
    );
  }

  const maybeTitle = !article && paragraphs[0]?.length < 120 && paragraphs.length > 1 ? paragraphs[0] : null;
  const bodyParagraphs = article ? paragraphs : maybeTitle ? paragraphs.slice(1) : paragraphs;

  const words = text.trim().split(/\s+/).length;
  const readMin = Math.max(1, Math.round(words / 220));
  const src = article ? sourceFor(article.source) : null;

  return (
    <article className="reading-prose" style={{ fontSize: `${fontSize}px` }}>
      {article ? (
        <header className="not-prose mb-8 sm:mb-12">
          {article.image && (
            <div className="relative aspect-[16/9] sm:aspect-[2/1] mb-8 sm:mb-10 -mx-5 sm:-mx-10 md:-mx-16 lg:-mx-20 overflow-hidden rounded-xl">
              <img src={article.image} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent" />
            </div>
          )}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] uppercase tracking-[0.16em] text-muted-foreground mb-4">
            {src && (
              <span className="inline-flex items-center gap-1.5">
                {src.favicon && <img src={src.favicon} alt="" className="size-3.5 rounded-sm" />}
                <span className="font-semibold text-foreground/80">{src.name}</span>
              </span>
            )}
            <span className="size-1 rounded-full bg-muted-foreground/40" />
            <span>{new Date(article.publishedAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}</span>
            <span className="size-1 rounded-full bg-muted-foreground/40" />
            <span className="inline-flex items-center gap-1"><Clock className="size-3" />{article.readingTime || readMin} min read</span>
            <span className="size-1 rounded-full bg-muted-foreground/40" />
            <span>{words.toLocaleString()} words</span>
            {article.category && (
              <>
                <span className="size-1 rounded-full bg-muted-foreground/40" />
                <span className="capitalize">{article.category}</span>
              </>
            )}
          </div>
          <h1 className="font-reading text-3xl sm:text-5xl font-semibold tracking-tight leading-[1.1] text-foreground">
            {article.title}
          </h1>
          {article.author && (
            <div className="mt-5 inline-flex items-center gap-2 text-sm text-muted-foreground">
              <User className="size-3.5" /> {article.author}
            </div>
          )}
          {article.url && (
            <div className="mt-4">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                View original article <ExternalLink className="size-3" />
              </a>
            </div>
          )}
          <div className="mt-8 mx-auto w-12 h-px bg-border" />
        </header>
      ) : (
        maybeTitle && (
          <header className="not-prose mb-8 sm:mb-12 text-center">
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-4">
              {readMin} min read · {words} words
            </div>
            <h1 className="font-reading text-3xl sm:text-5xl font-semibold tracking-tight leading-[1.15] text-foreground">
              {maybeTitle}
            </h1>
            <div className="mt-8 mx-auto w-12 h-px bg-border" />
          </header>
        )
      )}

      {bodyParagraphs.map((p, idx) => (
        <p key={`p-${idx}`}>
          {tokenize(p, idx).map((tok) => {
            if (tok.kind === "word") {
              return (
                <InteractiveWord
                  key={tok.key}
                  word={tok.value}
                  accent={accent}
                  rate={rate}
                  showTranslations={showTranslations}
                  onSpoken={onSpoken}
                />
              );
            }
            return <span key={tok.key}>{tok.value}</span>;
          })}
        </p>
      ))}
      <KeyVocabulary text={text} />
    </article>
  );
}
