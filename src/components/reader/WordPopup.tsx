import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Volume2, Bookmark, Copy, Plus, ExternalLink, Check } from "lucide-react";
import { lookupWord, type DictEntry } from "@/lib/dictionary";
import { translateWord } from "@/lib/reader-cache";
import { speak, type Accent } from "@/lib/tts";
import { saveWord, getSavedWords } from "./SavedWords";
import { toast } from "sonner";

const VOCAB_KEY = "reader.vocab.v1";

type VocabItem = {
  word: string;
  phonetic?: string;
  partOfSpeech?: string;
  definition?: string;
  translation?: string;
  addedAt: number;
};

function addToVocabulary(item: VocabItem) {
  let list: VocabItem[] = [];
  try {
    list = JSON.parse(localStorage.getItem(VOCAB_KEY) || "[]");
  } catch {
    list = [];
  }
  if (list.some((v) => v.word.toLowerCase() === item.word.toLowerCase())) return false;
  list.unshift(item);
  localStorage.setItem(VOCAB_KEY, JSON.stringify(list.slice(0, 1000)));
  return true;
}

type Props = {
  word: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accent: Accent;
  rate: number;
};

export function WordPopup({ word, open, onOpenChange, accent, rate }: Props) {
  const [entry, setEntry] = useState<DictEntry | null>(null);
  const [translation, setTranslation] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [addedVocab, setAddedVocab] = useState(false);

  useEffect(() => {
    if (!open || !word) return;
    setEntry(null);
    setTranslation("");
    setCopied(false);
    setAddedVocab(false);
    setSaved(getSavedWords().includes(word.toLowerCase()));
    setLoading(true);
    Promise.all([lookupWord(word), translateWord(word)]).then(([e, t]) => {
      setEntry(e);
      setTranslation(t);
      setLoading(false);
    });
  }, [open, word]);

  const playAudio = () => {
    if (!word) return;
    if (entry?.audio) {
      const a = new Audio(entry.audio);
      a.play().catch(() => speak(word, { accent, rate }));
    } else {
      speak(word, { accent, rate });
    }
  };

  const firstDef = entry?.meanings[0]?.definitions[0]?.definition;

  const handleCopy = async () => {
    if (!firstDef) return;
    await navigator.clipboard.writeText(`${word}: ${firstDef}`);
    setCopied(true);
    toast.success("Definition copied");
    setTimeout(() => setCopied(false), 1500);
  };

  const handleSave = () => {
    if (!word) return;
    saveWord(word);
    setSaved(true);
    toast.success(`Saved "${word}"`);
  };

  const handleAddVocab = () => {
    if (!word) return;
    const ok = addToVocabulary({
      word,
      phonetic: entry?.phonetic,
      partOfSpeech: entry?.meanings[0]?.partOfSpeech,
      definition: firstDef,
      translation,
      addedAt: Date.now(),
    });
    setAddedVocab(true);
    toast.success(ok ? "Added to vocabulary" : "Already in vocabulary");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden bg-card">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border bg-gradient-to-b from-tint to-card">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <DialogTitle className="font-reading text-3xl sm:text-4xl font-semibold tracking-tight text-foreground break-words">
                {word}
              </DialogTitle>
              {(loading || entry?.phonetic) && (
                <div className="mt-2 flex items-center gap-3">
                  {loading ? (
                    <Skeleton className="h-5 w-24" />
                  ) : (
                    entry?.phonetic && (
                      <span className="font-mono text-base text-muted-foreground">
                        {entry.phonetic}
                      </span>
                    )
                  )}
                  <button
                    onClick={playAudio}
                    className="size-9 rounded-full bg-primary/10 hover:bg-primary/20 text-primary grid place-items-center transition-colors"
                    aria-label="Pronounce"
                  >
                    <Volume2 className="size-4" />
                  </button>
                </div>
              )}
              {translation && (
                <div
                  dir="rtl"
                  className="mt-3 text-lg text-primary font-medium"
                >
                  {translation}
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 max-h-[55vh] overflow-y-auto space-y-5">
          {loading && (
            <div className="space-y-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          )}

          {!loading && !entry && (
            <p className="text-sm text-muted-foreground italic text-center py-6">
              No dictionary entry found for "{word}".
            </p>
          )}

          {!loading &&
            entry?.meanings.map((m, i) => (
              <div key={i} className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-sans font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                    {m.partOfSpeech}
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <ol className="space-y-3 pl-1">
                  {m.definitions.map((d, j) => (
                    <li key={j} className="space-y-1.5">
                      <div className="flex gap-2.5 text-foreground leading-relaxed">
                        <span className="text-muted-foreground font-sans text-sm pt-0.5 select-none">
                          {j + 1}
                        </span>
                        <span className="font-reading">{d.definition}</span>
                      </div>
                      {d.example && (
                        <p className="ml-6 text-sm text-muted-foreground italic border-l-2 border-primary/30 pl-3">
                          "{d.example}"
                        </p>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            ))}

          {!loading && entry?.sourceUrl && (
            <a
              href={entry.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
            >
              Source <ExternalLink className="size-3" />
            </a>
          )}
        </div>

        <div className="px-4 py-3 border-t border-border bg-muted/30 grid grid-cols-3 gap-2">
          <Button
            variant={saved ? "default" : "outline"}
            size="sm"
            onClick={handleSave}
            disabled={saved}
            className="w-full"
          >
            {saved ? <Check className="size-4" /> : <Bookmark className="size-4" />}
            <span className="hidden sm:inline">{saved ? "Saved" : "Save"}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            disabled={!firstDef}
            className="w-full"
          >
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            <span className="hidden sm:inline">Copy</span>
          </Button>
          <Button
            variant={addedVocab ? "default" : "outline"}
            size="sm"
            onClick={handleAddVocab}
            disabled={addedVocab}
            className="w-full"
          >
            {addedVocab ? <Check className="size-4" /> : <Plus className="size-4" />}
            <span className="hidden sm:inline">Vocab</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
