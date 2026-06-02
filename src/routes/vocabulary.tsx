import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Toaster } from "@/components/ui/sonner";
import { SavedWords } from "@/components/reader/SavedWords";

export const Route = createFileRoute("/vocabulary")({
  head: () => ({ meta: [{ title: "Vocabulary — Lumen Reader" }] }),
  component: VocabularyPage,
});

function VocabularyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster richColors position="top-center" />
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-16">
        <header className="mb-8">
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-2">Words you saved</div>
          <h1 className="font-reading text-3xl sm:text-5xl font-semibold tracking-tight">Vocabulary</h1>
          <p className="mt-3 text-muted-foreground">
            Double-tap any word while reading to add it here.{" "}
            <Link to="/" className="text-primary underline">Back to reading</Link>.
          </p>
        </header>
        <SavedWords />
      </main>
    </div>
  );
}
