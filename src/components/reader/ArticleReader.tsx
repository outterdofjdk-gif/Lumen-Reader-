import { useMemo } from "react";
import { InteractiveWord } from "./InteractiveWord";
import type { Accent } from "@/lib/tts";

type Props = {
  text: string;
  fontSize: number;
  accent: Accent;
  rate: number;
  showTranslations: boolean;
  onSpoken: (word: string) => void;
  onOpenPopup?: (word: string) => void;
};

export function ArticleReader({
  text,
  fontSize,
  accent,
  rate,
  showTranslations,
  onSpoken,
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
          Paste an article above, load the sample, or pick one from the feed to begin.
        </p>
      </div>
    );
  }

  // First non-empty paragraph treated as title if it's short and standalone.
  const maybeTitle = paragraphs[0]?.length < 120 && paragraphs.length > 1 ? paragraphs[0] : null;
  const bodyParagraphs = maybeTitle ? paragraphs.slice(1) : paragraphs;

  const words = text.trim().split(/\s+/).length;
  const readMin = Math.max(1, Math.round(words / 220));

  return (
    <article className="reading-prose" style={{ fontSize: `${fontSize}px` }}>
      {maybeTitle && (
        <header className="not-prose mb-8 sm:mb-12 text-center">
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-4">
            {readMin} min read · {words} words
          </div>
          <h1 className="font-reading text-3xl sm:text-5xl font-semibold tracking-tight leading-[1.15] text-foreground">
            {maybeTitle}
          </h1>
          <div className="mt-8 mx-auto w-12 h-px bg-border" />
        </header>
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
    </article>
  );
}
