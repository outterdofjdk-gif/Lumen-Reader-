import { useEffect, useRef, useState } from "react";
import { VolumeX } from "lucide-react";
import { lookupWord } from "@/lib/dictionary";
import { translateWord } from "@/lib/reader-cache";
import type { Accent } from "@/lib/tts";

type Props = {
  word: string;
  accent: Accent;
  rate: number;
  showTranslations: boolean;
  onSpoken?: (word: string) => void;
  // kept for compatibility with parent; not used anymore
  onOpenPopup?: (word: string) => void;
};

export function InteractiveWord({ word, showTranslations, onSpoken }: Props) {
  const [open, setOpen] = useState(false);
  const [translation, setTranslation] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [noAudio, setNoAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ref = useRef<HTMLSpanElement | null>(null);
  const timerRef = useRef<number | null>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const scheduleClose = () => {
    clearTimer();
    timerRef.current = window.setTimeout(() => setOpen(false), 2500);
  };

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  useEffect(() => () => clearTimer(), []);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(true);
    setLoading(true);
    onSpoken?.(word);

    const [entry, tr] = await Promise.all([
      lookupWord(word),
      showTranslations ? translateWord(word) : Promise.resolve(""),
    ]);

    setTranslation(tr || "—");
    setLoading(false);
    scheduleClose();

    // Play Cambridge-style audio from dictionary API (no TTS fallback)
    let audioUrl = entry?.audio || "";
    if (audioUrl.startsWith("//")) audioUrl = "https:" + audioUrl;
    if (audioUrl) {
      try {
        if (audioRef.current) {
          audioRef.current.pause();
        }
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        await audio.play().catch(() => {});
      } catch {
        /* ignore */
      }
    }
  };

  return (
    <span ref={ref} className="relative inline-block">
      <span
        className={`interactive-word ${open ? "speaking" : ""}`}
        onClick={handleClick}
      >
        {word}
      </span>
      {open && (
        <span
          role="tooltip"
          dir="rtl"
          className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 z-40 whitespace-nowrap rounded-md bg-foreground text-background text-xs font-medium px-2 py-1 shadow-md animate-in fade-in zoom-in-95"
          style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
        >
          {loading ? "…" : translation}
          <span
            className="absolute left-1/2 -translate-x-1/2 top-full size-0 border-x-4 border-x-transparent border-t-4 border-t-foreground"
          />
        </span>
      )}
    </span>
  );
}
