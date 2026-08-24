# FASTCUP Tournament Scout

Monorepo for a Manifest V3 Chromium extension and a backend that resolves FACEIT data without exposing the API key.

## Prerequisites

- Node.js 24 LTS
- pnpm 10 (enabled with `corepack enable`)
- `FACEIT_API_KEY` only in `apps/backend/.env`

Copy `apps/backend/.env.example` to `apps/backend/.env` and set the exact extension ID in `CORS_ORIGIN`. Set `WXT_SCOUT_API_BASE_URL` before building the extension; its origin is added to the generated manifest host permissions.

## Commands

```sh
pnpm install
pnpm dev:backend
pnpm dev:extension
pnpm typecheck
pnpm test
```

The extension requests only `storage` and `downloads`; configure the backend host with `WXT_SCOUT_API_BASE_URL` at build time.
