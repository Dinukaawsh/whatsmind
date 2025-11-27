## Whats Mind

Signals-first rituals workspace inspired by the `mail-app` project. This repo ships a thin slice—sample UI, small backend, and typed data helpers—so you can plug in the real automation stack later.

```
/app
 └─ api/snapshots      → typed GET + POST handlers (mock data today)
/components
 └─ insight-form.tsx   → client component that calls the API
/lib
 └─ sample-data.ts     → strongly typed fixtures + helpers
```

## Getting started

```bash
npm install
npm run dev
# open http://localhost:3000
```

The landing page combines server components (for instant metrics) and a client form that POSTs to `/api/snapshots`. All copy + visuals are placeholder quality-of-life helpers—swap with your brand as needed.

## Sample backend

- `GET /api/snapshots`: returns the current mock conversations plus computed metrics.
- `POST /api/snapshots`: accepts `{ topic, note, owner? }` and echoes a drafted insight to prove the wiring.
- Logic lives in `lib/sample-data.ts` so you can replace the fixtures with data from Supabase, Mongo, n8n, etc.

When you wire the real system, mirror how `mail-app` handles auth, queues, and logging—this starter deliberately stays minimal so it is easy to diff.

## Next steps

1. Replace the entries in `lib/sample-data.ts` with live data sources.
2. Introduce the same domain modules from `mail-app` (campaigns, dashboards, unsubscribers) as incremental routes.
3. Extend `/api/snapshots` or add new route handlers to point at your orchestrator or workflow engine.
4. Keep Docker + compose files aligned so both apps can ship with the same infra primitives.

The repo still runs on stock Next.js 16, React 19, Tailwind 4 (via the experimental `@import "tailwindcss"` entry). No additional deps were added so you can choose the rest of the stack freely.
