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
};

export function ArticleReader({
  text,
  fontSize,
  accent,
  rate,
  showTranslations,
  onSpoken,
}: Props) {
  // tokenize while preserving punctuation/whitespace
  const tokens = useMemo(() => {
    return text.split(/(\s+)/).flatMap((chunk, i) => {
      if (/^\s+$/.test(chunk)) return [{ kind: "space" as const, value: chunk, key: `s${i}` }];
      // split a token into (leading punct)(word)(trailing punct)
      const m = chunk.match(/^([^A-Za-z0-9'’-]*)([A-Za-z][A-Za-z'’-]*)(.*)$/);
      if (!m) return [{ kind: "text" as const, value: chunk, key: `t${i}` }];
      const [, pre, word, post] = m;
      const parts: Array<
        | { kind: "text"; value: string; key: string }
        | { kind: "word"; value: string; key: string }
      > = [];
      if (pre) parts.push({ kind: "text", value: pre, key: `p${i}` });
      parts.push({ kind: "word", value: word, key: `w${i}` });
      if (post) parts.push({ kind: "text", value: post, key: `po${i}` });
      return parts;
    });
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
            />
          );
        }
        return <span key={tok.key}>{tok.value}</span>;
      })}
    </article>
  );
}
