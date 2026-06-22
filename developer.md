# Developer.md — Phase-by-Phase Agent Prompts & Testing

> Companion to `Guide.md`, `design.md`, `UI.md`. This file is **what you paste into the Antigravity chat**, one phase at a time. Each phase = one prompt block (give it to the agent, let it produce an Implementation Plan, approve, let it build, then run the testing block before moving on).
>
> **Rule: never paste more than one phase at a time.** Wait for the agent's Implementation Plan, review it against `design.md`/`UI.md`, approve, let it finish, run tests, confirm green, generate `SUMMARY.md`, THEN move to the next phase.

---

## Before Phase 1: One-time test infrastructure setup

Paste this first, once, before any feature work:

```
Set up the testing infrastructure for this project. We will use:
- Vitest + convex-test for testing Convex queries/mutations/actions
- Playwright Test for E2E browser testing against the built static app

Requirements:
1. Install: npm install -D vitest convex-test @edge-runtime/vm @playwright/test
2. Run: npx playwright install chromium
3. Create vitest.config.ts at repo root using Vitest 4's `projects` array
   to define TWO separate test projects:
   - "convex": environment "edge-runtime", testMatch "convex/**/*.test.ts"
   - (frontend unit tests can be added later as a third project if needed)
4. Create playwright.config.ts at repo root:
   - testDir: './testing/e2e'
   - webServer: command "npm run build && npx serve out -p 4173"
     (install `serve` as a dev dependency), url "http://localhost:4173",
     reuseExistingServer: !process.env.CI, timeout 120000
   - use.baseURL: "http://localhost:4173"
   - This MUST point at the static-exported /out build, NOT `next dev`,
     because we need to test the exact artifact Capacitor will ship.
5. Create a top-level directory called `testing/` with two subfolders:
   - testing/convex/   (mirrors convex/ function tests, OR co-locate
     *.test.ts files next to the functions they test inside convex/ —
     pick co-location, it's the convex-test convention; testing/convex/
     is for shared test helpers/fixtures only)
   - testing/e2e/      (Playwright spec files, one per UI phase)
6. Add to package.json scripts:
   "test:unit": "vitest run --project convex"
   "test:e2e": "playwright test"
   "test:all": "npm run test:unit && npm run test:e2e"
7. Create testing/README.md explaining this structure so it's
   self-documenting for future sessions.

After setup, run `npm run test:unit` and `npm run test:e2e` (even with
zero tests) to confirm both runners boot without config errors. Show me
the output.
```

---

## Phase 1 — Convex Schema & Core Data Model

### Prompt to paste
```
PHASE 1: Convex Schema

Read /docs/design.md and /docs/UI.md sections 2-3 (screen inventory) before
starting — the schema must support every screen listed there.

Create convex/schema.ts defining these tables:
- sources: { name, baseUrl, lang, type: "manga"|"anime", iconUrl, version,
  installed: boolean }
- manga: { sourceId: id("sources"), externalId: string, title, coverUrl,
  synopsis, status, genres: string[], anilistId: optional(string) }
- chapters: { mangaId: id("manga"), number, title, externalUrl, uploadDate,
  scanlator: optional(string) }
- episodes: { mangaId: id("manga"), number, title, externalUrl, uploadDate,
  duration: optional(number) }
- categories: { name, order: number }
- library: { mangaId: id("manga"), categoryIds: id("categories")[],
  addedAt }
- readingProgress: { mangaId: id("manga"), chapterId: optional(id("chapters")),
  episodeId: optional(id("episodes")), position: number /* page or seconds */,
  completed: boolean, lastReadAt }
- downloads: { mangaId: id("manga"), chapterId: optional(id("chapters")),
  episodeId: optional(id("episodes")), storageId: id("_storage"), status }

Add appropriate indexes (e.g. manga by sourceId, chapters by mangaId,
library by mangaId) — use the Convex MCP server to confirm correct index
syntax against the current schema builder API, don't guess from memory.

Give me your Implementation Plan before writing any code.
```

### Testing prompt (paste after the agent implements the plan)
```
Create convex/schema.test.ts using convex-test:
- import { convexTest } from "convex-test"; import schema from "./schema";
- Test 1: schema loads without throwing (convexTest(schema) succeeds)
- Test 2: insert one document into EACH table via t.run(ctx => ctx.db.insert(...))
  using minimal valid fields, and assert it returns an id
- Test 3: insert a manga + a chapter referencing it, then query chapters
  by mangaId index and assert the chapter is returned

Save this file at convex/schema.test.ts (co-located, per convex-test
convention). Run `npm run test:unit` and show me the output. All tests
must pass before we move to Phase 2. If anything fails, fix it and re-run
— do not move on with red tests.

Also create testing/e2e/phase1-placeholder.spec.ts with a single trivial
test (`expect(true).toBe(true)`) as a placeholder — real E2E tests start
in Phase 4 once there's a UI to click. Run `npm run test:e2e` to confirm
the runner works end-to-end against the (currently nearly-empty) static
build.
```

---

## Phase 2 — Source Extension Interface + First Real Source

### Prompt to paste
```
PHASE 2: Source Extension Interface + First Manga Source

Create convex/sources/types.ts with this interface (adjust types to match
our actual schema from Phase 1, keep the shape):

  interface MangaSource {
    id: string;
    name: string;
    baseUrl: string;
    lang: string;
    getPopular(page: number): Promise<MangaEntry[]>;
    getLatest(page: number): Promise<MangaEntry[]>;
    search(query: string): Promise<MangaEntry[]>;
    getDetails(externalId: string): Promise<MangaDetails>;
    getChapterList(externalId: string): Promise<ChapterEntry[]>;
  }

Then implement ONE real source as a Convex action
(convex/sources/exampleSource.ts) using Cheerio against a single
real, static-HTML manga site of your choosing that has a permissive
robots.txt for its listing pages (check robots.txt yourself before
implementing — tell me which site and what robots.txt says before
writing scraping code).

Remember (from AGENTS.md): all outbound fetch calls go in a Convex
Action ("use node"), never in a query or mutation.

Give me your Implementation Plan first, including which site you intend
to use and the robots.txt check result.
```

### Testing prompt
```
Create convex/sources/exampleSource.test.ts:
- Since this action makes real network calls, write tests in two tiers:
  1. UNIT (mocked): test the HTML-parsing logic in isolation by saving
     one real sample HTML response as a fixture file
     (testing/fixtures/exampleSource-popular.html), and testing that
     parsePopularPage(html) extracts the expected titles/covers/ids
     correctly. This is the test that runs in CI and must never hit
     the network.
  2. INTEGRATION (real network, manual-run only): a separate test file
     convex/sources/exampleSource.integration.test.ts, NOT included in
     the default test:unit script, runnable manually via
     `npx vitest run convex/sources/exampleSource.integration.test.ts`,
     that actually calls the live action once and sanity-checks the
     response shape. Document this distinction in testing/README.md.

Run `npm run test:unit` (should only run the fixture-based test) and
show me the output, then run the integration test manually once and
show me that output too.
```

---

## Phase 3 — AniList Metadata Integration

### Prompt to paste
```
PHASE 3: AniList Metadata

Create convex/anilist.ts as a Convex action that queries the AniList
GraphQL API (https://graphql.anilist.co) for:
1. searchByTitle(title: string) — returns top matches with id, title,
   coverImage, description, genres, status
2. getById(anilistId: number) — full details for one entry

Use Context7 (or equivalent docs MCP) to confirm the current AniList
GraphQL schema field names before writing the query — their schema does
change, don't rely on memory.

Add a mutation linkMangaToAnilist(mangaId, anilistId) that stores the
anilistId on our manga document from Phase 1, and a mutation that syncs
title/cover/synopsis/genres FROM AniList into our manga doc if those
fields are empty (don't overwrite source-provided data, just fill gaps).

Implementation Plan first.
```

### Testing prompt
```
Create convex/anilist.test.ts:
- Mock the AniList fetch call (don't hit the real API in unit tests) using
  a saved fixture JSON response (testing/fixtures/anilist-search-sample.json)
- Test searchByTitle parses the fixture correctly
- Test linkMangaToAnilist mutation updates the manga doc's anilistId field
  (use convexTest + t.run to seed a manga doc, call the mutation, then
  query and assert)

Run `npm run test:unit`, all green before continuing.
```

---

## Phase 4 — Library Screen + Title Detail Screen

> First real UI phase. Re-read `/docs/design.md` §5.1 (cover card) and
> `/docs/UI.md` §3.2 + §3.6 before prompting.

### Prompt to paste
```
PHASE 4: Library Screen + Title Detail Screen

Build per /docs/UI.md sections 3.2 and 3.6, and /docs/design.md section 5.1
and 5.4 for visual spec.

1. app/library/page.tsx — grid of cover cards (Convex query: list library
   entries with their manga docs), 3-column mobile grid per design.md §4,
   tap navigates to /title/[mangaId]
2. app/title/[mangaId]/page.tsx — header with cover/synopsis/genres,
   "Add to Library" button (Convex mutation), chapter list below
3. A reusable CoverCard component matching design.md §5.1 exactly
   (gradient scrim, badge overlays, rounded corners)
4. Remember: no next/image, no server actions — plain <img>, client
   components calling Convex hooks (useQuery/useMutation)

Seed data: create convex/seed.ts with a mutation that inserts 3-5 sample
manga docs (with placeholder cover URLs) so we have something to render
and test against. Do NOT hardcode this data inside React components.

Implementation Plan first.
```

### Testing prompt
```
Create testing/e2e/library.spec.ts using Playwright:
- Before the test suite, run the seed mutation (via a Convex HTTP action
  or a setup script — ask me which approach if unclear, don't guess)
- Test 1: navigating to /library shows at least one cover card
- Test 2: clicking a cover card navigates to /title/[id] and the title
  text matches what was clicked (per UI.md §5 rule 1: tapping a cover
  always goes to Title Detail)
- Test 3: on Title Detail, clicking "Add to Library" updates the button
  text/state (per UI.md §3.6) — assert via page.locator, not arbitrary
  waits
- Use data-testid attributes on key elements (cover-card, add-to-library-
  button) rather than relying on text content alone, so tests don't break
  on copy changes

Save to testing/e2e/library.spec.ts. Run `npm run test:e2e` and show me
the output — all tests must pass. If a selector is flaky, fix the
selector strategy (data-testid) rather than adding arbitrary sleep/wait
calls.

Also use the /browser tool yourself right now to visually click through
this flow and confirm it matches design.md's cover card spec (gradient
scrim, badge position, rounded corners) — screenshot what you see.
```

---

## Phase 5 — Browse → Sources → Catalog Flow

### Prompt to paste
```
PHASE 5: Browse Screen + Source Catalog

Per /docs/UI.md section 3.5.

1. app/browse/page.tsx — Sources tab (list installed sources from Phase 2's
   sources table) and Extensions tab placeholder (full install/uninstall
   flow can be a later phase — for now just list what's "installed" in
   the DB)
2. app/browse/[sourceId]/page.tsx — Popular/Latest sub-tabs, infinite
   scroll or "Load more" calling the source's getPopular/getLatest via a
   Convex action, grid of results using the same CoverCard component
   from Phase 4 (don't duplicate it)
3. Tapping a result from Browse should either link to an existing
   Title Detail page (if already imported) or trigger an import-then-
   navigate flow — ask me which UX you should use here if UI.md doesn't
   make it unambiguous, don't assume silently

Implementation Plan first.
```

### Testing prompt
```
Create testing/e2e/browse.spec.ts:
- Test 1: /browse shows the seeded source(s) from Phase 2
- Test 2: clicking a source navigates to its catalog page and shows
  results (mock the source action's network call at the Convex level if
  it would otherwise hit a real site during CI — ask me if you're unsure
  how to stub a Convex action result for E2E purposes)
- Test 3: Popular/Latest tab switch changes the displayed result set

Run `npm run test:e2e`, confirm green, then use /browser to visually spot
check against design.md's grid spec before moving on.
```

---

## Phase 6 — Manga Reader (Paged + Webtoon modes)

### Prompt to paste
```
PHASE 6: Manga Reader

Per /docs/UI.md section 3.7 and /docs/design.md section 5.4. This is the
highest-interaction-complexity screen so far — build it carefully.

1. app/read/[chapterId]/page.tsx — full-screen, chrome hidden by default
2. Tap-center toggles top/bottom translucent bars (per design.md §5.4)
3. Implement BOTH viewer modes per UI.md §3.7: paged (tap left/right zones)
   and webtoon (continuous vertical scroll) — make this a per-series
   setting stored against the manga doc, defaulting to paged
4. Settings gear opens an INLINE panel (not a route change — per AGENTS.md
   workflow rule and UI.md §5 rule 4) for viewer mode + background color
5. Chapter transition at the end → auto-advance or manual "Next Chapter"

Note: since chapters in our schema (Phase 1) only have an externalUrl
right now, not actual page image URLs, you'll need a getPageList action
on the source interface (extend types.ts from Phase 2) that fetches the
actual image URLs for a given chapter from the source site.

Implementation Plan first — I want to see how you're handling image
loading/lazy-load before you build it.
```

### Testing prompt
```
Create testing/e2e/reader.spec.ts:
- Test 1: opening a chapter shows page images (assert at least one <img>
  with a valid src is visible)
- Test 2: chrome is hidden by default (top/bottom bars not visible on load)
- Test 3: tapping center toggles the bars visible, then hides again after
  the configured timeout — use Playwright's clock mocking
  (page.clock.install / fast-forward) instead of real sleeps, per
  current Playwright best practice, so this test isn't slow or flaky
- Test 4: switching viewer mode in the inline settings panel changes the
  reader layout without a URL/route change (assert page.url() is
  unchanged before/after)

Run `npm run test:e2e`. This screen is complex enough that I want you to
also manually verify with /browser and describe what you see at each
step before declaring this phase done.
```

---

## Phase 7 — Updates + History Screens

### Prompt to paste
```
PHASE 7: Updates + History Screens

Per /docs/UI.md sections 3.3 and 3.4.

1. app/updates/page.tsx — feed of new chapters/episodes for library
   titles, grouped by date, per UI.md's "tap cover vs tap row" distinction
   (§5 rule 1): tapping the row text opens the Reader directly, tapping
   the cover thumbnail opens Title Detail
2. app/history/page.tsx — recently read, grouped by date, tap row
   resumes Reader/Player at last saved position (use the
   readingProgress table from Phase 1)
3. Both need their own Convex queries with appropriate date-range/sort
   logic — add indexes if Phase 1's schema is missing what's needed
   (check via Convex MCP, then tell me what you're adding and why)

Implementation Plan first.
```

### Testing prompt
```
Create testing/e2e/updates-history.spec.ts:
- Test 1: Updates feed shows seeded chapter entries grouped under date
  headers
- Test 2: clicking row TEXT opens Reader; clicking the COVER THUMBNAIL
  on the same row opens Title Detail instead — this is the trickiest
  interaction distinction in the whole app, test it precisely with two
  separate locators, not one
- Test 3: History shows entries after simulating a reading session
  (call the relevant Convex mutation directly in test setup via Convex
  client, then verify it appears)
- Test 4: clicking a History row resumes at the correct saved position
  (assert via whatever DOM state reflects current page/timestamp)

Run `npm run test:e2e`, all green, then move on.
```

---

## Phase 8 — Settings / More Screen

### Prompt to paste
```
PHASE 8: Settings / More

Per /docs/UI.md section 3.9. Start minimal — only build these sub-sections
for now, the rest can be stub links that say "Coming soon":
- Appearance (theme: dark/light/system toggle, accent color picker from
  design.md §2.1's preset list)
- Library (categories management — basic CRUD against the categories
  table from Phase 1)
- Reader (default viewer mode — wire this to actually affect Phase 6's
  reader default)

Theme switching must use CSS custom properties / Tailwind's dark mode
class strategy, respecting prefers-color-scheme for "system" per
design.md §8.

Implementation Plan first.
```

### Testing prompt
```
Create testing/e2e/settings.spec.ts:
- Test 1: toggling dark/light theme changes a visible CSS property
  (e.g. assert document background color or the presence of a `dark`
  class on <html>)
- Test 2: creating a new category in settings makes it appear as a tab
  in the Library screen (cross-screen integration check — navigate to
  /library after creating the category and assert the new tab exists)
- Test 3: changing default reader viewer mode in Settings, then opening
  a chapter via Phase 6's Reader, confirms the new default is applied

Run `npm run test:e2e`. Confirm green.
```

---

## Phase 9 — Anime Source (Playwright-based) + Player

> Highest complexity AND highest legal-exposure phase. Do not skip the
> AGENTS.md "Legal/Scope Boundary" review before starting.

### Prompt to paste
```
PHASE 9: Anime Source + Player

Before writing any code: tell me which site you intend to use as the
example anime source, confirm its robots.txt status, and flag explicitly
whether this is for personal/self-hosted use only per AGENTS.md's
Legal/Scope Boundary section — wait for my confirmation before proceeding.

Once confirmed:
1. Extend the source interface (Phase 2) with an AnimeSource variant:
   getEpisodeList, getStreamUrl(episodeExternalId) — implement
   getStreamUrl using Playwright (per our earlier crawler work) since
   this needs real browser rendering + network-tab capture to find the
   actual .m3u8/video URL, not Cheerio
2. app/watch/[episodeId]/page.tsx — player using hls.js or video.js per
   Guide.md's stack decision, full-screen chrome-minimal per
   /docs/UI.md section 3.8 and design.md section 5.5
3. Implement the gesture zones (brightness/volume/seek) and auto-hide
   controls per UI.md §3.8

Implementation Plan first, and remind me of the legal flag above before
any scraping code is written.
```

### Testing prompt
```
Create testing/e2e/player.spec.ts:
- Mock the stream URL resolution at the Convex action level for CI
  (don't run a real Playwright-in-Playwright scrape during automated
  tests — use a fixture/stub video URL, e.g. a small public-domain test
  .mp4 or .m3u8 sample)
- Test 1: opening an episode shows a working <video> element with the
  stubbed source
- Test 2: chrome auto-hides after idle (use page.clock per Phase 6's
  pattern)
- Test 3: tapping/clicking toggles controls visible
- Test 4: episode-end triggers the auto-play-next countdown overlay
  (simulate via dispatching a video 'ended' event rather than waiting
  for real playback)

Also write convex/sources/animeSource.test.ts with the same two-tier
(fixture unit test + manual integration test) pattern from Phase 2,
since this action does real Playwright scraping.

Run `npm run test:unit` and `npm run test:e2e`, confirm both green.
```

---

## Phase 10 — Capacitor Wrap + Mobile Polish

### Prompt to paste
```
PHASE 10: Capacitor Mobile Wrap

Per Guide.md section 7. Build the app (npm run build), confirm /out
exists and is a valid static export, then run:
- npx cap sync
- Verify capacitor.config.ts points webDir at "out"

Add @capacitor/filesystem for offline chapter downloads (replacing the
IndexedDB-only approach) per Guide.md section 7's note, wiring it into
the downloads table from Phase 1.

Audit the whole app for anything that assumes a browser-only API
(localStorage size limits, clipboard, etc. per our earlier conversation)
and flag each one to me before changing it — don't silently swap
implementations without telling me what changed and why.

Implementation Plan first.
```

### Testing prompt
```
This phase is primarily manual device/simulator testing, not automated:
1. Run `npx cap open android` (or ios) and manually verify each Phase
   4-9 flow on a real device or emulator
2. Create testing/manual-mobile-checklist.md listing every flow from
   Phases 4-9 as a checkbox list, for you to walk through manually each
   time the mobile build changes
3. Existing Playwright E2E tests (testing/e2e/*) still run against the
   web build via `npm run test:e2e` and remain the CI-enforced
   regression suite — Capacitor wrapping should not change their
   pass/fail status. Re-run `npm run test:all` now as a final regression
   check before declaring the mobile wrap complete.
```

---

## After Every Phase: Session Summary

Paste this after each phase's tests are green:

```
Generate a SUMMARY.md for this session covering:
- What was built (files created/modified)
- Key implementation decisions and why
- Test results (paste the final test:unit and test:e2e output)
- What's next (the following phase number/name from developer.md)

Save it to /docs/session-log/phase-N-summary.md (replace N with this
phase's number).
```

---

## Quick Reference: Test Commands

| Command | Runs |
|---|---|
| `npm run test:unit` | All Convex function tests (Vitest + convex-test, no network) |
| `npm run test:e2e` | All Playwright E2E tests against the static build |
| `npm run test:all` | Both, in sequence — run this before considering any phase truly "done" |
| `npx vitest run convex/sources/exampleSource.integration.test.ts` | Manual-only real-network integration check (Phase 2+) |
| `npx playwright test --ui` | Interactive Playwright UI mode for debugging a failing E2E test |
