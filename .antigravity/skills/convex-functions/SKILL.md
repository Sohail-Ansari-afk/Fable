# Convex Functions Conventions

Conventions and rules for writing Convex queries, mutations, and actions.

## Conventions
1. **Separation of Concerns**:
   - Queries and mutations must remain pure, deterministic, and fast.
   - Outbound network requests (such as scraping sources, fetching external metadata, or querying AniList) must run inside Convex Actions (`"use node"` actions) and never in queries or mutations.
2. **Schema & Indexes**:
   - Convex schema lives at `convex/schema.ts`.
   - Inspect the Convex schema using the Convex MCP server before writing database operations.
   - Define and use indexes appropriately (e.g. indexing chapters by mangaId).
3. **Validators**:
   - Use Convex validators (`v.string()`, `v.number()`, `v.boolean()`, `v.id("table_name")`, `v.optional(...)`) for all function arguments.
4. **Naming Conventions**:
   - Use `camelCase` for function names.
   - Domain-oriented files (e.g., `convex/library.ts`, `convex/sources.ts`, `convex/anilist.ts`).
