# Vehicles and effects

Use for silhouettes, animation, projectiles, freeze artwork, summons, and explosions. These procedures distill repeated failures and corrections from the supplied development history. Entry points were checked against source on 2026-10-29; recheck them after later changes. Historical examples do not override a new explicit design request.

## Source and test map

- [Tanks](../../../../src/tanks.js): `drawTankOn`, `renderGameFrame`, `drawRomanSummon`, `drawRomanRemnant`; search internal projectile types for inline drawing branches.
- [Mechs](../../../../src/mechs.js): mech drawing and preview helpers.
- [Terrain](../../../../src/terrain.js): traces, weather, textures, caches.
- [Physics](../../../../src/physics.js): effect creation, damage, lifespan, cleanup.
- Tests: [bullet-render](../../../../tests/bullet-render.test.js), [explosions](../../../../tests/explosions.test.js), [mech-walk](../../../../tests/mech-walk.test.js), [myasnoy-eye](../../../../tests/myasnoy-eye.test.js), [roman-legion](../../../../tests/roman-legion.test.js).

## Identity and actual scale

**Symptom:** an improved tank is unrecognizable, a phase change looks like another character, or details disappear in combat.

**Cause:** replacing the silhouette, drawing only at enlarged scale, or adding detail without readable primary forms. Repeated requests favored improving an existing texture rather than replacing its identity.

**Procedure:** identify the defining body, propulsion, turret, muzzle, palette, and motif. Adjust weak parts in place. Distinguish materials through a few meaningful planes, edges, and highlights rather than one global glow. An empowered state should retain the base identity unless a redesign is requested. Compare at real battlefield and preview sizes. Check full artwork bounds, including long weapons, shields, biological appendages, and glow; correct framing rather than changing gameplay dimensions to fit a preview.

**Verification:** compare rest, motion, independent aiming, and ability activation on light/dark terrain and among other units. An enlarged gallery alone cannot establish readability.

## Orientation and attachment

**Symptom:** a barrel points backward, gun parts float, wheels snap, or appendages ignore motion.

**Cause:** mixing local/world coordinates, rotating chassis parts with the turret, inconsistent forward-axis assumptions, or unsynchronized clocks.

**Procedure:** trace caller transforms before adding new ones. Establish the forward axis and pivot from existing shapes. Attach the muzzle locally and check projectile spawn direction separately. Preserve independent chassis/turret motion. Reuse movement animation state rather than starting a second clock. Do not stretch a whole model to fix one component.

**Verification:** inspect four cardinal and intermediate directions, turning while firing, diagonal motion, and stopping. Check clipping of long/asymmetric shapes. Changed spawn positions or contact shapes also need mechanics checks.

## Locomotion and traces

**Symptom:** hovering units leave tracks, a biological vehicle moves like a fast insect, or swamp motion draws incompatible footprints and ripples together.

**Cause:** generic tracked-vehicle branches or gait/trace emission disconnected from travel speed and surface.

**Procedure:** inspect current per-type/per-terrain selection. Preserve wheels, tracked chassis, mech footprints, biological feet, hovering types, and ability trails as distinct cases. Drive gait/trace spacing through movement and stop travel marks at rest. Check water contact before adding dry-ground traces. Historical removal of visible mech legs did not authorize removing footprints too. Preserve special traces such as ice tracks and Roman/Egyptian wheel marks unless the request changes them.

**Verification:** compare rest, slow/full motion, turning, and swamp water. Inspect density, fade, and foot contact at actual size. Use mech-walk/myasnoy-eye tests for relevant state changes, plus browser inspection.

## Canvas state and projectile order

**Symptom:** bullets inherit another projectile's color, alpha, glow, or stroke.

**Cause:** a branch relies on incoming Canvas state or fails to restore it. This previously affected many types despite plausible isolated images.

**Procedure:** balance save/restore around each drawing unit and explicitly set required styles. Audit early returns, clipping, composite operations, transforms, and shadows. Inherited helper styles are acceptable only with a clear caller contract. Do not hardcode the observed wrong color elsewhere as a symptom patch.

**Verification:** draw the affected type alone, after a different type, and in reversed order with deliberately different incoming styles. Assert balanced state stacks and restored outgoing values. A no-op save/restore mock cannot reveal leaks. Extend bullet-render tests when state handling changes.

## Animation stages and stable detail

**Symptom:** stationary plasma does not animate, labels jitter, flames miss the symbol contour, or geometry flickers.

**Cause:** position used as the only animation input, noisy text offsets, generic circular overlays, or fresh random material geometry every draw.

**Procedure:** animate deliberate properties using existing time/age state even at rest. Anchor labels to their surface. Fit fire/overlays to the actual contour. Keep fade and decoration separate from damage/lifetime advancement. Use stable per-object variation or caches for material detail; deliberate animation can vary over time without reshaping the whole object randomly.

**Verification:** compare early/middle/late stages at fixed position and in motion. Check expiry through updates, effects settings, and no simulation mutation from drawing. Inspect several actual frames, not just a single screenshot.

## Cold effects communicate different rules

**Symptom:** a slowing hit looks like full freeze or an ultimate does not communicate immobilization.

**Cause:** merging slow/full-freeze overlays or changing mechanics while improving artwork.

**Procedure:** inspect distinct states. Retained design separates icicle-like slow artwork from a surrounding irregular ice block for full freeze. Improve readability without turning normal hits into full freeze. Avoid hiding orientation/HUD with an oversized 3D cube when refining the current flat style. Stable irregularity may vary by target/state without frame flicker.

**Verification:** inspect projectile slow, immediate ultimate freeze, thawing, and overlapping effects. Pair visuals with paralysis/combat-target checks if state selection changes.

## Explosions and summoned fighters

**Symptom:** a larger blast changes damage, excluded tank death art changes, or soldiers look tiny in battle.

**Cause:** coupling artwork to gameplay radius, editing a generic helper used by excluded events, or judging enlarged portraits only.

**Procedure:** identify the event type before changing shared effects. Preserve explicit exclusions. Separate fireball extent, debris, smoke, and shockwave from damage. Keep legion art in the existing tanks renderers rather than restoring a removed standalone renderer. Check horse/soldier proportions against real unit bounds. Use current attack state for windup/follow-through rather than inventing unrelated attack timing.

**Verification:** explosions tests cover radii, settings, state restoration, and cleanup. Roman legion tests cover attack state. Inspect soldiers beside their commander, escorting, and attacking at actual scale.

## Integration review

| Surface/state | Checks |
| --- | --- |
| Battlefield | Aim, silhouette, contrast, overlap, size, clutter |
| Card/detail/reward when affected | Framing, consistent image, no clipped parts |
| Several stages and directions | Anchoring, continuity, no flicker |
| Mixed projectiles | Independent styles and readable types |
| Pause/restart/effects off | Cleanup and unchanged gameplay |
| Dismiss/reopen/hide page | No orphan loops or accumulated callbacks |

A temporary gallery may invoke current helpers with controlled state; it must not become a duplicate production renderer. Inspect actual integration as well and remove only artifacts created for the current task.
