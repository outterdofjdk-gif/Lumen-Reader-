import { useEffect, useRef, useState } from "react";
import { VolumeX } from "lucide-react";
import { lookupWord } from "@/lib/dictionary";
import { translateWord } from "@/lib/reader-cache";
import { loadSettings } from "@/lib/settings";
import type { Accent } from "@/lib/tts";

type Props = {
  word: string;
  accent: Accent;
  rate: number;
  showTranslations: boolean;
  onSpoken?: (word: string) => void;
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
    const duration = loadSettings().popupDurationMs;
    timerRef.current = window.setTimeout(() => setOpen(false), duration);
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

    const settings = loadSettings();

    const [entry, tr] = await Promise.all([
      lookupWord(word),
      showTranslations ? translateWord(word) : Promise.resolve(""),
    ]);

    setTranslation(tr || "لا يوجد ترجمة متاحة");
    setLoading(false);
    scheduleClose();

    let audioUrl = entry?.audio || "";
    if (audioUrl.startsWith("//")) audioUrl = "https:" + audioUrl;

    const playSpeechSynthesis = () => {
      try {
        if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(word);
        u.lang = settings.accentOrder?.[0] === "us" ? "en-US" : "en-GB";
        u.rate = settings.rate || 1;
        window.speechSynthesis.speak(u);
        console.log("[pron]", word, "| source: speechSynthesis (fallback)");
        return true;
      } catch {
        return false;
      }
    };

    if (audioUrl && settings.autoPronounce) {
      setNoAudio(false);
      try {
        if (audioRef.current) audioRef.current.pause();
        const audio = new Audio(audioUrl);
        audio.playbackRate = settings.rate || 1;
        audioRef.current = audio;
        await audio.play().catch((err) => {
          console.warn("[pron] play failed, falling back to TTS", word, err);
          playSpeechSynthesis();
        });
      } catch (err) {
        console.warn("[pron] audio error", word, err);
        playSpeechSynthesis();
      }
    } else if (!audioUrl && settings.autoPronounce) {
      const ok = playSpeechSynthesis();
      setNoAudio(!ok);
    } else if (!audioUrl) {
      setNoAudio(true);
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
          className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-40 whitespace-nowrap rounded-lg bg-foreground text-background text-[13px] font-medium px-2.5 py-1.5 inline-flex items-center gap-1.5 font-arabic"
          style={{
            animation: "var(--animate-tooltip-in)",
            boxShadow: "var(--shadow-popover)",
          }}
        >
          <span>{loading ? "…" : translation}</span>
          {!loading && noAudio && (
            <VolumeX aria-label="No pronunciation available" className="size-3 opacity-60" />
          )}
          <span className="absolute left-1/2 -translate-x-1/2 top-full size-0 border-x-[5px] border-x-transparent border-t-[5px] border-t-foreground" />
        </span>
      )}
    </span>
  );
}
