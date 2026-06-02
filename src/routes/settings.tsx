import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { useReaderSettings } from "@/hooks/useReaderSettings";
import { DEFAULT_SETTINGS } from "@/lib/settings";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Lumen Reader" },
      { name: "description", content: "Personalize your reading experience: theme, typography, translation, pronunciation." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { settings, update, replace, hydrated } = useReaderSettings();

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster richColors position="top-center" />
      <SiteHeader />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-16">
        <header className="mb-10">
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-2">Preferences</div>
          <h1 className="font-reading text-3xl sm:text-5xl font-semibold tracking-tight">Settings</h1>
          <p className="mt-3 text-muted-foreground">Fine-tune Lumen to match your reading rhythm.</p>
        </header>

        <div className="space-y-10">
          <Section title="Appearance">
            <Row label="Theme" description="Light, dark, or follow your system.">
              <Select value={settings.theme} onValueChange={(v) => update("theme", v as typeof settings.theme)}>
                <SelectTrigger className="w-40 rounded-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </Row>
          </Section>

          <Section title="Reading">
            <Row label="Font size" description={`${settings.fontSize}px`}>
              <div className="w-48">
                <Slider min={16} max={24} step={1} value={[settings.fontSize]} onValueChange={(v) => update("fontSize", v[0])} />
              </div>
            </Row>
            <Row label="Line height" description={settings.lineHeight.toFixed(2)}>
              <div className="w-48">
                <Slider min={1.5} max={2} step={0.05} value={[settings.lineHeight]} onValueChange={(v) => update("lineHeight", v[0])} />
              </div>
            </Row>
            <Row label="Reading width" description="Width of the text column.">
              <Select value={settings.width} onValueChange={(v) => update("width", v as typeof settings.width)}>
                <SelectTrigger className="w-40 rounded-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="narrow">Narrow</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="wide">Wide</SelectItem>
                </SelectContent>
              </Select>
            </Row>
            <Row label="Reading progress bar" description="Show the thin bar at the top of the page.">
              <Switch checked={settings.showProgressBar} onCheckedChange={(b) => update("showProgressBar", b)} />
            </Row>
          </Section>

          <Section title="Pronunciation">
            <Row label="Auto-pronounce on click" description="Play audio automatically when you tap a word.">
              <Switch checked={settings.autoPronounce} onCheckedChange={(b) => update("autoPronounce", b)} />
            </Row>
            <Row label="Accent priority" description="Preferred pronunciation when both UK and US are available.">
              <Select
                value={settings.accentOrder[0]}
                onValueChange={(v) => update("accentOrder", v === "uk" ? ["uk", "us"] : ["us", "uk"])}
              >
                <SelectTrigger className="w-40 rounded-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="uk">British (UK)</SelectItem>
                  <SelectItem value="us">American (US)</SelectItem>
                </SelectContent>
              </Select>
            </Row>
            <Row label="Playback speed" description={`${settings.rate}×`}>
              <Select value={String(settings.rate)} onValueChange={(v) => update("rate", Number(v))}>
                <SelectTrigger className="w-32 rounded-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.7">Slow</SelectItem>
                  <SelectItem value="1">Normal</SelectItem>
                  <SelectItem value="1.3">Fast</SelectItem>
                </SelectContent>
              </Select>
            </Row>
          </Section>

          <Section title="Translation">
            <Row label="Show Arabic translations" description="Tooltip with the Arabic meaning.">
              <Switch checked={settings.showTranslations} onCheckedChange={(b) => update("showTranslations", b)} />
            </Row>
            <Row label="Popup duration" description={`${(settings.popupDurationMs / 1000).toFixed(1)}s`}>
              <div className="w-48">
                <Slider min={1500} max={5000} step={100} value={[settings.popupDurationMs]} onValueChange={(v) => update("popupDurationMs", v[0])} />
              </div>
            </Row>
          </Section>

          <Section title="Content">
            <Row label="English level" description="Weight content towards your level (where supported).">
              <Select value={settings.englishLevel} onValueChange={(v) => update("englishLevel", v as typeof settings.englishLevel)}>
                <SelectTrigger className="w-40 rounded-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="a2">A2 (Elementary)</SelectItem>
                  <SelectItem value="b1">B1 (Intermediate)</SelectItem>
                  <SelectItem value="b2">B2 (Upper-intermediate)</SelectItem>
                </SelectContent>
              </Select>
            </Row>
          </Section>

          <div className="pt-4">
            <Button variant="outline" className="rounded-full" onClick={() => replace(DEFAULT_SETTINGS)}>
              Reset to defaults
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-reading text-xl font-semibold tracking-tight mb-4">{title}</h2>
      <div className="rounded-2xl bg-surface border border-border-subtle divide-y divide-border-subtle">{children}</div>
    </section>
  );
}

function Row({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      <div className="min-w-0">
        <div className="text-sm font-medium">{label}</div>
        {description && <div className="text-xs text-muted-foreground mt-0.5">{description}</div>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}
