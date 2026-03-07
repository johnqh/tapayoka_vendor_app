# tapayoka_vendor_app

Vendor web dashboard for Tapayoka. Device management, service configuration, order monitoring, and QR code printing.

## Setup

```bash
bun install
bun run dev          # http://localhost:5210
```

## Stack

Vite, React 19, TypeScript, Tailwind CSS, Recharts, React Router.

## Development

```bash
bun run dev          # Vite dev server (port 5210)
bun run build        # Production build
bun run test         # Run tests
bun run typecheck    # TypeScript check
bun run lint         # ESLint
```

## Related Packages

- `@sudobility/tapayoka_lib` -- Business logic and Zustand stores
- `@sudobility/tapayoka_types` -- Type definitions
- `tapayoka_api` -- Backend API server
- `tapayoka_vendor_app_rn` -- Native vendor app (iOS/Android)

## License

BUSL-1.1
