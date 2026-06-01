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
  onOpenPopup: (word: string) => void;
};

export function ArticleReader({
  text,
  fontSize,
  accent,
  rate,
  showTranslations,
  onSpoken,
  onOpenPopup,
}: Props) {
  type Token =
    | { kind: "text"; value: string; key: string }
    | { kind: "word"; value: string; key: string };

  const tokens = useMemo<Token[]>(() => {
    const out: Token[] = [];
    text.split(/(\s+)/).forEach((chunk, i) => {
      if (!chunk) return;
      if (/^\s+$/.test(chunk)) {
        out.push({ kind: "text", value: chunk, key: `s${i}` });
        return;
      }
      const m = chunk.match(/^([^A-Za-z0-9'’-]*)([A-Za-z][A-Za-z'’-]*)(.*)$/);
      if (!m) {
        out.push({ kind: "text", value: chunk, key: `t${i}` });
        return;
      }
      const [, pre, word, post] = m;
      if (pre) out.push({ kind: "text", value: pre, key: `p${i}` });
      out.push({ kind: "word", value: word, key: `w${i}` });
      if (post) out.push({ kind: "text", value: post, key: `po${i}` });
    });
    return out;
  }, [text]);

  if (!text.trim()) {
    return (
      <div className="text-muted-foreground italic font-sans text-center py-16">
        Paste an article above, load the sample, or pick one from the feed to begin reading.
      </div>
    );
  }

  return (
    <article
      className="font-reading leading-relaxed text-foreground whitespace-pre-wrap"
      style={{ fontSize: `${fontSize}px`, lineHeight: 1.85 }}
    >
      {tokens.map((tok) => {
        if (tok.kind === "word") {
          return (
            <InteractiveWord
              key={tok.key}
              word={tok.value}
              accent={accent}
              rate={rate}
              showTranslations={showTranslations}
              onSpoken={onSpoken}
              onOpenPopup={onOpenPopup}
            />
          );
        }
        return <span key={tok.key}>{tok.value}</span>;
      })}
    </article>
  );
}
