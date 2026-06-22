# Design.md — Visual & Interaction Design Language

> Inspired by Aniyomi (Mihon-based fork). This document defines the *look, feel, and design rules* for the web app. For screen-by-screen navigation and user flows, see `UI.md`.

---

## 1. Design Philosophy

Aniyomi's design inherits from **Material Design 3 (Material You)**, adapted for a content-dense, reading/watching-first app. Three principles drive every decision:

1. **Content is the hero.** Covers, thumbnails, and reader/player canvas get maximum visual weight. Chrome (nav bars, headers) recedes — translucent, collapsible, auto-hiding during reading/watching.
2. **Low-friction repetition.** Users open this app dozens of times a day to do the same five things (check updates, continue reading, browse). Navigation must be muscle-memory fast — no more than 2 taps to any core action.
3. **Respect the dark room.** This is a night-time, low-light usage app by nature. Dark theme is the default and the primary design target, not an afterthought.

---

## 2. Color System

### 2.1 Theming model
- Built on **Material 3 dynamic color** principles: a single seed/accent color generates the full tonal palette (primary, secondary, tertiary, surface tones) algorithmically.
- Ship with **5–6 preset accent themes** (e.g. Default Teal, Strawberry Daiquiri, Tako, Tidal Wave, Yinyang, Yotsuba) users can switch between instantly — this mirrors Aniyomi's actual theme picker.
- Full **light / dark / system** mode toggle. Dark is default.

### 2.2 Dark theme (default) tokens

| Token | Value (approx.) | Usage |
|---|---|---|
| `surface` | `#121212` – `#1A1A1A` | App background |
| `surface-container` | `#1E1E1E` | Cards, sheets |
| `surface-container-high` | `#2A2A2A` | Nav bar, app bar |
| `on-surface` | `#E6E1E5` | Primary text |
| `on-surface-variant` | `#9A9A9A` | Secondary text, metadata |
| `primary` (seed-derived) | accent hue, ~70% tone | FAB, active tab, links, progress |
| `outline` | `#3A3A3A` | Dividers, card borders |
| `error` | `#F2B8B5` on `#601410` | Error/destructive actions |

### 2.3 Light theme tokens

| Token | Value | Usage |
|---|---|---|
| `surface` | `#FFFBFE` | App background |
| `surface-container` | `#F3EDF7` | Cards |
| `on-surface` | `#1C1B1F` | Primary text |
| `on-surface-variant` | `#49454F` | Secondary text |
| `primary` | seed-derived, ~40% tone | Accents |

### 2.4 Functional colors
- **Unread badge**: primary accent, filled pill, top-left or top-right corner of cover.
- **Downloaded badge**: secondary/green, small icon overlay.
- **In-progress indicator**: thin progress bar under cover (partially read/watched).
- **New chapter/episode dot**: small accent dot on library cover.

---

## 3. Typography

| Role | Font weight/size | Usage |
|---|---|---|
| Display (rare) | 28–32px, Medium | Onboarding only |
| Title Large | 22px, Medium | Screen titles in app bar |
| Title Medium | 16px, Medium | Card titles, dialog titles |
| Body Large | 16px, Regular | Synopsis, descriptions |
| Body Medium | 14px, Regular | Chapter/episode list rows |
| Label / Caption | 12px, Medium, letter-spacing +0.4 | Metadata: dates, scanlator, file size |

- **Font:** system font stack (Roboto-equivalent on Android, `-apple-system` on iOS, Inter as web fallback) — avoid licensing a custom display font; Aniyomi itself uses system fonts for fast load and native feel.
- Reader/player UI **never** uses decorative type — pure functional labels only, kept minimal and dismissible.

---

## 4. Layout & Grid

- **Library/Browse grid:** responsive cover grid, default **3 columns on mobile**, scaling to 4–6 on tablet/desktop breakpoints. User-adjustable column count (Aniyomi exposes this as a setting — replicate it).
- **Cover aspect ratio:** 2:3 (standard manga/anime poster ratio), rounded corners (8–12px radius), subtle elevation shadow only on hover/press (web), none at rest (flat, content-forward).
- **List rows** (chapters/episodes, history, downloads): 56–72px height, leading thumbnail optional, trailing metadata (date, file size, progress) right-aligned.
- **Bottom navigation** (mobile breakpoint): persistent, 5 items max, icon + label, elevates content area above it with safe-area padding.
- **Side rail / side nav** (desktop/tablet breakpoint ≥1024px): same 5 destinations, collapses bottom nav into a left rail — same IA, responsive only, not redesigned per-breakpoint.

---

## 5. Components

### 5.1 Cover card (library/browse grid item)
- Cover image, lazy-loaded with blurred low-res placeholder while loading.
- Title overlay: bottom gradient scrim (black, 0%→70% opacity) so white title text stays legible over any cover art.
- Badges stack top-left (unread count) and top-right (download icon) as small filled pill/chip overlays.
- Long-press / right-click → multi-select mode (batch add to category, delete, mark read).

### 5.2 App bar
- Collapsing/scroll-aware: full height with large title at rest, shrinks to compact bar with centered/left title on scroll-down, reappears on scroll-up.
- Search icon always reachable, expands inline into a search field rather than navigating to a new screen.
- Overflow menu (⋮) for screen-specific actions (sort, filter, display mode).

### 5.3 Filter/Sort sheet
- Bottom sheet (mobile) / popover (desktop) triggered from a filter icon in the app bar.
- Three tabs inside: **Filter** (unread, downloaded, started, bookmarked toggles), **Sort** (alphabetical, last updated, last read, date added — asc/desc), **Display** (grid/list toggle, badge visibility, column count slider).

### 5.4 Reader (manga)
- **Zero chrome by default.** Tapping/clicking the center of the screen toggles a translucent top bar (chapter title, back button) and bottom bar (page slider, settings gear) that auto-hide after a few seconds of inactivity.
- Page transitions: instant (paged) or continuous-scroll (webtoon) per the viewer mode selected.
- Background color is itself a setting: black / gray / white — not tied to app theme, since reading is a separate visual context from browsing.

### 5.5 Player (anime)
- Standard media-player chrome (progress scrubber, play/pause, skip ±10s, episode list flyout, quality/subtitle/audio track selectors) — auto-hides during playback, reappears on tap/mouse-move.
- Gesture zones (mobile): left-side vertical swipe = brightness, right-side vertical swipe = volume, horizontal swipe = seek — mirrors Aniyomi's MPV-based player gestures.
- Picture-in-picture support where the platform allows it (web: Document PiP API; mobile via Capacitor plugin).

### 5.6 Extension/Source list row
- Source icon (favicon-style, rounded square), name, language tag, version, install/update/uninstall action button — state-dependent (Install → Updating → Uninstall).

---

## 6. Motion

- Keep motion **functional and short** (150–250ms standard, Material "emphasized" easing curve). No decorative animation that delays access to content.
- Shared-element-style cover transition from grid → detail screen (cover image morphs/expands into the detail header) — this single piece of motion does the most for perceived quality and is worth the implementation cost.
- Reader/player chrome fades (150ms), never slides — slides compete visually with content the user is trying to read/watch.

---

## 7. Iconography

- Outlined icon style at rest, filled/tonal on active/selected state (Material Symbols convention) — gives clear active-state feedback in bottom nav and tabs without relying on color alone (accessibility).
- Consistent 24px icon grid throughout; 20px for inline/dense list contexts.

---

## 8. Accessibility & responsiveness

- Minimum tap target 44×44px (mobile) even when visual icon is smaller.
- All color-coded states (unread, downloaded, error) paired with an icon or text label, never color alone.
- Respect `prefers-color-scheme` and `prefers-reduced-motion` media queries by default.
- Reader/player text and controls must remain usable down to small phone widths (360px) and up to desktop (1440px+) without redesign — same components, fluid grid.

---

## 9. What NOT to imitate

A few Aniyomi UI quirks are legacy/Android-platform artifacts, not intentional design choices worth porting to web:
- Android-specific system back-gesture reliance — web needs explicit back buttons/breadcrumbs.
- Some legacy fragment-based screens in the real app have inconsistent app-bar behavior (a known issue even in Aniyomi/Mihon) — standardize on **one** collapsing-app-bar behavior across all screens instead.
