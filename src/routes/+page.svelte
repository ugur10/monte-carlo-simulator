<svelte:head>
	<title>Monte Carlo Sales Pipeline Simulator</title>
</svelte:head>

<main class="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl flex-col justify-center gap-12 px-6 py-24">
	<section class="space-y-5">
		<span class="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-surface/60 px-4 py-1 text-xs font-medium uppercase tracking-[0.32em] text-primary/80 backdrop-blur">
			<span class="h-1 w-1 rounded-full bg-primary/80" aria-hidden="true"></span>
			Phase 1 · Foundation
		</span>

		<h1 class="text-balance text-4xl font-semibold leading-tight text-white md:text-5xl">
			Monte Carlo sales forecasting with startup-grade polish
		</h1>
		<p class="max-w-2xl text-balance text-base text-slate-300 md:text-lg">
			We&apos;re laying the groundwork for a high-performance simulation experience: modern SvelteKit 5
			architecture, Bun runtime, strict TypeScript, and a Tailwind-powered design system primed for a
			polished YC-ready product.
		</p>
	</section>

	<section class="grid gap-6 md:grid-cols-2">
		<div class="rounded-[var(--radius-card)] border border-white/10 bg-surface/80 p-6 shadow-[var(--shadow-card)] backdrop-blur">
			<h2 class="text-lg font-semibold text-white">What&apos;s shipping next</h2>
			<ul class="mt-4 space-y-3 text-sm text-slate-300">
				<li class="flex items-start gap-2">
					<span class="mt-1 h-1.5 w-1.5 rounded-full bg-primary/80" aria-hidden="true"></span>
					Vitest test harness and simulation domain types
				</li>
				<li class="flex items-start gap-2">
					<span class="mt-1 h-1.5 w-1.5 rounded-full bg-primary/80" aria-hidden="true"></span>
					Pure TypeScript Monte Carlo engine with statistical guardrails
				</li>
				<li class="flex items-start gap-2">
					<span class="mt-1 h-1.5 w-1.5 rounded-full bg-primary/80" aria-hidden="true"></span>
					API route for fast, server-side simulations
				</li>
			</ul>
		</div>

		<div class="rounded-[var(--radius-card)] border border-white/5 bg-gradient-to-br from-surface/90 via-surface-strong/80 to-surface-muted/60 p-6 shadow-[var(--shadow-card)] backdrop-blur">
			<h2 class="text-lg font-semibold text-white">Why this matters</h2>
			<p class="mt-4 text-sm text-slate-300">
				Pipeline forecasting deserves more than spreadsheets. Tailwind gives us a composable design system,
				Bun keeps builds instant, and SvelteKit lets us ship a truly interactive experience with zero cruft.
			</p>
			<p class="mt-4 text-sm text-slate-300">
				This foundation commit keeps the repo production-grade from day one—ready for simulation logic,
				visualizations, and scenario management to plug in without rework.
			</p>
		</div>
	</section>
</main>
