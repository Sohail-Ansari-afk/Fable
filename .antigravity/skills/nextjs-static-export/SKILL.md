# Next.js Static Export Guidelines for Capacitor Compatibility

Rules for keeping the Next.js app Capacitor-compatible.

## Rules
1. **No Server-Side Features**: Do not use Next.js Server Actions, Route Handlers (`app/api/*`), or any server-only features. The app must be fully static export (`output: 'export'` in `next.config.js`).
2. **No `next/image`**: Do not use the `next/image` component since it requires an active Node.js optimization server. Use standard HTML `<img>` tags or a custom client-side image component.
3. **Pure Client Router**: All navigation and routing must work entirely in client-side SPA mode.
4. **Data Fetching**: All dynamic behavior must be implemented using Convex query, mutation, or action hooks on the client.
