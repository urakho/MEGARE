# Combat and status

Use for damage, cooldowns, energy, control, targeting, and abilities. Source/test entry points were checked on 2026-10-29. Values below explain regressions; reread current source instead of treating this as a balance table.

## Trace the entire attack

Start in [physics](../../../../src/physics.js) with `shoot`, `updateSpecialProjectiles`, `updatePhysics`, and the internal type. Inspect player activation in [main](../../../../src/main.js), both AI paths in [bot](../../../../src/bot.js), creation in [mode-map](../../../../src/mode-map.js), and presentation in [tanks](../../../../src/tanks.js)/[mechs](../../../../src/mechs.js).

Record initiator, owner/team, target shape, application time, and removal. Beams, clouds, contact, mines, and delayed barrages do not necessarily use ordinary bullet processing.

## Damage units and reload multipliers

**Symptom:** damage differs unexpectedly by actor/target, a per-second attack becomes stronger, or faster reload becomes slower.

**Cause:** mixing per-step/per-second values, pellet versus volley totals, base versus upgraded damage, or cooldown duration versus decrement speed.

**Procedure:**

1. Locate the stored value and modifiers: upgrades, protection, terrain, ability state, and developer god mode when relevant.
2. Derive continuous damage over a simulated interval from its actual application frequency. Do not divide by 60 if time is already scaled there.
3. Distinguish projectile damage, emitted count, spacing, burst duration, and recovery.
4. Read `getTankShotCooldown` and `getEntityFireCooldownStep`. Duration depends on both initial cooldown and decrement, with special counters for some weapons.
5. Increasing rate by factor r divides duration by r; shortening duration by p multiplies it by 1-p. Resolve consequential ambiguity before changing balance.
6. Terrain reload factor advances cooldown progress: rain currently uses `1 / 1.05`, lengthening duration.

**Verification:** compare base and relevant modified values, player/enemy/ally emission, total interval damage, and complete reload time. Synchronize UI after confirming actual behavior.

## Reload, bursts, and heat

**Symptom:** bots and player reload differently, sustained fire cuts out, or the bar says ready while firing is blocked.

**Cause:** separate AI constants, treating burst state as ordinary cooldown, or using the wrong display timer.

**Procedure:** reuse shared cooldown calculations where applicable while preserving flamethrower burst accounting, waterjet active duration/reload, Myasnoy spray versus eye behavior, and machinegun heat/recovery. Do not reset a timer every frame while held input should sustain fire. Machinegun display follows overheat recovery; Illuminat's follows beam cooldown rather than active beam lifetime. Current bars are for player/allies, hidden for enemies and all mech types. Hiding a bar does not remove a firing constraint.

**Verification:** hold fire stationary/moving, release/repress around recovery, compare last shot, cooling, interruption, and next activation. Use [reload tests](../../../../tests/reload.test.js) for shared values, bursts, and display behavior.

## Distinct control effects

**Symptom:** a normal ice hit fully freezes, frozen AI escapes, or drill suppression persists after contact ends.

**Cause:** conflated flags, movement/AI before control guards, or clearing another effect's timer.

| Effect | Current rule |
| --- | --- |
| Ice projectile | Slow without full freeze |
| Ice ultimate/field | Full freeze blocks movement/firing; immediate application prevents escape first |
| Ordinary paralysis | Blocks firing/weapon abilities; movement and AI retreat remain possible |
| Burovoy contact | Suppresses attacks while touched; its contribution clears on release |
| Mech power stun | Stops movement/firing while energy regenerates |
| Waterjet | Damage/pushback without paralysis |

**Procedure:** trace state writes, decrement, firing/movement guards, and AI decisions. Do not fix ice by blocking movement for all paralysis. Preserve independent effects when releasing drill contact, including shorter or longer remaining paralysis. Respect current update order; changing it is observable gameplay.

**Verification:** [paralysis](../../../../tests/paralysis.test.js) and [combat-targets](../../../../tests/combat-targets.test.js). Check each actor, contact/release, immediate freeze, overlapping independent effects, expiry, and held-input bypasses.

## Mech depletion

**Symptom:** depleted mechs keep acting, remain stunned forever, or custom-map restart retains energy/queued shots/shield state.

**Cause:** inconsistent `updateMechPower` calls, repeatedly restarting low-energy stun, or missing reset fields.

**Procedure:** inspect energy before regeneration, depletion latch/rearm, stun decrement, queued fire, shield, max energy, and upgrades. Preserve regeneration during stun. Use mech metadata rather than ordinary-tank fallback stats. Check both launch paths. Energy is not ordinary tank heat.

**Verification:** cross the depletion threshold, stay low, recover, deplete again, pause/resume, and normal/custom restart. Use paralysis, reload, and [bug-fixes](../../../../tests/bug-fixes.test.js) tests with dirty prior state.

## Hostility and repeated hits

**Symptom:** drones ignore some weapons, bot electric ultimate misses the player, friends take damage, or piercing shots repeatedly hit one target.

**Cause:** iterating enemies only, assuming player ownership, wrong projectile type, or missing per-target bookkeeping.

**Procedure:** inspect eligible collections and existing `forEachHostileDrone`/drone damage helpers. Check owner/team, shields/protection, and hit history in ordinary bullet, beam, cloud, blast, chain, and melee routes separately. Copy/reflection should preserve relevant artwork/dimensions/damage while intentionally updating ownership, without mutating an original template.

**Verification:** player to enemy; enemy to player; ally to enemy; hostile/friendly drones; eligible summons; boxes/wood/barrels. Include repeated overlap and piercing re-entry. Assert eligible damage and spared friends/protected targets with combat-target tests.

## Clouds, delayed attacks, and forms

**Symptom:** poison does direct impact damage, cloud overlap multiplies damage, barrage resolves twice, or eye-form hit area disagrees with drawing.

**Cause:** leaving ordinary contact damage active, processing each cloud independently, collection mutation during resolution, or obsolete transformed geometry.

**Procedure:** toxic projectiles currently rely on cloud poison rather than direct vehicle-hit damage. Inspect `updatePoisonCloud` and per-step coordination; the ultimate launches expanding forward clouds with match-limited activation and AI parity. Preserve Buratino warning/travel/waves and once-only resolution when blasts remove cover. Check Myasnoy eye/body state and visible hit area. For Kamikaze, inspect steering, protection, one end blast, and recovery rather than treating the dash as ordinary movement. Decorative Illuminat flames and fiery tracks do not themselves add damage.

**Verification:** combat-target, reload, and [myasnoy-eye](../../../../tests/myasnoy-eye.test.js) tests. Check multiple targets, removed cover, interruption/death, timeout, map edge, and restart for the changed path.

## Presentation and lifetime checklist

Search identifiers in descriptions, numeric panels, upgrade UI, and mech modals. Keep numeric facts synchronized while atmospheric prose remains readable. For new combat state, inspect creation, tick, expiry, interruption, death, both restart paths, and relevant transformation restoration. Use existing paths unless demonstrated repeated omissions justify a small shared helper; one field does not need an entity framework.
