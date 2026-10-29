---
name: performance-profiling
description: Diagnose MEGARE lag, low FPS, stutter, hidden animation work, expensive Canvas drawing, AI navigation, collisions, saves, or audio retries. Measure before optimizing and preserve gameplay timing and behavior.
---

# MEGARE performance profiling

Find expensive work in the user's actual scenario, make a focused improvement, and compare equivalent measurements. File size, synthetic timing, and historical FPS claims do not establish today's bottleneck.

Read [AGENTS.md](../../../AGENTS.md), [Architecture](../../../docs/ARCHITECTURE.md), and [Development performance guidance](../../../docs/DEVELOPMENT.md#performance-diagnosis). Consult relevant [Measurement scenarios](references/measurement-scenarios.md).

## Establish a baseline

Inspect source, Git status, and relevant tests. Determine where lag begins: unopened main menu, character tab, container flow, normal battle, or crowded custom map. An analysis-only request remains read-only.

Record browser, viewport/device scale, CPU throttling, vehicle, map/unit load, terrain, effect settings, visible UI, pause state, interaction sequence, and measurement duration. Keep them equivalent before/after. Different generated maps are not automatically comparable; use the same supported map or controlled fixture when possible.

## Use the existing profiler

In an actual browser session:

```js
window.startGamePerformanceProfile();
// Exercise the recorded scenario for the chosen interval.
window.stopGamePerformanceProfile();
```

Start resets/enables counters. Stop disables them and returns per-phase `count`, `averageMs`, and `maxMs`, or `null` if inactive. Current phases include `update`, `render`, `enemyAI` (also boss AI), `allyAI`, and `physics`.

- AI/physics are nested inside update; do not sum them into update again.
- Counts measure calls, not displayed frames; fixed-step catch-up can update several times per render.
- These timings cover instrumented JavaScript, not total layout, paint, GPU work, or end-to-end FPS.
- Use browser performance recordings/frame timing for those other costs and independent menu/preview loops.
- Record scenario and duration with results. Repeat enough to distinguish noise; do not promise an arbitrary FPS threshold.

## Optimize and compare

1. Locate work actually running in the scenario. Inspect hidden previews and duplicate callbacks before optimizing combat to solve menu lag.
2. Change one supported cause at a time and measure again. Preserve resource guards, collision order, navigation invalidation, culling, and cleanup.
3. Reuse caches/indices when measured work justifies them. Include creation, invalidation, copying, memory, and weak-CPU costs in the comparison.
4. Test normal and constrained CPU conditions for rendering changes intended to help weak devices. A historical tank-image cache was removed because copying large images worsened that case: measure rather than banning all caches.
5. Verify simulation timing, pause/resume, restart, targeting, and collision outcomes. Skipping required gameplay is not a successful optimization.
6. Remove only your own temporary instrumentation unless requested as a supported tool. Preserve pre-existing profiles, screenshots, and artifacts.

Run relevant lifecycle, navigation, collision, resource, or startup tests and syntax checks; run the full suite for shared-loop changes. Inspect repeated window opening/closing and page hiding in the browser when lifecycle changes.

Report equivalent before/after measurements with method and scenario. Separate synthetic algorithm timings from whole-game FPS. Without browser measurements, report static findings and executed checks without claiming an FPS gain. Update development/architecture documentation if the supported workflow or boundary changed.
