# Regression scenarios

Use the matching scenario, not this entire checklist for every defect. These patterns come from repeated development fixes and source/tests inspected on 2026-10-29. They describe diagnosing recurrence, not a claim that historical bugs remain present.

## Startup and recursive rendering

**Symptom:** missing `syncResultOverlay`, stack overflow in a render export, or tests pass while browser startup crashes.

**Cause:** work begins before later scripts load, or a wrapper replaces the browser-global binding it calls.

**Procedure:** inspect [script order](../../../../index.html), [main startup](../../../../src/main.js), and `draw`, `renderGameFrame`, `window.renderActiveGameFrame` in [tanks](../../../../src/tanks.js). Preserve dependency order and one battlefield scheduler. Determine why a dependency is missing instead of swallowing errors indefinitely.

**Verification:** [startup](../../../../tests/startup.test.js) and [performance-loops](../../../../tests/performance-loops.test.js). Set `context.window = context` for alias semantics. Assert initial/subsequent renders and callback count, then launch the browser if available.

## Canvas state leaks

**Symptom:** bullets change color according to other attacks.

**Cause:** inherited styles or unbalanced restore.

**Procedure:** follow caller/helper state, isolate branches, and set used styles explicitly. Do not patch an observed wrong color elsewhere.

**Verification:** [bullet-render](../../../../tests/bullet-render.test.js): alone, after another type, reversed order, different incoming styles, restored state. A no-op Canvas mock is insufficient. Inspect mixed combat visually when possible.

## Simulation timing and pause

**Symptom:** duel damage repeats at one instant or never happens, abilities expire paused, or resume triggers excessive updates.

**Cause:** narrow `Date.now()` windows, wall-clock timers for simulation, or retained paused accumulator time.

**Procedure:** distinguish scheduling from simulation. Inspect frame counter, accumulator resets, guards, and update/render separation. Preserve fixed-step/catch-up policy unless a required correction changes it. Do not improve FPS by slowing gameplay.

**Verification:** [bug-fixes](../../../../tests/bug-fixes.test.js), [critical-fixes](../../../../tests/critical-fixes.test.js), performance-loops. Control time; repeat updates at one wall time, simulate slow frames, pause/resume, and hide/show. Assert total simulated damage/time and bounded catch-up.

## State crossing battle boundaries

**Symptom:** old effects reappear, mech queues/energy survive custom restart, or shields/forms remain active.

**Cause:** reset in `startGame` omitted from `window.startCustomMapMode`, uncleared arrays, or callbacks from an earlier battle.

**Procedure:** inventory feature state and find creation/reset/expiry. Start with dirty state rather than defaults that hide omissions. Separate combat from saved progression. Inspect callback ownership/cancellation.

**Verification:** bug-fixes, critical-fixes, and affected ability tests. Cover ordinary restart, custom restart, menu/start, and transformation exit where applicable. Assert timers, arrays, protection, queues, and resources reset without erasing upgrades.

## Box movement

**Symptom:** axis-specific failures, lateral chains, overspeed, overlap, or teleportation.

**Cause:** wrong contact membership, threshold, fractional remainder, or rescue masking numerical overlap.

**Procedure:** trace player movement, `pushBoxChain`, and bot `moveSmallSteps`. Consult tank-mechanics world guidance for the retained contract. Fix locally rather than replacing physics or broadly rounding coordinates.

**Verification:** [box-push](../../../../tests/box-push.test.js): all directions, overlap boundary, gaps, two rows, real dimensions, repeated pushes, diagonal bots, bounded steps. Preserve 0.9 multiplier/one-tenth overlap unless a rule change is requested.

## Wrong attacks or status meanings

**Symptom:** Egyptian bots fire ordinary bullets, drones ignore one actor, waterjet paralyzes, or ordinary ice fully freezes.

**Cause:** fallback branches, actor-specific target loops, conflated flags.

**Procedure:** inspect player/enemy/ally activation and resolution separately. Use tank-mechanics combat guidance for eligibility/control priority. Clearing contact suppression must preserve independent effects.

**Verification:** [combat-targets](../../../../tests/combat-targets.test.js), [paralysis](../../../../tests/paralysis.test.js), [reload](../../../../tests/reload.test.js). Assert positive and negative outcomes: damage to eligible targets, friends/protected targets spared, intended slow movement, full-freeze guards.

## Map import and editor/play disagreement

**Symptom:** name collisions overwrite maps, malformed objects throw, valid obstacles disappear near spawn, or saved play uses another map's messages.

**Cause:** trusting imported shape, destructive spawn cleanup masking invalid placement, or restoring only some saved fields.

**Procedure:** inspect [mapeditor](../../../../src/mapeditor.js) validation/import/load and main's custom launch. Validate existence/type, finite dimensions/coordinates, and bounds according to the current format before dereferencing. Preserve both maps on name collision. Keep blocked-spawn validation consistent across placement order, import, and launch. Do not delete valid authored obstacles as a workaround.

**Verification:** bug-fixes and [map-obstacles](../../../../tests/map-obstacles.test.js): null objects, invalid dimensions, blocked spawn, name collision, valid adjacent cover, selected messages, save/load/import/restart. Check actual `.meg` file interaction in-browser when affected.

## Profiles, purchases, persistence

**Symptom:** creating a profile changes the old title, upgrades vanish after reload, or a mech purchase button does nothing.

**Cause:** mutating active-profile globals during new-profile preparation, missing snapshot/save paths, or inconsistent ownership/events.

**Procedure:** inspect `PROFILE_SAVE_KEYS`, profile transitions, `saveProgress`, purchase handlers, and mech-specific UI. The resource display guard is not a universal dirty-state tracker: unlocks/upgrades/selections still need explicit saves. Reproduce with isolated test storage/profile rather than wiping real saves.

**Verification:** critical-fixes, [mech-purchase](../../../../tests/mech-purchase.test.js), [resources](../../../../tests/resources.test.js). Switch away/back and reload; assert old profile unchanged, cost/ownership saved once, settings/maps preserved.

## Results, containers, and replaced previews

**Symptom:** displayed reward differs from awarded currency, repeated render repeats bonuses, cancellation loses free containers, or replaced reward art keeps animating.

**Cause:** result presentation mutates progression, weak once-only guards, wrong queue consumption, or an independent preview not canceled.

**Procedure:** trace base combat awards alongside [win-lose](../../../../src/win-lose.js) bonuses and main's opening queue. Do not assume rendering is read-only. Inspect repeat synchronization, replacement, and close actions rather than first display alone.

**Verification:** bug-fixes/critical-fixes: repeated results, qualifying/nonqualifying boss outcomes, display versus saved reward, free queue cancellation/reload, paid deductions, replacement, and close/reopen. Assert both old animation cancellation and the next animation starting once.

## Reporting evidence

Record reproduction, confirmed/likely cause, affected paths, correction when authorized, and exact checks. Distinguish browser behavior, isolated VM results, and static inference. Historical counts/FPS are not fresh evidence. Broad audits should prioritize confirmed defects rather than changing every large function.
