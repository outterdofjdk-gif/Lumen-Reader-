import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Copy, Eraser, FileText, Link as LinkIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

const SAMPLE = `The Quiet Power of Curiosity

Curiosity is often described as the spark that ignites learning. When we encounter something unfamiliar, our minds naturally lean forward, eager to understand. Scientists have observed that curious people tend to remember new information more easily, perhaps because curiosity primes the brain to absorb details.

In daily life, cultivating curiosity can transform ordinary moments. A walk through a familiar neighborhood becomes an opportunity to notice the architecture, the rhythms of the street, the small businesses that quietly thrive. Conversations grow richer when we ask thoughtful questions and genuinely listen to the answers.

Yet curiosity requires courage. It asks us to admit what we do not know, to sit with uncertainty, and to follow ideas wherever they lead. In a world that often rewards quick answers, the patient curiosity of a careful mind remains a rare and remarkable strength.`;

type Props = {
  text: string;
  setText: (t: string) => void;
};

export function InputPanel({ text, setText }: Props) {
  const [url, setUrl] = useState("");
  const [loadingUrl, setLoadingUrl] = useState(false);

  const copy = async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    toast.success("Copied");
  };

  const loadFromUrl = async () => {
    if (!url.trim()) return;
    setLoadingUrl(true);
    try {
      const target = `https://r.jina.ai/${url.trim()}`;
      const res = await fetch(target);
      if (!res.ok) throw new Error();
      const content = await res.text();
      setText(content.slice(0, 20000));
      toast.success("Article fetched");
    } catch {
      toast.error("Couldn't fetch that URL");
    } finally {
      setLoadingUrl(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="url"
            placeholder="Paste an article URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="pl-10 h-11 rounded-full bg-surface border-border-subtle focus-visible:ring-1"
            onKeyDown={(e) => e.key === "Enter" && loadFromUrl()}
          />
        </div>
        <Button
          onClick={loadFromUrl}
          disabled={loadingUrl || !url}
          className="h-11 rounded-full px-5"
        >
          {loadingUrl ? <Loader2 className="size-4 animate-spin" /> : "Fetch"}
        </Button>
      </div>

      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Or paste your English article here…"
        className="min-h-[140px] text-base resize-y rounded-2xl bg-surface border-border-subtle"
      />

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setText(SAMPLE)}
          className="rounded-full border-border-subtle"
        >
          <FileText className="size-3.5" /> Load sample
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={copy}
          disabled={!text}
          className="rounded-full border-border-subtle"
        >
          <Copy className="size-3.5" /> Copy
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setText("")}
          disabled={!text}
          className="rounded-full"
        >
          <Eraser className="size-3.5" /> Clear
        </Button>
      </div>
    </div>
  );
}
