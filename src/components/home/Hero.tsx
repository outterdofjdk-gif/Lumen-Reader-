import { ArrowRight, Sparkles } from "lucide-react";

type Props = {
  onStart?: () => void;
  onBrowse?: () => void;
};

export function Hero({ onStart, onBrowse }: Props) {
  return (
    <section className="relative overflow-hidden">
      {/* Subtle gradient mesh */}
      <div
        className="absolute inset-0 -z-10 opacity-70 dark:opacity-50"
        aria-hidden
        style={{
          background:
            "radial-gradient(60% 60% at 20% 10%, color-mix(in oklab, var(--color-primary) 14%, transparent), transparent 60%), radial-gradient(50% 50% at 90% 0%, color-mix(in oklab, var(--color-word-active) 10%, transparent), transparent 60%)",
        }}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 pt-12 sm:pt-20 lg:pt-28 pb-10 sm:pb-16 text-center">
        <div
          className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface/70 backdrop-blur px-3 py-1 text-xs text-muted-foreground mb-6 sm:mb-8 animate-fade-up"
          style={{ animationDelay: "0ms" }}
        >
          <Sparkles className="size-3.5 text-primary" />
          <span>Read English with quiet confidence</span>
        </div>

        <h1
          className="font-reading text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.05] text-foreground animate-fade-up"
          style={{ animationDelay: "80ms" }}
        >
          Every word,
          <span className="block italic font-normal text-foreground/80">
            a tap away from meaning.
          </span>
        </h1>

        <p
          className="mt-6 sm:mt-8 mx-auto max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed animate-fade-up"
          style={{ animationDelay: "160ms" }}
        >
          A calm reader for English articles, with instant Arabic translations and
          natural pronunciation. Designed for focus, made for curious minds.
        </p>

        <div
          className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-3 animate-fade-up"
          style={{ animationDelay: "240ms" }}
        >
          <button
            onClick={onStart}
            className="group inline-flex items-center gap-2 rounded-full bg-foreground text-background px-5 sm:px-6 h-11 text-sm font-medium shadow-elevated hover:scale-[1.02] active:scale-[0.98] transition-transform"
          >
            Start reading
            <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
          <button
            onClick={onBrowse}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 backdrop-blur text-foreground px-5 sm:px-6 h-11 text-sm font-medium hover:bg-surface-hover active:scale-[0.98] transition-all"
          >
            Browse articles
          </button>
        </div>
      </div>
    </section>
  );
}
