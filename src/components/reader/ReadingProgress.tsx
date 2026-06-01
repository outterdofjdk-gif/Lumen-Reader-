import { useEffect, useState } from "react";

/**
 * Sticky 2px reading-progress bar pinned to the top of the viewport.
 * Animates smoothly as the user scrolls the article.
 */
export function ReadingProgress({ targetRef }: { targetRef?: React.RefObject<HTMLElement | null> }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handler = () => {
      const el = targetRef?.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const viewportH = window.innerHeight;
        const total = rect.height - viewportH;
        const scrolled = -rect.top;
        const p = total > 0 ? Math.min(1, Math.max(0, scrolled / total)) : 0;
        setProgress(p);
      } else {
        const doc = document.documentElement;
        const total = doc.scrollHeight - window.innerHeight;
        const p = total > 0 ? Math.min(1, Math.max(0, window.scrollY / total)) : 0;
        setProgress(p);
      }
    };
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("scroll", handler);
      window.removeEventListener("resize", handler);
    };
  }, [targetRef]);

  return (
    <div
      className="pointer-events-none fixed top-0 left-0 right-0 z-50 h-[2px] bg-transparent"
      aria-hidden
    >
      <div
        className="h-full bg-primary origin-left transition-[width] duration-150 ease-out"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  );
}
