export type Accent = "en-US" | "en-GB";

let voicesCache: SpeechSynthesisVoice[] = [];

function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const v = window.speechSynthesis.getVoices();
    if (v.length) {
      voicesCache = v;
      resolve(v);
      return;
    }
    const handler = () => {
      voicesCache = window.speechSynthesis.getVoices();
      window.speechSynthesis.removeEventListener("voiceschanged", handler);
      resolve(voicesCache);
    };
    window.speechSynthesis.addEventListener("voiceschanged", handler);
  });
}

export async function speak(
  text: string,
  opts: { accent?: Accent; rate?: number; onEnd?: () => void } = {},
) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const voices = voicesCache.length ? voicesCache : await loadVoices();
  const lang = opts.accent ?? "en-US";
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = opts.rate ?? 1;
  const match =
    voices.find((v) => v.lang === lang && /natural|google|premium/i.test(v.name)) ||
    voices.find((v) => v.lang === lang) ||
    voices.find((v) => v.lang.startsWith("en"));
  if (match) u.voice = match;
  u.onend = () => opts.onEnd?.();
  u.onerror = () => opts.onEnd?.();
  window.speechSynthesis.speak(u);
}
