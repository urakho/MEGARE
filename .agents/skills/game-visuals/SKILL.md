---
name: game-visuals
description: Improve MEGARE Canvas artwork, vehicle and projectile animation, terrain textures, containers, effects, or visual UI consistency. Use for appearance changes; use bugfix-regression first for defects and performance-profiling first for lag.
---

# MEGARE game visuals

Produce readable artwork that fits the existing game at its actual display size. An appearance request does not implicitly change damage, collision shapes, rewards, or balance.

## Locate the implementation

Read [AGENTS.md](../../../AGENTS.md) and relevant [Architecture](../../../docs/ARCHITECTURE.md) and [Development](../../../docs/DEVELOPMENT.md) sections. Current code takes precedence over old chat suggestions or stale menu descriptions.

| Task | Starting points |
| --- | --- |
| Tank, turret, projectile, freeze overlay | `src/tanks.js`: `drawTankOn`, `renderGameFrame`; search the type in physics too |
| Mech or mech preview | `src/mechs.js` and callers in tanks |
| Biome, wall, box, weather, trail | `src/terrain.js`: `GameTerrain`; world rendering in tanks |
| Roman banner or soldiers | `drawRomanSummon`, `drawRomanRemnant` in tanks; state in physics |
| Container art | `src/container-art.js`: `ContainerArt`; opening/reward flow in main |
| Currency or DOM layout | `src/ui-icons.js`, `style.css`, `index.html`, generated markup |

Search the internal type, helper, or DOM identifier with `rg -n`. Inspect battle, preview, detail, reward, and editor callers that actually use the changed image. A historical filename may refer to a deleted experiment.

## Read relevant details

- [Vehicles and effects](references/vehicles-and-effects.md): silhouettes, coordinate systems, animation, projectiles, control effects, explosions, and visual QA.
- [Environment and UI](references/environment-and-ui.md): stable textures, wall damage, biome differences, containers, currency, and layout.

Load only relevant sections. For a combined visual/mechanical task, also consult the applicable tank-mechanics guidance.

## Workflow

1. Define the requested difference and what must remain recognizable. Improving an existing tank normally preserves its silhouette and theme unless a redesign is requested.
2. Inspect the current object in the game when browser access is available. Record scale, background, angle, state, and affected surfaces. If unavailable, report the limitation; do not claim visual approval.
3. Edit the existing renderer or asset using existing helpers. Keep damage, lifetime advancement, and other gameplay mutation in their established update paths.
4. Check local coordinates, forward direction, rotation pivot, muzzle attachment, body/turret independence, and preview bounds. Do not stretch an entire model to fix one component.
5. Balance Canvas `save()` and `restore()`, including early returns. Set each used fill/stroke explicitly and restore clipping, transforms, alpha, composite mode, shadows, and line styles.
6. Keep static material variation stable across frames and movement. Animate deliberate properties through existing timing/state rather than randomizing geometry every draw.
7. Reuse the owning animation lifecycle. Drawing a preview must not silently start a perpetual loop. Stop callbacks when dismissed, replaced, or hidden; resume without accumulating loops.
8. Review at actual game size before judging enlarged detail. Inspect several angles, motion, overlap, and early/middle/late effect stages against contrasting terrain.

## Verify and deliver

Choose existing tests by behavior: `bullet-render`, `explosions`, `terrain`, `mech-walk`, `myasnoy-eye`, `roman-legion`, `performance-loops`, or `background-loop` under tests. They verify isolation, cleanup, dimensions, and timing; they cannot prove an image looks good.

Run syntax checks on changed scripts and relevant `node --test tests/<name>.test.js` checks. Run the full suite for shared rendering/lifecycle changes. Do not add a test that only repeats a decorative drawing implementation.

Inspect the actual affected screen and gameplay state, console errors, open/close behavior, and pause/restart when effects persist. A temporary gallery helps compare states but does not replace integration checks. Preserve existing screenshots/profiles and remove only your own temporary artifacts.

Report appearance changes, visual inspection performed, executed checks, and verification limits. Update affected documentation if behavior, terminology, or workflow changed.
