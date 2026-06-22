# AniClone Testing Infrastructure

This directory contains the testing setup for the AniClone application.

## Directory Structure

*   `testing/convex/`: Helper utilities, test mocks, fixtures, and databases for Convex backend unit tests.
*   `testing/e2e/`: Playwright E2E browser tests targeting the static SPA build in `/out`.
*   `convex/**/*.test.ts`: Unit tests are co-located next to the Convex functions they test.

## Commands

| Command | Description |
|---|---|
| `npm run test:unit` | Runs the Vitest unit tests for the Convex backend in the edge runtime environment. |
| `npm run test:e2e` | Runs E2E Playwright tests against the `/out` static export build. |
| `npm run test:all` | Runs both unit and E2E tests sequentially. |
