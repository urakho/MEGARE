# Measurement scenarios

Use scenarios relevant to the complaint. These lessons and entry points were checked against development history/source on 2026-10-29. Historical FPS and synthetic timings are not targets or current measurements.

## Record an equivalent comparison

| Field | Detail |
| --- | --- |
| Environment | Browser/version, viewport/device scale, CPU/device or throttle |
| Scenario | Screen/mode, map, vehicle, terrain, object/unit load, settings |
| Actions | Open/close, movement/fire, page visibility, pause/restart |
| Measurement | Tool, duration, warm-up, samples, phases/frame intervals |
| Correctness | Gameplay/lifecycle checks and executed tests |
| Conclusion | Supported gain, regression, noisy result, or static hypothesis |

Keep overhead comparable, avoid per-frame logging, and warm caches consistently. Use the same supported custom map or controlled fixture when random maps prevent comparison. Retain optimizations supported by benefit and correctness; do not build a framework merely to manufacture a benchmark.

## Menu lag before combat

**Symptom:** menu stutters and combat-only optimization does not help.

**Cause to investigate:** hidden previews, redundant drawing, animated full-screen CSS, or other presentation callbacks.

**Procedure:** record unopened menu, characters opened/scrolled, mech tab, menu closed, and battle entered. Inspect rAF owners, visibility, and backdrop invalidation in [main](../../../../src/main.js), [tanks](../../../../src/tanks.js), [mechs](../../../../src/mechs.js), and [index](../../../../index.html). A callback returning immediately but scheduling another frame remains active work.

**Verification:** compare the same browser-recorded sequence. [Performance-loops](../../../../tests/performance-loops.test.js) and [background-loop](../../../../tests/background-loop.test.js) cover stop/resume, shared previews, and no second world scheduler. Repeated reopening must neither accumulate callbacks nor prevent resume.

## Preview lifecycle

**Symptom:** performance worsens after a tab visit, detail close, or reward replacement.

**Cause to test:** a shared card loop stops but independent mech/detail/reward loops remain.

**Procedure:** inspect rAF/cancel/timer owners, not just the nearest helper. Current character cards use shared visibility tracking and mech-card helpers draw one frame. Inspect separately owned detail/reward previews. For `ContainerArt`, check shop/opening visibility and hidden-page handling. One battlefield loop does not require merging all presentation loops into it.

**Verification:** repeatedly open/close/replace each affected surface, switch tabs, and hide/show. Observe callback ownership and work; test cancellation and correct resumption. [Bug-fixes](../../../../tests/bug-fixes.test.js) covers replaced reward previews. A screenshot cannot establish lifecycle behavior.

## Battlefield update versus render

**Symptom:** combat stutters with unknown AI/physics/drawing contribution.

**Procedure:** use the profiler in [Development](../../../../docs/DEVELOPMENT.md#performance-diagnosis). Compare update/render, then nested AI/physics without summing nested costs twice. Browser traces cover layout/paint/GPU outside wrappers. Record simulation load and displayed intervals separately. Trace `gameLoop`, `window.renderActiveGameFrame`, and `renderGameFrame`. Fixed-step catch-up limits affect gameplay time; changing them requires correctness checks. Do not restore independent world scheduling or advance simulation in drawing.

**Verification:** [startup](../../../../tests/startup.test.js), performance-loops, [critical-fixes](../../../../tests/critical-fixes.test.js). Check slow frames, pause/resume, visibility accumulator reset, result transitions, and scheduling count. Include real browser global alias semantics to detect export recursion.

## Cache creation, copying, and invalidation

**Symptom:** a cache helps a synthetic scene but hurts constrained CPU or clips/fixes animation.

**Historical lesson:** a tank-image cache was removed after large-image copying worsened weak-CPU results. Existing terrain/effect caches remain useful; this does not prohibit all caching.

**Procedure:** compare direct drawing against creation, copying, and invalidation. Inspect dimensions, scale, angle/state keys, hit rate, and dynamic abilities. Avoid unbounded cached intermediate states. Reuse current surfaces where suitable. Check preview bounds/dynamic overlays so optimization does not freeze or crop artwork.

**Verification:** normal/constrained CPU, static/moving/turning units, idle/active abilities, effect settings, scales. Use relevant bullet-render/terrain/explosion tests plus actual browser timings. Preserve culling and cached backdrop behavior.

## Resource display and storage

**Symptom:** repeated serialization/writes appear despite unchanged amounts.

**Cause to investigate:** saving every draw or invalidating the guard unnecessarily.

**Procedure:** inspect `updateCoinDisplay`, `_lastDisplayedResources`, and `saveProgress`. Current unchanged-resource calls already skip repeated updates/saves. Preserve explicit saving for unlocks/upgrades/profiles outside those comparisons. Inspect currency conversion DOM work if traces point there rather than assuming the historical storage bug still exists.

**Verification:** [resources](../../../../tests/resources.test.js) and critical-fixes. Count writes for unchanged/changed values, purchases/rewards, profile switch, and reload. Fewer calls alone do not prove persistence correctness.

## Crowded maps, AI, and collisions

**Symptom:** custom-map load costs much more than ordinary combat.

**Procedure:** measure enemy AI, allied AI, and physics under equivalent loads. Inspect `buildNavGrid`, `findPath`, budgets, terrain index creation/query, and target scans. Read current legal editor limits in [mapeditor](../../../../src/mapeditor.js) instead of copying old counts. Optimize measured loops with existing structures first. Include index build/invalidation costs and maintain collision order/types, rebuilds after cover changes, and shared AI budgets. Early search exit must not cause repeated-search storms.

**Verification:** [navigation](../../../../tests/navigation.test.js), [collision-index](../../../../tests/collision-index.test.js), [map-obstacles](../../../../tests/map-obstacles.test.js), [box-push](../../../../tests/box-push.test.js). Compare routes/results before/after cover changes. Report synthetic Node timing separately from browser FPS; it excludes drawing and full-game work.

## Audio retries

**Symptom:** repeated rejected playback promises appear in an idle profile.

**Cause to test:** `updateMusic` attempting playback every update after autoplay denial.

**Procedure:** inspect `_tryPlayMusic`, retry/backoff, and interaction listeners before changing behavior. Preserve volume, mode switching, and retry after user interaction. Do not add listeners every update or suppress audio permanently as an optimization.

**Verification:** performance-loops includes blocked retry checks. In-browser, begin without interaction, interact, pause/resume, change modes, and inspect rejection handling. State whether real audio playback was exercised.

## Cleanup and conclusion

Track temporary files/processes created for measurements. Prefer isolated temporary browser profiles. Remove only owned artifacts after checking paths; existing profiles/screenshots under tests are not automatically disposable. Run relevant checks and `git diff --check`, review the final diff, and report comparable before/after evidence. If inconclusive, say so. Supported diagnostic workflow changes belong in existing documentation rather than a new benchmark framework by default.
