# Monte Carlo Sales Pipeline Simulator — Delivery Plan

## Project Intent
Build a production-grade Monte Carlo simulation tool for sales pipeline forecasting using SvelteKit 5, Bun, TypeScript, Tailwind, and Chart.js. The final experience should demonstrate deep technical rigor (fast, accurate simulations with strong validation) and clear product thinking (polished UX, actionable insights, scenario management, export support).

## Delivery Principles
- **Incremental Value:** Deliver functionality in thin vertical slices, validating lint/tests at every step.
- **Type Safety Everywhere:** Strict TypeScript plus runtime validation (Zod) for robust inputs/outputs.
- **Performance First:** 10k simulation runs in under one second, both in isolation and via the API.
- **Polished UX:** Minimalist, professional visuals; responsive layouts; smooth interactions.
- **Continuous Verification:** `bun test`, `bun run lint`, and manual spot checks before each commit.

## Phase Roadmap & Milestones

### Phase 1 – Foundation & Tooling
1. Scaffold SvelteKit 5 project via `bunx sv create` with TypeScript strict mode and Bun install.
2. Configure Tailwind, Biome, Vitest, and project scripts (test/lint/format) for consistent quality.
3. Validate Context7 references for SvelteKit 5, Bun, Tailwind, Chart.js, Vitest best practices.

### Phase 2 – Simulation Domain
4. Define domain models and DTOs in `src/lib/types.ts` with exhaustive typings.
5. Implement deterministic helpers in `src/lib/utils.ts` (seedable RNG, math helpers).
6. Build Monte Carlo engine (`src/lib/simulator.ts`) covering histogram data, confidence bands, deal impact metrics.
7. Author Vitest suites ensuring statistical expectations, edge cases, and sub-second performance.

### Phase 3 – API Surface
8. Implement `/src/routes/api/simulate/+server.ts` with Zod validation, structured errors, and performance logging.
9. Add endpoint tests covering valid payloads, validation failures, and regression guardrails.

### Phase 4 – Core UI Components
10. Construct state management + layout in `src/routes/+page.svelte` and `+page.ts`.
11. Build `DealInput`, `DealList` components with validation, optimistic UX, and accessibility.
12. Develop `SimulationResults`, `DistributionChart`, `StatsPanel` components (Chart.js histograms, confidence metrics).

### Phase 5 – Integration & UX Depth
13. Wire front-end to API; add loading, error, and retry flows.
14. Implement scenario persistence (localStorage) and export (JSON/CSV) utilities.
15. Layer in transitions, responsive adjustments, and optional dark mode toggle.

### Phase 6 – Documentation & Final QA
16. Compose comprehensive README (problem, setup, Monte Carlo overview, usage, architecture).
17. Capture screenshots/demo snippets.
18. Final verification: lint, tests, typecheck, performance benchmark, manual UI sweep.

## Success Metrics
- ✅ All lint/tests/type checks pass on CI scripts.
- ✅ 10k simulations complete in <1s on baseline hardware.
- ✅ UI responsive from 320px to >1440px widths.
- ✅ Users can create, save, load, simulate, and export scenarios without runtime errors.

## Open Questions / Research TODO
- Verify latest Tailwind + SvelteKit integration guidance via Context7 before Phase 1 scaffolding.
- Confirm recommended Chart.js Svelte wrapper (if any) or best approach for SSR-safe import.
- Determine optimal binning strategy for histogram (Sturges vs. Freedman–Diaconis) to balance clarity/performance.

## Verification Checklist (Rolling)
- `bun run lint`
- `bun test`
- `bun run check` (TypeScript/Svelte check)
- Manual performance timing for 10k iterations
- Visual regression spot check (light/dark, mobile/desktop)

## Next Step
Proceed with Phase 1 Milestone 1: scaffold the SvelteKit project with Bun, keeping the plan above as the guiding structure. Each milestone will conclude with verification and a descriptive commit highlighting **what** changed and **why**.
