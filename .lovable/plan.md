# Lumen Reader — Premium Upgrade Plan

Your message has two parts that conflict near the end ("Do not redesign the application" appears in the pronunciation section, while the top half asks for a homepage/article redesign and a Settings page). I'm reading the final line as scoped to the pronunciation improvement only ("don't redesign *just to* improve pronunciation"), and treating the top half as the real product brief. Tell me if I should flip that.

I will **not** rebuild from scratch. All existing features stay: word tooltip (Arabic only + Cambridge-style audio), vocabulary saving, statistics, control bar, dev.to feed fallback.

---

## 1. Content sources (real articles, multi-source)

New `src/lib/sources/` module with one adapter per source, all returning the same `FeedArticle` shape (now extended with `category`, `author`, `readingTime`).

- **Guardian** — open JSON API (`content.guardianapis.com`), requires free API key. I'll wire it via a Lovable secret `GUARDIAN_API_KEY` and a server function so the key never ships to the browser.
- **NPR, BBC Learning English, VOA Learning English, Reuters/AP via Google News, Smithsonian, Nat Geo, Aeon, News in Levels** — RSS feeds fetched through a TanStack server function (`src/lib/api/feeds.functions.ts`) that parses XML server-side and returns normalized JSON. Avoids CORS and keeps the client lean.
- **British Council** — RSS where available, otherwise skipped gracefully.
- Aggregator merges all sources, dedupes by normalized title + URL hash, validates (title ≥ 20 chars, description present, image present for cards), sorts by published date.
- Cached in `localStorage` for 24 h (already the pattern) plus per-category caching. A "Refresh" button forces a re-fetch.

If the user later doesn't want to add a Guardian key, the system still works on the RSS-only sources.

## 2. Categories

Categories derived from source + RSS tags, normalized to: News, Technology, Science, Business, History, Culture, Travel, Stories, Learning English. Category page = filtered feed view.

Routes added:
- `/category/$slug` — category feed
- `/saved` — saved articles
- `/vocabulary` — saved words (moves the current SavedWords panel here)
- `/history` — reading history
- `/settings` — settings page

Homepage gets new strips: **Trending** (most recent across sources), **Latest**, **Recommended** (simple heuristic: categories you've opened most), **Continue reading** (from history).

## 3. Article layout polish

`ArticleReader.tsx` already has the serif reading shell. I'll add:
- Hero cover image at top (16:9, rounded, subtle gradient overlay)
- Header meta row: source logo (small favicon) · source name · author · published date · reading time · category pill
- "View original article" link → opens source URL in new tab with `rel="noopener noreferrer"`
- Slightly wider max-width tokens exposed in settings

## 4. Settings page (`/settings`)

Persisted in `localStorage` under `reader.settings.v1`, exposed via a `useReaderSettings()` hook so every component reacts live:
- Theme: Light / Dark / System
- Font size (slider 16–22 px)
- Reading width (narrow 640 / standard 760 / wide 880)
- Line height (1.6 / 1.75 / 1.9)
- Auto-pronunciation on click (on/off)
- Translation popup duration (1.5 / 2.5 / 4 s)
- Pronunciation accent preference order (drag list: UK, US, …)
- Article language filter (English level: any / A2 / B1 / B2 — used to weight Learning English sources)
- Reading progress bar on/off

Control bar stays but becomes a quick-access subset of these.

## 5. Pronunciation coverage (multi-source fallback)

`src/lib/dictionary.ts` extended (no UI change):
1. Cambridge UK → 2. Cambridge US (already via dictionaryapi.dev, which proxies Cambridge audio)
3. Merriam-Webster Learners API (needs free `MERRIAM_WEBSTER_API_KEY` secret — server function proxies it)
4. Free Dictionary / dictionaryapi.dev (already used)
5. Wiktionary REST audio (`en.wiktionary.org/api/rest_v1`) — free, no key
6. Google TTS *only as last resort if* user enables it in settings; **off by default** to honor your earlier "no browser TTS / no Google voice" rule. I'll leave a setting toggle so you decide.

For each clicked word:
- Try original form, then lemma candidates (existing logic)
- Walk source list in priority order until audio found
- Cache `{ word, audioUrl, source }` in `localStorage` (`reader.pron.cache.v1`) — future clicks are instant
- Console logs: `[pron] word | source: cambridge-uk | url: …` and `[pron] FAILED word (tried: cambridge, mw, wiktionary, …)`

Tooltip UI unchanged. Muted speaker icon still shown when *all* sources fail.

## 6. Homepage redesign (mobile-first)

Keeps current Hero but tightens it for 384 px viewport (your current preview). Below it:
- Horizontal scrollable category chips (sticky on scroll)
- "Continue reading" rail (if history exists)
- Featured article (full-bleed cover)
- Trending grid (1 col mobile, 2 col tablet, 3 col desktop)
- Latest list (compact rows with thumbnail)
- Saved words preview (existing component, restyled)

Smooth `fade-up` reveal already in styles.css — extended with stagger.

## 7. Source attribution

`src/lib/sources/registry.ts` maps each source id → `{ name, homepage, faviconUrl, color }`. Used in cards and article header.

## 8. Reading history

New `src/lib/history.ts` — appends `{ articleId, title, source, openedAt, scrollPercent }` on article open and on scroll. `/history` route renders the list with resume button.

---

## Technical details

- **Secrets needed** (I'll request them via `add_secret` after you approve): `GUARDIAN_API_KEY` (optional), `MERRIAM_WEBSTER_API_KEY` (optional). The app works without either — coverage just narrows.
- **Server functions** for RSS parsing and key-bearing APIs so nothing leaks to the browser and CORS is avoided.
- **No new heavy deps.** I'll add `fast-xml-parser` (tiny, edge-safe) for RSS.
- **Files added**: `src/lib/sources/{registry,guardian,rss,aggregator}.ts`, `src/lib/api/feeds.functions.ts`, `src/lib/api/pronunciation.functions.ts`, `src/lib/history.ts`, `src/lib/settings.ts`, `src/hooks/useReaderSettings.ts`, `src/routes/settings.tsx`, `src/routes/saved.tsx`, `src/routes/vocabulary.tsx`, `src/routes/history.tsx`, `src/routes/category.$slug.tsx`, `src/components/home/{CategoryChips,ContinueReading,TrendingRail,LatestList}.tsx`, `src/components/reader/ArticleHeader.tsx`.
- **Files edited**: `src/lib/dictionary.ts`, `src/lib/articles.ts`, `src/components/reader/{ArticleReader,ArticlesFeed,ControlBar,SavedWords,InteractiveWord}.tsx`, `src/components/layout/SiteHeader.tsx`, `src/routes/index.tsx`, `src/styles.css` (settings-driven CSS vars).
- **Preserved**: Cambridge-only audio default, Arabic-only tooltip behavior, current word-tooltip animation, vocabulary saving format.

---

## Open questions before I start

1. **Guardian + Merriam-Webster API keys** — want me to wire the integrations now and ask you for the keys, or skip them and ship with RSS-only sources + Wiktionary fallback?
2. **Google TTS last-resort** — keep it strictly off (current rule), or add it as an opt-in toggle in Settings?
3. **Scope confirmation** — confirm the redesign + Settings page is in scope (your message contained one contradictory line at the end).

Approve and I'll execute the whole plan in one pass. If you want to cut something (e.g. skip history, skip categories), tell me now.
