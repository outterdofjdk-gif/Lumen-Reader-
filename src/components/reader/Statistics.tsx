type Props = {
  text: string;
  spokenCount: number;
  uniqueSpoken: number;
};

export function Statistics({ text, spokenCount, uniqueSpoken }: Props) {
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const minutes = Math.max(1, Math.round(words / 220));

  const items = [
    { label: "Words", value: words.toLocaleString() },
    { label: "Read time", value: `${minutes}m` },
    { label: "Tapped", value: spokenCount },
    { label: "Unique", value: uniqueSpoken },
  ];

  return (
    <div className="rounded-2xl bg-surface border border-border-subtle p-4 shadow-card">
      <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground mb-3">
        Session
      </div>
      <div className="grid grid-cols-2 gap-3">
        {items.map((i) => (
          <div key={i.label} className="space-y-0.5">
            <div className="text-[11px] text-muted-foreground">{i.label}</div>
            <div className="text-xl font-reading font-semibold text-foreground tabular-nums">
              {i.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
