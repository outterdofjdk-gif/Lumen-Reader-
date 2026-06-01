import { useState } from "react";
import { speak, type Accent } from "@/lib/tts";

type Props = {
  word: string;
  accent: Accent;
  rate: number;
  showTranslations: boolean;
  onSpoken?: (word: string) => void;
  onOpenPopup: (word: string) => void;
};

export function InteractiveWord({ word, accent, rate, showTranslations, onSpoken, onOpenPopup }: Props) {
  const [speaking, setSpeaking] = useState(false);

  const handleClick = () => {
    setSpeaking(true);
    speak(word, {
      accent,
      rate,
      onEnd: () => setSpeaking(false),
    });
    onSpoken?.(word);
    if (showTranslations) onOpenPopup(word);
  };

  return (
    <span
      className={`interactive-word ${speaking ? "speaking" : ""}`}
      onClick={handleClick}
    >
      {word}
    </span>
  );
}
