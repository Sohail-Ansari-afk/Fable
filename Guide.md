# Guide.md — Building the App with Google Antigravity (Vibecoding Edition)

> Companion to `design.md` and `UI.md`. This is the execution plan: tech stack, prerequisites, environment setup, and the exact agent instructions to paste into your IDE's config files.

---

## 0. Final Stack (locked decisions)

| Layer                 | Choice                                                                                                  | Why                                                                                                                             |
| --------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Frontend framework    | **Next.js 14+ (App Router), static export mode**                                                        | Capacitor requires a static SPA — no server-rendered routes                                                                     |
| Styling               | **Tailwind CSS v4**                                                                                     | Already decided                                                                                                                 |
| Backend + DB          | **Convex**                                                                                              | Free tier: 1M function calls/mo, 0.5GB storage, file storage + real-time sync + TypeScript-native, no separate API layer needed |
| Mobile wrapper        | **Capacitor**                                                                                           | Already decided, covered in earlier conversation                                                                                |
| Scraping/source layer | **Convex Actions** (Node runtime) running **Cheerio** (static sites) or **Playwright** (JS-heavy sites) | Actions are the only Convex function type allowed to make outbound network calls                                                |
| Metadata              | **AniList GraphQL API**                                                                                 | Free, no key required for public queries                                                                                        |
| Auth                  | **Convex Auth**                                                                                         | Native to the stack, avoids a third dependency                                                                                  |
| IDE                   | **Google Antigravity IDE**                                                                              | Your choice                                                                                                                     |

**Important architectural consequence of "static export + Convex":** your Next.js app has **zero server-side code of its own**. Every dynamic operation — fetching library data, calling a source extension, talking to AniList — happens through a Convex query/mutation/action called from the client. This is simpler than it sounds and is exactly the kind of app Convex is built for.

---

## 1. Prerequisites — Install Before Opening the IDE

### 1.1 Core tooling

```bash
# Node.js 20+ (check first)
node -v

# Convex CLI
npm install -g convex

# Capacitor CLI (global, for later mobile step)
npm install -g @capacitor/cli
```

### 1.2 Accounts to create (all free tier)

1. **Convex** — convex.dev → sign up → no credit card required for free tier.
2. **AniList** (optional at this stage) — only needed when you implement OAuth tracking sync later, not for the initial build.
3. **GitHub** — for repo + Antigravity project linkage.

### 1.3 Google Antigravity IDE

- Install from the official Antigravity site (VS Code-based agent IDE).
- Sign in with your Google account to get model access (Gemini 3 Pro/Flash, plus Claude/GPT depending on your plan).
- Open Antigravity → **Select Project → New Project → Add Folder** → point it at an empty repo folder for this app.

---

## 2. MCP Servers to Install

Antigravity's MCP config lives at `$HOME/.gemini/config/mcp_config.json` and is editable via **Settings → Customizations → Manage MCP Servers → View raw config**, or through the **+Add MCP** dialog in the UI. Install these:

| MCP Server                                                       | Purpose                                                                                                                                                                                                                       | How to add                                                                                                   |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Convex MCP**                                                   | Lets the agent inspect your Convex schema, run queries, check deployment status, and write functions with live schema awareness instead of guessing                                                                           | Settings → Customizations → Add MCP+ → search "Convex" → follow auth flow (deploy key from Convex dashboard) |
| **GitHub MCP**                                                   | Lets the agent create branches, commits, and PRs directly, and read issues if you track tasks there                                                                                                                           | Add MCP+ → search "GitHub" → OAuth                                                                           |
| **Filesystem MCP** (often built-in to Antigravity by default)    | Local file read/write — verify it's enabled; it's how the agent edits your actual code                                                                                                                                        | Usually pre-enabled; check under Installed MCP Servers                                                       |
| **Chrome DevTools / Browser MCP** (`/browser` command, built-in) | Lets the agent open a real browser, click through your running app, and visually verify UI matches `design.md`/`UI.md` — this is one of Antigravity's standout features                                                       | Built-in — invoke with `/browser` in chat, requires Chrome + debugging permission grant on first use         |
| **Context7 MCP** (or similar docs-lookup MCP)                    | Pulls current official docs for Next.js/Convex/Capacitor/Tailwind v4 into context so the agent doesn't hallucinate outdated APIs — same principle I used earlier when I verified Playwright's API before writing code for you | Add MCP+ → search "Context7" → no auth needed for public docs                                                |

If any of these aren't in the built-in store yet by the time you set this up, add them manually via the raw `mcp_config.json` using each project's documented MCP server URL — the format is:

```json
{
  "mcpServers": {
    "convex": {
      "command": "npx",
      "args": ["-y", "convex@latest", "mcp", "start"]
    }
  }
}
```

(Verify exact install command against Convex's own docs at the time you do this — MCP server packaging details shift.)

---

## 3. Agent Skills to Install

Antigravity auto-detects **Skills** — folders containing a `SKILL.md` that the agent loads when relevant, the same mechanism you've seen described for Claude. Create a `.antigravity/skills/` (or wherever your installed Antigravity version expects skills — check Settings → Customizations → Skills path) directory with:

1. **`nextjs-static-export/SKILL.md`** — rules for keeping the app Capacitor-compatible (no server actions, no API routes, `output: 'export'` in `next.config.js`, no `next/image` optimization since it needs a server — use plain `<img>` or a client-side solution instead).
2. **`convex-functions/SKILL.md`** — conventions for writing queries/mutations/actions, schema file location, validator patterns (`v.string()`, `v.id("table")`, etc.).
3. **`source-extension-interface/SKILL.md`** — the `MangaSource`/`AnimeSource` TypeScript interface from our earlier conversation, so every scraped source the agent writes implements the same contract.
4. **`design-system/SKILL.md`** — point this directly at your `design.md` file (or paste its contents in) so every component the agent generates pulls from the same color tokens/spacing/component rules instead of inventing new ones per screen.

If your Antigravity version doesn't have a clean custom-skills UI yet, the fallback is identical in effect: reference these files explicitly in your agent instruction file (Section 4) and keep them in the repo root so the agent reads them via filesystem access regardless.

---

## 4. Project Scaffolding (run before handing off to the agent)

Do this part yourself in terminal — it's faster than vibecoding boilerplate, and it gives the agent a correct foundation instead of asking it to invent project structure from scratch:

```bash
# 1. Next.js app, static-export-ready
npx create-next-app@latest aniyomi-web --typescript --tailwind --app --no-src-dir
cd aniyomi-web

# 2. Confirm Tailwind v4 (create-next-app may scaffold v3 — check package.json)
npm install tailwindcss@latest @tailwindcss/postcss@latest

# 3. Convex
npm install convex
npx convex dev    # creates convex/ folder, links to your Convex account, generates dashboard

# 4. Capacitor (config now, build later)



npx cap init "AniClone" "com.yourname.anicione" --web-dir=out

# 5. Scraping dependencies (used inside Convex actions only)
npm install cheerio
npm install playwright
npx playwright install chromium

# 6. AniList client (just GraphQL over fetch, no special package needed)
```

In `next.config.js`, set:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: { unoptimized: true }, // required for static export
};
module.exports = nextConfig;
```

Copy `design.md` and `UI.md` into the repo root (e.g. `/docs/design.md`, `/docs/UI.md`) — the agent will read these directly.

---

## 5. Build Order (do NOT ask the agent to build everything in one prompt)

Per Antigravity best practice: feature-by-feature, reviewing the agent's Implementation Plan before it codes, generating a `SUMMARY.md` after each session to carry context forward. Recommended order:

1. **Convex schema** (`convex/schema.ts`) — tables: `sources`, `manga`, `chapters`, `episodes`, `library`, `categories`, `readingProgress`, `downloads`.
2. **Source extension interface + 1 real Cheerio-based manga source** (prove the pattern end-to-end before generalizing).
3. **AniList metadata integration** (search + detail fetch).
4. **Library screen + Title Detail screen** (per `UI.md` §3.2, §3.6).
5. **Browse → Sources → Catalog flow** (§3.5).
6. **Reader (manga)** — paged + webtoon modes (§3.7).
7. **Updates + History screens** (§3.3, §3.4).
8. **Settings/More** (§3.9) — start minimal, expand later.
9. **Anime source (Playwright-based) + Player** — saved for later since it's the highest-complexity, highest-legal-risk piece.
10. **Capacitor wrap + mobile-specific polish** (only after web app is functionally complete).

After each numbered step: test in browser via the agent's `/browser` command, confirm it matches `UI.md`/`design.md`, then ask the agent for a `SUMMARY.md` before starting the next step.

---

## 6. The Agent Instruction File

Antigravity itself doesn't require separate `GEMINI.md`/`CLAUDE.md`/`AGENTS.md` files the way some other tools do — but since you may also use Claude Code or another harness on this same repo later, create **one shared file** and copy it to all three names so every agent that touches this repo gets identical instructions:

```bash
# After writing the content below into AGENTS.md:
cp AGENTS.md GEMINI.md
cp AGENTS.md CLAUDE.md
```

Paste the following into `AGENTS.md` (then copy to `GEMINI.md` and `CLAUDE.md`) at your repo root:

```markdown
# Agent Instructions — AniClone Web App

## Project Context

You are building a manga/anime library + reader/player web app inspired by
Aniyomi's UX, using:

- Next.js (App Router, STATIC EXPORT ONLY — output: 'export' in next.config.js)
- Tailwind CSS v4
- Convex (database, functions, file storage, auth) — NO separate Node API
- Capacitor (mobile wrapper — added later, do not break static-export compatibility)

## Hard Constraints (never violate)

1. NEVER use Next.js Server Actions, Route Handlers (app/api/\*), or any
   server-only feature. This app is a static export. All dynamic behavior
   goes through Convex queries/mutations/actions called from client components.
2. NEVER use `next/image` — static export can't run the optimization server.
   Use plain `<img>` tags or a client-side image component.
3. Outbound network calls (scraping sources, calling AniList) belong ONLY in
   Convex Actions (`"use node"` actions), never in queries/mutations
   (those must stay pure and deterministic) and never in client components.
4. Every manga/anime source MUST implement the shared interface defined in
   `/docs/source-extension-interface.md` (or `convex/sources/types.ts` once
   created). Do not invent a different shape per source.
5. Before writing any UI component, read `/docs/design.md` for color tokens,
   spacing, and component specs, and `/docs/UI.md` for the exact navigation
   flow and screen behavior. Do not invent new navigation patterns not
   described there — if something is genuinely ambiguous, ask me before
   proceeding rather than guessing.
6. Use the Convex MCP server to inspect the live schema before writing
   functions that touch the database — do not assume field names/types from
   memory; verify against the actual deployed schema.
7. Use Context7 (or equivalent docs MCP) to verify current Next.js/Convex/
   Tailwind v4/Capacitor APIs before using them, especially anything you're
   not fully certain about — these libraries change fast and your training
   data may be stale. Cite what you found if it changed your approach.

## Workflow Rules

1. One feature at a time, per the build order in `/docs/Guide.md` §5. Do not
   attempt to scaffold the entire app in a single run.
2. Before coding a feature, write a short Implementation Plan (what files
   you'll touch, what Convex functions you'll add, what UI components you'll
   create) and wait for my review/approval.
3. After completing a feature, use the `/browser` tool to visually verify
   the running app against the relevant section of `/docs/UI.md`.
4. After each completed feature/session, generate a `SUMMARY.md` capturing
   what was built, key decisions made, and what's next — append it to
   `/docs/session-log/` with a timestamped filename so context carries
   forward into the next session without re-explaining the whole project.
5. Never invent fake data silently — if a screen needs sample/seed data to
   render during development, create an explicit Convex seed script
   (`convex/seed.ts`) rather than hardcoding mock arrays inside components.

## Legal/Scope Boundary

This app's scraping layer is for personal/self-hosted use. Do not add
analytics, telemetry, or any feature that would make this resemble a public
content-distribution product without flagging that explicitly to me first —
the scraping approach here carries real legal exposure if distributed
publicly, and that decision is mine to make, not yours.

## Code Style

- TypeScript strict mode, no `any` unless truly unavoidable (and commented why).
- Functional React components only.
- Tailwind utility classes inline; extract to a component when a pattern
  repeats 3+ times, not before.
- Convex function names: `camelCase`, file-per-domain
  (`convex/library.ts`, `convex/sources.ts`, `convex/anilist.ts`).
```

---

## 7. After the Web App Works: Mobile Step

Once the Next.js static app is functionally complete and tested in browser:

```bash
npm run build        # outputs to /out per next.config.js
npx cap add ios
npx cap add android
npx cap sync
npx cap open android  # or ios
```

Revisit the Capacitor caveats from our earlier conversation at this point — particularly swapping `localStorage`/IndexedDB-only offline downloads for `@capacitor/filesystem` where you want real on-device file storage for downloaded chapters.

---

## 8. Order of Operations Summary (checklist)

- [ ] Install Node, Convex CLI, Capacitor CLI, Antigravity IDE
- [ ] Create Convex account, create project
- [ ] Configure MCP servers (Convex, GitHub, Browser, Context7/docs)
- [ ] Set up Skills folder (or fallback: reference docs directly in AGENTS.md)
- [ ] Scaffold Next.js + Tailwind v4 + Convex + Capacitor init (yourself, terminal)
- [ ] Copy `design.md`, `UI.md`, this `Guide.md` into `/docs`
- [ ] Write and copy `AGENTS.md` → `GEMINI.md` → `CLAUDE.md`
- [ ] Open Antigravity, point it at the repo, start with Convex schema (build order §5, step 1)
- [ ] Proceed feature-by-feature, reviewing plans, verifying with `/browser`, generating `SUMMARY.md` per session
- [ ] Mobile wrap with Capacitor only after web app is feature-complete
