# Environment and UI

Use for biome surfaces, obstacles, damage presentation, containers, currency, and layout. These procedures preserve retained decisions from the supplied history, checked against source on 2026-10-29. New explicit requirements can change them.

## Entry points

- [Terrain](../../../../src/terrain.js): `GameTerrain`, texture/trace caches, weather.
- [Tanks](../../../../src/tanks.js): world obstacles, embedded artwork, effects, descriptions.
- [Physics](../../../../src/physics.js): `damageWoodenWall`, `updateWoodenWallBurn`, `updateWoodenWallRot`, `updateWoodIceImpact`, `addEmbeddedProjectile`, `explodeBarrel`.
- [Containers](../../../../src/container-art.js), [currency](../../../../src/ui-icons.js), [styles](../../../../style.css), [page](../../../../index.html).
- Tests: [terrain](../../../../tests/terrain.test.js), [explosions](../../../../tests/explosions.test.js), [combat-targets](../../../../tests/combat-targets.test.js).

## Stable biome materials

**Symptom:** moving boxes change grain, walls look like ladders, every snow cap is identical, or forest dirt reads poorly.

**Cause:** fresh randomness on draw, position-based seeds, conspicuous repeated motifs, or emphasizing slats instead of solid construction.

**Procedure:** inspect caches/seeds and object identity. Keep the same object's pattern during movement and neighboring impacts. Preserve recognizable cross-bracing on boxes while improving grain. Differentiate forest, snow, desert, swamp, and rain through materials, deposits, and wetness. Retained rain wood is the forest-like material with wet treatment, not an unrelated palette. Vary snow/sand deposits stably per object while keeping base material readable. Wooden walls need solid construction and local fibers/breaks rather than ladder-like bars. Keep artwork separate from biome modifiers; night remains implemented but excluded from ordinary random selection.

**Verification:** inspect neighboring objects, a moving box over multiple frames, editor previews, camera movement, and each affected biome. Run terrain tests when selection/traces/caches change. If real wood species are explicitly requested, research them rather than inventing botanical claims.

## Local damage and stable earlier marks

**Symptom:** every hit uniformly shrinks a wall, old holes change shape after another impact, or all weapons look equally forceful.

**Cause:** deriving geometry afresh from total HP, rerandomizing old marks, or ignoring local impact severity.

**Procedure:** use existing localized impact state and retain earlier geometry. Do not equate low total HP with the latest small bullet's force. Keep stone chunks different from wooden fibers/splinters. Rocket-mech impacts can produce larger visual wood damage without increasing HP damage. Preserve exact fractional damage when throttling cosmetic chips.

**Verification:** hit fresh/weakened walls from different sides with small/large attacks. Compare HP separately from drawing. Explosion/combat-target tests cover local shapes, duplicate debris, and effect cleanup.

## Fire, rot, ice, and snow

**Symptom:** burned wood looks pristine when fire ends, poison looks like a single hit, or icy destruction leaves collision ghosts.

**Cause:** transient overlays without persistent material state, periodic damage disconnected from artwork, or debris reused as blocking terrain.

**Procedure:** preserve charring after flames end. Burning snow-covered wood removes its snow persistently for that wall. Show ongoing rot while poison damage runs; final destruction crumbles as rotten material rather than fresh splinters. Ice should form a local irregular crust, fracture, and leave icy wood fragments. Keep destruction/lifetime in update/cleanup paths; debris is presentation, not replacement cover. Preserve weather-dependent burn rules while changing animation.

**Verification:** inspect initial hit, ongoing status, post-status wall, and destruction. Check overlap/repeated attacks, effects off, and restart. Assert actual collider removal and expiry through tests; a screenshot cannot reveal collision ghosts.

## Embedded projectiles

**Symptom:** spears shrink, float above a surface, lose artwork, or disappear from wood too soon.

**Cause:** generic replacement markers, lost dimensions, or one lifetime policy applied to both vehicles and walls.

**Procedure:** inspect `addEmbeddedProjectile` and draw/update callers. Preserve original artwork, size, and angle. Hide the tip inside the impacted surface so it reads as penetration. Attach marks in target coordinates so moving/turning vehicles carry them. Current wood marks remain until wall destruction; vehicle marks expire. Earlier temporary-wall-mark behavior was superseded.

**Verification:** compare immediately before/after impact at several angles, move/rotate a target, hit the wall again, destroy it, and restart. The cosmetic mark must not keep applying projectile damage.

## Container geometry and labels

**Symptom:** containers resemble ambiguous flat boxes, types look identical, or writing jumps during animation.

**Cause:** inconsistent perspective planes, one generic palette, or labels under noisy transforms.

**Procedure:** use current `ContainerArt` shared by cards/opening flow. Align corners/edges into coherent front, side, and lid. Differentiate types through hardware, material, shape, and emblem as well as color. Preserve the parts container's crate identity. Anchor writing without abrupt independent movement. Inspect existing type/stage parameters rather than building another opening system. Payments/reward generation remain in main.

**Verification:** inspect changed types at actual card size and throughout opening. Switch tabs, close/reopen, replace the flow, and hide/show the page. No callback accumulation; no changed costs, slots, or free-container queue.

## Currency and emoji

**Symptom:** replacing icons removes meaning, changes avatars, or gives everything a turquoise diamond outline.

**Cause:** treating a currency reference as permission for a global icon replacement. The history tried a general custom set, then explicitly reverted it.

**Retained baseline:** most interface symbols remain emoji. Currency symbols next to amounts use local SVG artwork through CSS and `ui-icons.js`. Avatar and marked emoji contexts are protected. Deleted general icon files are not current entry points.

**Procedure:** inspect amount detection, skipped contexts, accessible labels, and dynamic text insertion. Preserve amounts and meaning. For a newly requested icon redesign, constrain its affected set and semantic colors; do not silently replace unrelated emoji. Inspect generated markup as well as HTML/CSS for layout work.

**Verification:** check counters, prices, rewards, dynamic updates, profile names/avatars, and literal emoji contexts. Verify no duplicate nodes or altered amounts. At small sizes, readable silhouette and semantic fit come before detail.

## Descriptions and populated layout

**Symptom:** a stat panel contradicts combat, prose becomes a parameter dump, or values overflow a modal.

**Cause:** updating only one representation or treating atmospheric prose and numeric fields identically.

**Procedure:** synchronize numeric panels with actual mechanics; keep prose expressive and accurate without every exact value. Inspect mech-specific modals too. Fix spacing/framing rather than silently removing useful statistics.

**Verification:** inspect populated modals at actual viewport sizes, including narrow/touch layout when affected. Check units, wrapping, headings, buttons, and scroll behavior. An empty template is insufficient evidence that all values fit.
