import {
  Minus,
  Plus,
  RotateCcw,
  Sun,
  Moon,
  Languages,
  Gauge,
  Globe,
} from "lucide-react";
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

const BASE = 18;
const MIN = BASE * 0.8;
const MAX = BASE * 2;

export function ControlBar({
  fontSize,
  setFontSize,
  dark,
  setDark,
  accent,
  setAccent,
  rate,
  setRate,
  showTranslations,
  setShowTranslations,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-card border border-border shadow-sm">
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setFontSize(Math.max(MIN, fontSize / 1.2))}
          aria-label="Decrease font"
        >
          <Minus className="size-4" />
        </Button>
        <span className="text-xs font-mono w-10 text-center text-muted-foreground">
          {Math.round((fontSize / BASE) * 100)}%
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setFontSize(Math.min(MAX, fontSize * 1.2))}
          aria-label="Increase font"
        >
          <Plus className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setFontSize(BASE)}
          aria-label="Reset font"
        >
          <RotateCcw className="size-4" />
        </Button>
      </div>

      <div className="h-6 w-px bg-border mx-1" />

      <Toggle
        pressed={dark}
        onPressedChange={setDark}
        aria-label="Toggle dark mode"
        className="data-[state=on]:bg-accent"
      >
        {dark ? <Moon className="size-4" /> : <Sun className="size-4" />}
      </Toggle>

      <Toggle
        pressed={showTranslations}
        onPressedChange={setShowTranslations}
        aria-label="Toggle translations"
        className="data-[state=on]:bg-accent gap-1.5"
      >
        <Languages className="size-4" />
        <span className="text-xs hidden sm:inline">Translate</span>
      </Toggle>

      <div className="h-6 w-px bg-border mx-1" />

      <div className="flex items-center gap-1.5">
        <Globe className="size-4 text-muted-foreground" />
        <Select value={accent} onValueChange={(v) => setAccent(v as Accent)}>
          <SelectTrigger className="h-9 w-[110px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en-US">American</SelectItem>
            <SelectItem value="en-GB">British</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-1.5">
        <Gauge className="size-4 text-muted-foreground" />
        <Select value={String(rate)} onValueChange={(v) => setRate(Number(v))}>
          <SelectTrigger className="h-9 w-[100px]">
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
