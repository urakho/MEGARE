---
name: bugfix-regression
description: Diagnose and repair MEGARE crashes, broken combat, input, rendering, restart state, maps, profiles, or rewards with focused regression checks. Use first for reported defects; keep analysis-only requests read-only. Use performance-profiling first for lag.
---

# MEGARE bug fixes and regressions

Restore intended behavior through a demonstrated cause and a focused correction. An audit request does not authorize implementing every proposed improvement.

Read [AGENTS.md](../../../AGENTS.md), relevant [Architecture](../../../docs/ARCHITECTURE.md) and [Game design](../../../docs/GAME_DESIGN.md) sections, and [Development](../../../docs/DEVELOPMENT.md). Consult matching [Regression scenarios](references/regression-scenarios.md) for specific failure patterns and tests.

## Diagnose

1. Inspect Git status and current source. Preserve existing modifications, tests, screenshots, and temporary-looking files from earlier work.
2. Record the shortest reproduction: screen/mode, vehicle, actor/team, terrain, input, prior battle/menu actions, actual result, expected result, and console trace when present.
3. Separate a reproduced defect, a plausible source-level concern, and a requested design change. Label uncertainty; an old complaint does not prove the current version is broken.
4. Trace entry to outcome through the participating initialization, input/AI, update, physics, render, and save paths. Search all relevant assignments and callers.
5. Reproduce in the closest existing harness or a minimal browser scenario. Add a failing regression check before the fix when practical, then verify it passes after correction.

## Fix the cause

- Prefer a local correction. A missing reset, inherited Canvas style, duplicate hit, or wrong guard rarely needs a replacement subsystem.
- Inspect classic-script order in `index.html`. Declaring a function that uses a later global can be valid; invoking it before that dependency exists is different.
- Browser global semantics matter: a top-level function and `window.someName` may be the same binding. An exported wrapper can replace the function it calls and recurse. Test with `window` equal to the VM global where applicable.
- Keep time-dependent gameplay in its simulation path. Draw frequency, wall-clock windows, or arbitrary timers can skip/duplicate effects.
- Check ordinary and custom-map resets plus delayed callbacks that might mutate a later battle.
- Consult tank-mechanics for control/target/collision rules and game-visuals for drawing details. Do not load every reference because the defect occurs in a large file.

## Regression tests

Tests use built-in `node:test`, assertions, VM contexts, and source extraction. Extend the nearest existing test file without adding dependencies.

1. Execute actual affected source or its relevant section; assert source markers exist.
2. Mock only required facilities. Preserve critical semantics: global aliases, Canvas stacks, shared arrays, controlled time, or storage ownership.
3. Assert observable results/invariants: position, HP, cooldown, one callback, saved value, unaffected neighbor, bounded displacement.
4. Cover the regression boundary and relevant adjacent valid case. Do not mock away the defective operation.
5. When extraction fails after changing declarations, distinguish a stale fixture from a real runtime failure. Do not weaken assertions merely to get a green result.

Run focused tests, syntax checks on changed scripts, and the full suite for shared combat/state/startup/rendering changes. Historical test counts are not evidence about this run. Browser checks should reproduce the actual input/menu sequence; mocked tests cannot prove visual quality, real events, storage compatibility, or audio playback.

## Finish

Review the diff and run `git diff --check`. Update affected documentation when correcting documented behavior or a documented misconception. Report cause, resulting behavior, exact checks/results, and remaining uncertainty. If browser verification is unavailable, complete supported checks and state the limit rather than claiming full verification.
