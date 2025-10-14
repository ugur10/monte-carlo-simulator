# Monte Carlo Sales Pipeline Simulator

## Overview
Monte Carlo Sales Pipeline Simulator forecasts revenue outcomes for B2B deal funnels. The project combines a deterministic, unit-tested simulation engine with a type-safe API surface and a Tailwind-driven SvelteKit shell that will evolve into a production-ready UI. The short-term objective is to build a thin vertical slice – from data model through API response – before layering on interactivity, persistence, and visualization.

## Current Capabilities (Phase 1–3 Complete)
- **Tooling & DX**
  - SvelteKit 5 on Bun with strict TypeScript, Vitest, and Biome formatting/linting.
  - Tailwind CSS v4 baseline with a modern, “startup-ready” landing placeholder.
- **Simulation Engine**
  - Pure TypeScript Monte Carlo engine (`src/lib/simulator.ts`) producing revenue samples, histograms, confidence intervals, target probabilities, and per-deal sensitivity metrics in <1 s for 10k iterations.
  - Deterministic seeded RNG utilities, percentile helpers, and config normalization with comprehensive unit tests.
- **API Surface**
  - `/api/simulate` POST endpoint with Zod validation, structured JSON errors, and execution timing metadata.
  - Integration tests covering happy path, validation failures, auto-generated IDs, and deal impact toggles.

## Tech Stack
- **Runtime & Framework**: Bun • SvelteKit 5
- **Language & Types**: TypeScript (strict)
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`)
- **Quality**: Biome (lint/format), Vitest + jsdom
- **Validation**: Zod

## Quick Start
```bash
bun install
bun run dev        # http://localhost:5173
```

## Project Scripts
| Command | Description |
| --- | --- |
| `bun run dev` | Start the SvelteKit dev server |
| `bun run build` | Production build |
| `bun run preview` | Preview production bundle |
| `bun run lint` | Biome lint + format checks |
| `bun run format` | Apply Biome formatting |
| `bun run check` | `svelte-check` type/diagnostic pass |
| `bun run test` | Vitest suite with coverage |
| `bun run coverage` | Coverage report only |

## API Reference
### `POST /api/simulate`
Runs a Monte Carlo simulation for an array of deal inputs.

**Request Body**
```json
{
  "deals": [
    {
      "id": "pipeline-1",
      "name": "Enterprise Expansion",
      "amount": 120000,
      "winProbability": 0.55,
      "expectedCloseDate": "2025-12-15",
      "stage": "Negotiation"
    }
  ],
  "config": {
    "iterations": 5000,
    "seed": 1337,
    "histogramBinCount": 40,
    "revenueTargets": [100000, 200000],
    "includeDealImpacts": true
  }
}
```

**Response (`200 OK`)**
- `result.revenueSamples`: raw iteration totals.
- `result.histogram`: bin counts with probability mass.
- `result.confidenceIntervals`: 50 %, 80 %, 95 % by default.
- `result.dealImpacts`: expected value, variance contribution, tail sensitivity per deal.
- `result.metadata`: iterations, seed, run ID, generated timestamp, duration.

Headers include `x-simulation-duration-ms` for quick performance checks.

## Architecture Snapshot
```
src/
 ├─ lib/
 │   ├─ simulator.ts          # Monte Carlo engine
 │   ├─ utils.ts              # RNG, normalization, math helpers
 │   ├─ types.ts              # Shared domain contracts
 │   └─ simulator.test.ts     # Unit tests (determinism, metrics)
 ├─ routes/
 │   ├─ +page.svelte          # Tailwind landing shell
 │   └─ api/simulate/
 │       ├─ +server.ts        # Zod-validated API endpoint
 │       └─ simulate.test.ts  # API integration tests
 └─ setupTests.ts             # Vitest global setup (testing-library DOM matchers)
```

## Roadmap (Active & Upcoming Phases)
1. **Completed** – SvelteKit scaffold, Tailwind baseline, Bun tooling.
2. **Completed** – Monte Carlo engine with strict types and high-level tests.
3. **Completed** – `/api/simulate` endpoint with validation/time tracking.
4. **In Progress** – Deal input form, list management, results UI components (Chart.js).
5. Scenario persistence, export flows, polished UX/dark mode.
6. Documentation + visual polish and final QA pass.

A rolling verification checklist stays active:
- `bun run lint`
- `bun run test`
- `bun run check`
- Manual timing for 10k iterations
- Visual inspection on mobile/desktop as UI matures

## Contributing / Next Steps
- **UI Buildout**: Deal CRUD form, results dashboard, Chart.js integration.
- **Scenario Persistence**: LocalStorage-backed scenarios, export (JSON/CSV).
- **Design Polish**: Responsive layouts, micro-interactions, optional dark mode.
- **Documentation**: Replace this plan-centric README with production onboarding (install, usage, screenshots) once UI stabilizes.
