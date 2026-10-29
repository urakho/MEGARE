# World interactions and AI

Use for pushing, cover, barrel chains, summons, navigation, and reset integration. Derived from repeated development corrections and source/tests inspected on 2026-10-29. Recheck current numeric rules before editing.

## Entry points

[Physics](../../../../src/physics.js): `pushBoxChain`, collision/movement helpers, `damageWoodenWall`, `explodeBarrel`, `updateBarrelFuses`, `castRomanBanner`, `updateRomanLegion`.

[Bot](../../../../src/bot.js): `moveSmallSteps`, `updateEnemyAI`, `updateAllyAI`, `buildNavGrid`, `findPath`. [Main](../../../../src/main.js): update order, budgets, `startGame`, `window.startCustomMapMode`. [Map editor](../../../../src/mapeditor.js) and [mode-map](../../../../src/mode-map.js): sizes, placement, spawning.

## Box chains and bounded movement

**Symptom:** boxes push only on one axis, unrelated boxes move, two rows fail, or tank/boxes teleport.

**Cause:** end-position rather than first-contact selection, lateral contact treated as transmission, fractional overlap invoking rescue, or a fractional bot remainder processed as a full step.

**Retained contract:** one moving box has no penalty; every additional moving box multiplies speed by 0.9. Count actual moved boxes. Only forward contact passes a push along a row. Minimum shared-side overlap is one tenth of the smaller relevant side, including equality. A tank contacting two rows can move both. Earlier 0.85 and one-twelfth experiments were superseded.

**Procedure:**

1. Trace displacement through player movement, `pushBoxChain`, and bot `moveSmallSteps`, preserving shared semantics.
2. Reach actual forward contact before joining the next box. A gap cannot remotely activate it.
3. Determine row membership using direction and meaningful side overlap. Nearby lateral/corner contact must not create an L-shaped chain.
4. Move valid rows touched by the tank together, computing the penalty from actual moving boxes.
5. Stop at world bounds, terrain, or applicable unit obstruction without excess displacement or repeated rollback.
6. Correct tiny overlaps locally. Do not conceal numerical errors with random stuck-rescue teleports or broad rounding.
7. Keep the total displacement budget across substeps; a remainder is not another full step.
8. Invalidate navigation/collision data through the established mechanism when obstacles move.

**Verification:** [box-push tests](../../../../tests/box-push.test.js): all axes, diagonal bots, gaps, wall stops, one/two/many boxes, untouched neighbors, exact/below-threshold overlap, mixed sizes, two rows, slight offsets, repeated pushes. Include actual 38-pixel tank and 50-pixel map-box sizes. Assert bounded each-step motion and no accumulating overlap, not merely a final position.

## Destruction and materials

**Symptom:** some attacks ignore wood/boxes, debris remains blocking, or larger visual damage changes HP.

**Cause:** duplicated projectile branches missing cover handling, coupling appearance to damage, or stale terrain in collision/navigation data.

**Procedure:** inspect ordinary/AI/special paths and reuse existing wall damage helpers. Preserve burning, poison, ice, embedding, and shield-mech stone behavior. Keep fractional damage exact even when cosmetic chips are throttled. Separate persistent cover from temporary debris. Artwork details belong in game-visuals; gameplay still needs removal, once-only hits, and navigation invalidation.

**Verification:** [combat-targets](../../../../tests/combat-targets.test.js) and [explosions](../../../../tests/explosions.test.js). Check changed attacks against fresh/damaged/destroyed cover, targets behind it, effects off, and restart. Repeated impacts must not reshape older marks or leave invisible colliders.

## Barrel chains

**Symptom:** barrels disappear without blasts, mech rockets cannot trigger them, chains recurse instantly, or overlaps reset fuses.

**Cause:** attack-specific removal bypasses `explodeBarrel`, recursive processing replaces a simulation fuse, or ignited state is reinitialized.

**Procedure:** route relevant direct hits through one detonation path, including Kamikaze/rocket-mech shots. Retained generated barrels occupy one map cell; editor barrels use its selected cell size. Earlier 1.5/0.85 sizing was superseded. Nearby blasts ignite existing simulation fuses: currently 15 steps/0.25 simulated seconds, superseding 0.5 seconds. Preserve an already burning fuse and detonate once. Inspect ignition before/during physics to avoid counting a step inconsistently. Advance through updates, not recursive calls or wall-clock timers. Pause stops chains; clear/restart removes pending barrels. Effects off must not disable damage. Overlapping blasts must not report death/outcome repeatedly.

**Verification:** explosions tests cover exact fuse boundaries, long chains, overlap, effects off, pre-physics ignition, map clearing, and once-only death. Check visual fuse readability separately when artwork changes.

## Summons and commander behavior

**Symptom:** summons appear in cover, chase forever, attack friends, or melee hits through walls/after escape.

**Cause:** assuming shared drone arrays imply identical behavior, lost commander/team state, point placement for large units, or immediate damage without resolution checks.

**Procedure:** Roman banners/soldiers share `playerDrones`/`enemyDrones` with `romanSummon` tags. Inspect `castRomanBanner`, placement helpers, `updateRomanLegionary`, and expiry. Preserve banner projectile immunity separately from ordinary drones. Keep escort/return behavior alongside combat. Free placement must fit actual mounted dimensions.

Retained composition is three legionaries normally, or four legionaries and one mounted centurion; at most one centurion per group. Read current selection probability/lifetime in source rather than inferring from early requests. Mounted spear/sword attacks need windup, reach, obstruction, and interruption checks.

**Verification:** [roman-legion](../../../../tests/roman-legion.test.js): player/bot casting, ownership, delayed spawn, space limits, escort/return, composition, horse bounds, misses, wall obstruction, freeze interruption, expiry. Rendering belongs in existing tanks helpers rather than a new legion file.

## Navigation and collision invalidation

**Symptom:** bots avoid removed walls, route through moved boxes, or reuse prior-map routes.

**Cause:** stale grids/indices, clearing `navNeedsRebuild` prematurely, or budgeting only one AI path.

**Procedure:** follow flags from movement/destruction through rebuild scheduling. Check normal/custom launches and one-versus-all. Preserve budget across applicable AI paths. A candidate index must retain effective collision order and eligible obstacle types; do not add another cache without a measured need.

**Verification:** [navigation](../../../../tests/navigation.test.js), [collision-index](../../../../tests/collision-index.test.js), [map-obstacles](../../../../tests/map-obstacles.test.js). Compare routes/collisions before/after moving/removing cover and starting a different map. Algorithm changes also need performance measurements.

## Mode/reset integration

Inspect both launch paths for relevant projectile/effect arrays, pending fuses, summons, cooldowns, energy, queues, shields, transformations, and navigation state. Test consecutive battles with dirty old state while preserving upgrades/progression. Training targets and boss AI have special paths; include them when the rule applies. Existing `war` branches are not evidence of a currently exposed mode, though touched branch behavior must remain intact unless requested otherwise.
