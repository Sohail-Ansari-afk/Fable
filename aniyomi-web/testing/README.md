# AniClone Testing Infrastructure

This directory houses tests and fixtures verifying the app frontend, backend logic, and scrapers.

## Test Tiers

### 1. Unit Tests (CI & Local Safe)
These tests compile and execute in isolation, never making real network requests. Mock data and fixtures are utilized instead.

*   Run all unit tests: `npm run test:unit`
*   Scope:
    *   Convex schema integrity checks (`convex/schema.test.ts`)
    *   Offline parser logic tests (`convex/sources/exampleSource.test.ts` using fixture files)

### 2. Integration Tests (Manual Runs Only)
These tests make live requests to external manga/anime sites. They must not run during the standard build or unit tests.

*   Run integration tests manually:
    ```bash
    npm run test:integration
    ```
*   Scope:
    *   External scraper connectivity and live CSS selector validations (`convex/sources/exampleSource.integration.test.ts`)

### 3. E2E Tests (Browser Tests)
These tests verify complete front-to-back functionality using Playwright against static production builds.

*   Run all E2E tests: `npm run test:e2e`
