import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/saved")({
  head: () => ({ meta: [{ title: "Saved articles — Lumen Reader" }] }),
  component: SavedPage,
});

function SavedPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster richColors position="top-center" />
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-16">
        <header className="mb-8">
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-2">Saved for later</div>
          <h1 className="font-reading text-3xl sm:text-5xl font-semibold tracking-tight">Saved articles</h1>
          <p className="mt-3 text-muted-foreground">
            Article bookmarking is coming soon. For now you can see what you've already read in your{" "}
            <Link to="/history" className="text-primary underline">history</Link>, or your saved words under{" "}
            <Link to="/vocabulary" className="text-primary underline">vocabulary</Link>.
          </p>
        </header>
      </main>
    </div>
  );
}
