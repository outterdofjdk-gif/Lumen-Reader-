import { useEffect, useState } from "react";
import { Bookmark, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCached, translateWord } from "@/lib/reader-cache";
import { toast } from "sonner";

const KEY = "reader.saved.v1";

export function getSavedWords(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveWord(w: string) {
  const lower = w.toLowerCase();
  const all = getSavedWords();
  if (!all.includes(lower)) {
    all.unshift(lower);
    localStorage.setItem(KEY, JSON.stringify(all.slice(0, 500)));
    window.dispatchEvent(new Event("reader:saved-changed"));
  }
}

export function SavedWords() {
  const [words, setWords] = useState<string[]>([]);
  const [translations, setTranslations] = useState<Record<string, string>>({});

  const refresh = async () => {
    const list = getSavedWords();
    setWords(list);
    const map: Record<string, string> = {};
    await Promise.all(
      list.slice(0, 30).map(async (w) => {
        map[w] = getCached(w) || (await translateWord(w));
      }),
    );
    setTranslations(map);
  };

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener("reader:saved-changed", handler);
    return () => window.removeEventListener("reader:saved-changed", handler);
  }, []);

  const remove = (w: string) => {
    const all = getSavedWords().filter((x) => x !== w);
    localStorage.setItem(KEY, JSON.stringify(all));
    setWords(all);
  };

  const clearAll = () => {
    localStorage.setItem(KEY, "[]");
    setWords([]);
    toast.success("Cleared saved words");
  };

  const exportCsv = () => {
    const rows = [["word", "translation"], ...words.map((w) => [w, translations[w] || ""])];
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "my-words.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="rounded-xl bg-card border border-border p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-reading text-lg font-semibold flex items-center gap-2">
          <Bookmark className="size-4 text-primary" /> My Words
          <span className="text-sm text-muted-foreground font-sans font-normal">
            ({words.length})
          </span>
        </h3>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={exportCsv}
            disabled={!words.length}
          >
            <Download className="size-4" /> CSV
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            disabled={!words.length}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
      {words.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">
          Tap any word twice while reading to save it here.
        </p>
      ) : (
        <ul className="max-h-72 overflow-y-auto divide-y divide-border -mx-1">
          {words.map((w) => (
            <li
              key={w}
              className="flex items-center justify-between gap-2 px-1 py-2"
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground">{w}</div>
                <div
                  className="text-xs text-muted-foreground truncate"
                  dir="rtl"
                >
                  {translations[w] || "…"}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => remove(w)}
                aria-label="Remove"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
