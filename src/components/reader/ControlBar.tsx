import { Minus, Plus, RotateCcw, Languages, Gauge, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import type { Accent } from "@/lib/tts";

type Props = {
  fontSize: number;
  setFontSize: (n: number) => void;
  dark: boolean;
  setDark: (b: boolean) => void;
  accent: Accent;
  setAccent: (a: Accent) => void;
  rate: number;
  setRate: (r: number) => void;
  showTranslations: boolean;
  setShowTranslations: (b: boolean) => void;
};

const BASE = 19;
const MIN = BASE * 0.8;
const MAX = BASE * 1.8;

export function ControlBar({
  fontSize,
  setFontSize,
  accent,
  setAccent,
  rate,
  setRate,
  showTranslations,
  setShowTranslations,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2 p-2 rounded-full bg-surface border border-border-subtle shadow-card">
      <div className="flex items-center gap-0.5 pl-1">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full size-8"
          onClick={() => setFontSize(Math.max(MIN, fontSize / 1.1))}
          aria-label="Decrease font"
        >
          <Minus className="size-3.5" />
        </Button>
        <span className="text-[11px] font-mono w-9 text-center text-muted-foreground tabular-nums">
          {Math.round((fontSize / BASE) * 100)}%
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full size-8"
          onClick={() => setFontSize(Math.min(MAX, fontSize * 1.1))}
          aria-label="Increase font"
        >
          <Plus className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full size-8"
          onClick={() => setFontSize(BASE)}
          aria-label="Reset font"
        >
          <RotateCcw className="size-3.5" />
        </Button>
      </div>

      <div className="h-5 w-px bg-border mx-0.5" />

      <Toggle
        pressed={showTranslations}
        onPressedChange={setShowTranslations}
        aria-label="Toggle translations"
        className="rounded-full h-8 px-3 gap-1.5 data-[state=on]:bg-accent text-xs"
      >
        <Languages className="size-3.5" />
        <span className="hidden sm:inline">Translate</span>
      </Toggle>

      <div className="h-5 w-px bg-border mx-0.5" />

      <div className="flex items-center gap-1.5 px-1">
        <Globe className="size-3.5 text-muted-foreground" />
        <Select value={accent} onValueChange={(v) => setAccent(v as Accent)}>
          <SelectTrigger className="h-8 w-[105px] rounded-full border-0 bg-transparent text-xs focus:ring-0 shadow-none px-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en-US">American</SelectItem>
            <SelectItem value="en-GB">British</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-1.5 px-1">
        <Gauge className="size-3.5 text-muted-foreground" />
        <Select value={String(rate)} onValueChange={(v) => setRate(Number(v))}>
          <SelectTrigger className="h-8 w-[88px] rounded-full border-0 bg-transparent text-xs focus:ring-0 shadow-none px-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0.7">Slow</SelectItem>
            <SelectItem value="1">Normal</SelectItem>
            <SelectItem value="1.3">Fast</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
