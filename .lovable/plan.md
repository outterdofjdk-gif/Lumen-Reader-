# Premium Redesign Plan — Lumen Reader

A full visual + UX overhaul inspired by Medium, Substack, Kindle, Apple, and Notion. The **reading experience is the #1 priority** — typography, width, line-height, and spacing come first; animations are subtle accents, never decoration.

---

## 1. Design system (`src/styles.css`)

Rebuild the token layer:

- **Typography**: switch to a serif reading stack (`Source Serif 4` / `Newsreader`) for article body, `Inter Tight` for UI, `IBM Plex Sans Arabic` for Arabic translations. Load via Google Fonts.
- **Colors**: refined neutral palette (warm paper `oklch(0.985 0.004 85)` light / deep ink `oklch(0.16 0.012 250)` dark), single accent (`oklch(0.55 0.13 240)`). Adds `--surface`, `--surface-hover`, `--border-subtle`, `--reading-bg`.
- **Shadows**: layered premium shadows (`--shadow-card`, `--shadow-elevated`, `--shadow-popover`).
- **Animations**: new keyframes — `fade-up`, `tooltip-in`, `shimmer`, `progress`. Standard `--ease-out-quart` curve.
- **Spacing scale**: reading-specific tokens (`--reading-max: 760px`, `--reading-lh: 1.85`, `--reading-pp: 1.5em`).

## 2. Reading experience (highest priority)

Rewrite `ArticleReader.tsx` + new `ReadingShell.tsx`:

- Content column **760–820px**, centered, generous side padding on mobile.
- Serif body, `font-size: 19px` (desktop) / `17px` (mobile), `line-height: 1.85`, paragraph spacing `1.5em`.
- First paragraph drop-cap (subtle).
- Section dividers, blockquote styling, optimized hyphenation.
- **Sticky reading-progress bar** at top (1.5px accent line that fills with scroll).
- Estimated read time + word count chip above title.
- Smooth scroll, scroll-margin for headings.

## 3. Word interaction (preserve current behavior)

`InteractiveWord.tsx` polish only — keep Cambridge audio + Arabic-only tooltip rule the user already locked in:

- Tooltip: rounded `8px`, layered shadow, `tooltip-in` animation (fade + 4px rise), Arabic in IBM Plex Sans Arabic.
- Underline becomes a thin dotted accent that thickens on hover.
- Active word gets a soft highlight ring while audio plays.
- No modal, no popup, no IPA/examples — unchanged.

## 4. Homepage (`src/routes/index.tsx`)

Restructured into distinct sections:

- **Hero**: large editorial headline, supporting deck, primary CTA "Start reading", secondary "Browse articles". Subtle animated gradient mesh background.
- **Quick start strip**: paste / paste-from-clipboard / load sample — compact, not a giant card.
- **Featured article** (first feed item, large 2-col layout).
- **Trending grid** (rest of feed, refined cards).
- **Your saved words** preview (if any).
- Scroll-reveal animations (`fade-up` on intersection).

## 5. Article cards (`ArticlesFeed.tsx`)

- Larger image, 4:3 ratio, rounded `14px`, subtle gradient overlay.
- Source badge as pill, date as muted micro-copy.
- Title in serif, 2-line clamp, hover lifts card `-2px` with elevated shadow.
- Read button becomes full-width ghost-to-solid on hover.

## 6. Navigation

New `SiteHeader.tsx`:

- Sticky, blurred translucent (`backdrop-blur-xl bg-background/70`), hairline bottom border that appears on scroll.
- Logo + minimal nav (Read · Articles · Saved) + dark-mode toggle + search icon.
- Mobile: clean hamburger drawer with large tap targets.

## 7. Dark mode

Recalibrated tokens — deep blue-black background, high-contrast warm-white text, accent shifted to slightly brighter blue for AA contrast on dark.

## 8. Mobile polish

- Bottom safe-area padding.
- Active-state press feedback (`active:scale-[0.98]`) on cards/buttons.
- Larger tap targets (44px min) on interactive words on touch devices.
- Control bar collapses into a floating bottom sheet trigger on mobile.

## 9. Animation system

All via Tailwind + CSS keyframes (no new deps):

- Page mount: staggered `fade-up`.
- Card hover: shadow + translate.
- Buttons: subtle scale on press.
- Reading-progress bar: width transition.
- Tooltip: spring-feel zoom-in.
- Loading: shimmer skeletons replacing plain pulse.

---

## Files to change

**Edit**: `src/styles.css`, `src/routes/index.tsx`, `src/routes/__root.tsx`, `src/components/reader/ArticleReader.tsx`, `src/components/reader/ArticlesFeed.tsx`, `src/components/reader/InteractiveWord.tsx`, `src/components/reader/ControlBar.tsx`, `src/components/reader/InputPanel.tsx`, `src/components/reader/SavedWords.tsx`, `src/components/reader/Statistics.tsx`.

**New**: `src/components/layout/SiteHeader.tsx`, `src/components/reader/ReadingShell.tsx`, `src/components/reader/ReadingProgress.tsx`, `src/components/home/Hero.tsx`, `src/components/home/FeaturedArticle.tsx`, `src/components/ui/shimmer.tsx`.

**Delete**: `src/components/reader/WordPopup.tsx` (already unused).

## Out of scope (intentionally)

- No new functionality beyond what already exists (no auth, no backend, no new article sources).
- Word tooltip behavior locked per prior decisions (Arabic only, Cambridge audio only).
- No new animation libraries — Tailwind + CSS only to keep bundle lean.

## Verification

After implementation: load `/`, capture full-page screenshots at 1440×900 and 390×844 in light + dark, verify reading width, tooltip, audio, and scroll progress.

Approve to proceed, or tell me what to adjust.
