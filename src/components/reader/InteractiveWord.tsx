import { useState, useRef, useEffect } from "react";
import { translateWord } from "@/lib/reader-cache";
import { speak, type Accent } from "@/lib/tts";

type Props = {
  word: string;
  accent: Accent;
  rate: number;
  showTranslations: boolean;
  onSpoken?: (word: string) => void;
};

export function InteractiveWord({ word, accent, rate, showTranslations, onSpoken }: Props) {
  const [translation, setTranslation] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const hideTimer = useRef<number | null>(null);

  useEffect(() => () => {
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
  }, []);

  const handleClick = async () => {
    setSpeaking(true);
    speak(word, {
      accent,
      rate,
      onEnd: () => setSpeaking(false),
    });
    onSpoken?.(word);

    if (showTranslations) {
      setLoading(true);
      const t = await translateWord(word);
      setLoading(false);
      setTranslation(t);
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
      hideTimer.current = window.setTimeout(() => setTranslation(null), 1500);
    }
  };

  return (
    <span className="relative inline-block">
      <span
        className={`interactive-word ${speaking ? "speaking" : ""}`}
        onClick={handleClick}
      >
        {word}
      </span>
      {(translation || loading) && (
        <span
          className="absolute left-1/2 -translate-x-1/2 -top-9 z-20 px-2.5 py-1 rounded-md text-xs font-sans whitespace-nowrap bg-popover text-popover-foreground shadow-lg border border-border animate-in fade-in zoom-in-95"
          dir="rtl"
        >
          {loading ? "..." : translation}
          <span className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 rotate-45 bg-popover border-r border-b border-border" />
        </span>
      )}
    </span>
  );
}
