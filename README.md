# PongFind

A mobile-first personal search interface for second-hand table-tennis equipment. It searches enabled marketplaces independently, merges normalized listings, and opens each result on its original marketplace.

## MVP architecture

- Next.js 16 App Router, React 19, strict TypeScript, and Mantine UI.
- One server route per marketplace, so a slow/failing provider never blocks another provider from rendering.
- Kleinanzeigen public HTML parsing and Vinted's anonymous private web JSON endpoint. Both are unofficial and can break; read [`docs/providers`](docs/providers).
- Browser-only recent and saved searches in `localStorage`; no auth, database, cron, or external application service.
- Canonical provider requests, validated query inputs, a fixed upstream allow-list, ten-second timeouts, 60-second Kleinanzeigen caching, bounded local history, and structured provider logs.

## Run

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open http://localhost:3000. Both providers are enabled by default. Import the Git repository into Vercel for a normal framework deployment; no Docker or separate backend is required. Under ordinary personal usage this uses only the Vercel Hobby project, subject to Vercel's current free-tier limits.

## Checks

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
```

## Operational note

The providers are best-effort integrations with unsupported marketplace web surfaces. The request flow and Vinted session behavior are regression-tested, but upstream access may still be denied from a cloud IP. A provider failure is isolated and includes a safe reason code. See [`docs/vercel-provider-access.md`](docs/vercel-provider-access.md) for diagnosis and the optional server-only proxy configuration. Set `ENABLED_PROVIDERS=kleinanzeigen` (or `vinted`) to disable one without UI changes. Do not add challenge bypasses or credentials.
