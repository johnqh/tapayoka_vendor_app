# tapayoka_vendor_app

Vendor web dashboard for Tapayoka. Device management, service configuration, order monitoring, QR code printing.

## Stack: Vite + React 19 + TypeScript + Tailwind CSS

## Commands

```bash
bun install
bun run dev          # http://localhost:5210
bun run build
bun run typecheck
bun run lint
bun run test
```

## Configuration Files

- `seo.config.mjs` -- SEO route configuration used by `generate-seo-assets.mjs` at build time to produce per-route localized `index.html` files, `sitemap.xml`, and `robots.txt`. When adding or changing routes, update this file. Note: uses `%VITE_APP_NAME%` placeholder pattern (not `{{}}`).

## Key Dependencies

- @sudobility/tapayoka_lib, tapayoka_types for business logic
- recharts for dashboard charts
- react-router-dom for routing
