# UI.md — Navigation Structure & User Flows

> Companion to `design.md`. This document defines *where things live* and *how users move through the app*, based directly on Aniyomi's actual information architecture (Library / Updates / History / Browse / More).

---

## 1. Top-Level Navigation

Five primary destinations, persistent across the whole app (bottom nav on mobile, side rail on desktop):

```
┌──────────┬──────────┬──────────┬──────────┬──────────┐
│ Library  │ Updates  │ History  │ Browse   │  More    │
│  (book)  │  (bell)  │ (clock)  │ (compass)│  (•••)   │
└──────────┴──────────┴──────────┴──────────┴──────────┘
```

Each destination is itself split into **Manga** and **Anime** modes via a top-level segmented toggle or tab, since Aniyomi is dual-purpose. Decision: a persistent **Manga / Anime switch** lives in the app bar of Library, Updates, History, and Browse (not a 6th nav item — keeps nav uncluttered).

---

## 2. Screen Inventory

| # | Screen | Reachable from |
|---|---|---|
| 1 | Library | Bottom nav |
| 2 | Updates (recent chapters/episodes feed) | Bottom nav |
| 3 | History (recently read/watched) | Bottom nav |
| 4 | Browse → Sources list | Bottom nav |
| 5 | Browse → Extensions (manage installed sources) | Browse tab |
| 6 | Browse → Source catalog (Popular/Latest/Search within one source) | Tap a source |
| 7 | Global Search (cross-source) | Search icon in Browse |
| 8 | Title Detail (manga or anime series page) | Tap any cover, anywhere |
| 9 | Chapter list / Episode list | Part of Title Detail |
| 10 | Reader (manga reading view) | Tap a chapter |
| 11 | Player (anime watching view) | Tap an episode |
| 12 | More → Settings (root) | Bottom nav |
| 13 | Settings → Appearance, Library, Reader, Player, Downloads, Tracking, Backup, Browse, Security, Advanced | Settings root |
| 14 | Categories management | Library overflow menu / Settings → Library |
| 15 | Downloads queue | More menu, or icon in app bar when active |
| 16 | Tracking link screen (AniList/MAL account connect) | Settings → Tracking, or from Title Detail |
| 17 | Onboarding / first-run | First launch only |

---

## 3. Screen-by-Screen Flows

### 3.1 Onboarding (first run)
```
Splash → Welcome screen → "Add your first source"
   → Browse → Extensions tab (pre-filtered to recommended/official repo)
   └─ Install 1+ extensions → Land on empty Library with
     a prompt: "Your library is empty — Browse sources to add titles"
```
- No forced account creation. Local-first by default, optional AniList/MAL linking offered but skippable (mirrors Aniyomi's no-login philosophy).

### 3.2 Library
**Purpose:** the user's saved/subscribed titles — the home screen for returning users.

```
Library (grid of covers, default sort: Last Updated)
 ├─ Tap cover → Title Detail
 ├─ Long-press cover → Multi-select mode
 │    └─ Bulk actions: Add to category, Mark read, Delete, Download
 ├─ Tap category tab (top, if categories exist) → filters grid
 ├─ Tap filter icon (app bar) → Filter/Sort/Display bottom sheet
 ├─ Tap search icon → inline search within library only
 └─ Pull to refresh → triggers library update check (new chapters/episodes)
```
- **Categories** are user-created tabs at the top of Library (e.g. "Watching," "Plan to Read," "Completed") — horizontally scrollable chip/tab row.
- Empty state: friendly prompt directing to Browse.

### 3.3 Updates
**Purpose:** reverse-chronological feed of new chapters/episodes for library titles.

```
Updates (grouped by date: Today, Yesterday, This Week...)
 ├─ Each row: cover thumbnail + series title + chapter/episode name + time
 ├─ Tap row → opens Reader/Player directly at that chapter/episode
 ├─ Tap cover thumbnail (not the row text) → Title Detail instead
 └─ Swipe row → quick action (mark read / download)
```

### 3.4 History
**Purpose:** recently read/watched, for resuming.

```
History (grouped by date)
 ├─ Each row: cover + series + chapter/episode + progress (e.g. "Page 12/24")
 ├─ Tap row → Resume directly in Reader/Player at last position
 ├─ Swipe row → Remove from history
 └─ Search icon → filter history by title
```

### 3.5 Browse
**Purpose:** discovery and source/extension management.

```
Browse
 ├─ Tab: Sources (installed, ready-to-browse sources, grouped by language)
 │    └─ Tap source → Source Catalog screen
 │         ├─ Sub-tabs: Popular | Latest | (Search bar always visible)
 │         ├─ Infinite-scroll grid of results
 │         └─ Tap cover → Title Detail
 │
 ├─ Tab: Extensions (manage available/installed/updatable extensions)
 │    ├─ Sections: "Installed," "Updates available," "Available" (by language)
 │    ├─ Each row: icon, name, version, lang, Install/Update/Uninstall button
 │    └─ Tap ⋮ → Add custom repository (paste repo URL)
 │
 └─ Global search icon (top right) → Global Search screen
      ├─ Single query fanned out across all installed sources concurrently
      └─ Results grouped by source, collapsible per-source sections
```

### 3.6 Title Detail
**Purpose:** the hub screen for one series — info + chapter/episode list + actions.

```
Title Detail
 ├─ Header: large cover, title, author/studio, status (ongoing/completed),
 │           genre chips, source name, tracking status icon
 ├─ Synopsis (expandable/collapsible if long)
 ├─ Primary action button: "Add to Library" (or "In Library ✓" if already added)
 ├─ Secondary actions: Track (AniList/MAL), Download all, Share
 ├─ Tab or scroll section: Chapter/Episode list
 │    ├─ Sort/filter icon (by number, by upload date, unread-only)
 │    ├─ Each row: number, title, scanlator/quality tag, date, read/unread state,
 │    │             download status icon, bookmark icon
 │    ├─ Tap row → Reader/Player
 │    ├─ Long-press row → multi-select (mark read, download, delete)
 │    └─ Swipe row → quick mark-as-read/downloaded
 └─ "Continue Reading/Watching" floating button → jumps to next unread chapter/episode
```

### 3.7 Reader (Manga)
```
Reader (full-screen, chrome hidden by default)
 ├─ Tap center → toggle top/bottom bars
 │    ├─ Top bar: back button, chapter title, ⋮ menu (viewer settings)
 │    └─ Bottom bar: page slider/counter, prev/next chapter buttons
 ├─ Tap left/right zone (paged mode) → prev/next page
 ├─ Swipe/scroll (webtoon mode) → continuous vertical scroll
 ├─ Pinch → zoom; double-tap → quick zoom toggle
 ├─ Reaching last page → chapter transition screen → auto-advance or
 │    manual "Next Chapter" tap
 └─ Settings gear (in top bar) → inline panel: viewer mode, background
      color, crop borders, page layout (single/double) — NOT a full
      navigation away from the reader
```

### 3.8 Player (Anime)
```
Player (full-screen, chrome auto-hides after ~3s idle)
 ├─ Tap → toggle controls
 ├─ Center controls: play/pause, ±10s skip
 ├─ Bottom: scrubber with chapter/thumbnail preview, time elapsed/remaining
 ├─ Top bar: back, episode title, ⋮ menu (quality, subtitle/audio track,
 │            playback speed, player settings)
 ├─ Gesture zones: left edge vertical swipe = brightness,
 │                  right edge vertical swipe = volume,
 │                  horizontal swipe anywhere = seek scrubbing
 ├─ Episode end → auto-play next episode (toggle in settings) with a
 │    5s cancelable countdown overlay
 └─ PiP button → minimizes to floating window, nav remains usable underneath
```

### 3.9 More / Settings
```
More
 ├─ Account/tracking summary (if linked)
 ├─ Settings →
 │    ├─ Appearance (theme, accent color, dark/light/system, grid columns)
 │    ├─ Library (categories, global update interval, update restrictions)
 │    ├─ Reader (default viewer mode, tap zones, crop, color filter)
 │    ├─ Player (default quality, subtitle prefs, gesture sensitivity)
 │    ├─ Downloads (storage location, auto-delete after read, wifi-only)
 │    ├─ Tracking (connect AniList/MAL/Kitsu accounts)
 │    ├─ Browse (default source language filter, NSFW toggle)
 │    ├─ Backup & Restore (export/import JSON backup, cloud backup target)
 │    ├─ Security (app lock / biometric, incognito mode toggle)
 │    └─ Advanced (clear cache, clear cookies, debug info, about/version)
 ├─ Downloads queue (active downloads, pause/cancel)
 └─ Help/changelog/Discord link
```

---

## 4. Cross-Cutting User Flows

### 4.1 "Add a new series" (most common first-time flow)
```
Browse → Sources tab → pick a source → Popular/Search →
tap cover → Title Detail → "Add to Library" →
(optional) pick category → toast confirmation → back to browsing
```

### 4.2 "Catch up on new chapters" (most common daily flow)
```
Open app → lands on Library or Updates (user-configurable default tab) →
Updates feed shows new chapters grouped by date →
tap → Reader opens directly at chapter 1 of unread →
finish → auto-advance to next unread chapter → back button →
returns to Updates feed (not Library) → row now shows as read
```

### 4.3 "Resume where I left off"
```
Open app → History tab → top row is most recent →
tap → Reader/Player resumes at exact saved page/timestamp
```

### 4.4 "Global search for a title without knowing which source has it"
```
Browse → search icon → type query → results grouped by source →
expand a source's results → tap cover → Title Detail →
Add to Library
```

### 4.5 "Install a new extension/source"
```
Browse → Extensions tab → (if repo not added) ⋮ → Add repository →
paste repo URL → repository's sources appear under "Available" →
tap Install → button shows progress → becomes "Installed" →
source now appears in Browse → Sources tab
```

### 4.6 "Switch between Manga and Anime mode"
```
Any of Library/Updates/History/Browse → tap Manga/Anime segmented
toggle in app bar → entire screen content re-filters to that media
type → toggle state persists across navigation until changed again
```

---

## 5. Navigation Rules (must-hold invariants)

1. **Every cover, everywhere** (library, updates, history, browse, search) → tapping the cover image always goes to Title Detail. Tapping a *row's text/metadata* (in Updates/History) jumps straight into Reader/Player instead — this distinction is intentional and must stay consistent.
2. **Back button always returns to the screen the user came from**, not a hardcoded parent — Reader/Player opened from Updates returns to Updates; opened from Title Detail returns to Title Detail.
3. **No destructive action without confirmation** except "mark as read" (low-stakes, easily reversible).
4. **Reader/Player settings never fully navigate away** — always an overlay/inline panel so reading position/playback isn't lost or interrupted.
5. **Search is always inline/expand-in-place**, never a full route change that loses scroll position of the underlying screen.
6. **The bottom nav / side rail is always visible** except inside Reader and Player, where it's intentionally absent for full immersion.

---

## 6. Responsive Behavior Summary

| Breakpoint | Nav pattern | Grid columns (library/browse) |
|---|---|---|
| < 600px (phone) | Bottom nav, 5 items | 3 |
| 600–1024px (tablet) | Bottom nav or side rail (user pref) | 4–5 |
| > 1024px (desktop) | Side rail, persistent | 5–6, user-adjustable |

Reader and Player are full-screen and chrome-minimal at every breakpoint — the one place where breakpoint doesn't change the navigation pattern, only content sizing.
