# Agent Instructions — AniClone Web App

## Project Context
You are building a manga/anime library + reader/player web app inspired by
Aniyomi's UX, using:
- Next.js (App Router, STATIC EXPORT ONLY — output: 'export' in next.config.js)
- Tailwind CSS v4
- Convex (database, functions, file storage, auth) — NO separate Node API
- Capacitor (mobile wrapper — added later, do not break static-export compatibility)

## Hard Constraints (never violate)
1. NEVER use Next.js Server Actions, Route Handlers (app/api/*), or any
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
