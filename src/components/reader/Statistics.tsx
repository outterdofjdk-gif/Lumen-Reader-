type Props = {
  text: string;
  spokenCount: number;
  uniqueSpoken: number;
};

export function Statistics({ text, spokenCount, uniqueSpoken }: Props) {
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;
  const minutes = Math.max(1, Math.round(words / 220));

  const items = [
    { label: "Words", value: words },
    { label: "Characters", value: chars },
    { label: "Read time", value: `${minutes} min` },
    { label: "Spoken", value: spokenCount },
    { label: "Unique", value: uniqueSpoken },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
      {items.map((i) => (
        <div
          key={i.label}
          className="rounded-lg bg-card border border-border px-3 py-2.5"
        >
          <div className="text-xs text-muted-foreground uppercase tracking-wide">
            {i.label}
          </div>
          <div className="text-lg font-semibold font-reading text-foreground">
            {i.value}
          </div>
        </div>
      ))}
    </div>
  );
}
