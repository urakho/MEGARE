---
name: tank-mechanics
description: Change MEGARE weapon balance, reloads, abilities, status effects, mech energy, bot combat, summons, or physical interactions with obstacles. Use for intended gameplay changes; use bugfix-regression first when restoring broken behavior.
---

# MEGARE tank mechanics

Implement the requested rule across its real execution paths while preserving unrelated balance. This covers existing vehicles and environment interactions, not a speculative new-character framework.

Read [AGENTS.md](../../../AGENTS.md), relevant [Architecture](../../../docs/ARCHITECTURE.md) and [Game design](../../../docs/GAME_DESIGN.md) sections, and [Development](../../../docs/DEVELOPMENT.md) for tests. Recheck source before treating a historical balance request as current.

## Map the rule

Search the internal vehicle/projectile type through main, physics, bot, mode-map, tanks, and mechs in `src/`. Inspect relevant sections; player shooting does not establish bot behavior, and a renderer is not the weapon's sole definition.

| Path | Questions |
| --- | --- |
| Creation | Where do player, enemy, ally, target, or summon receive HP, speed, team, and ability state? |
| Activation | Which keyboard/touch and AI paths initiate it, and what blocks it? |
| Resolution | Which projectile, continuous attack, contact, or delayed-area update applies it? |
| Targets | Which units, drones, summons, shields, and obstacles are eligible? What prevents duplicate hits? |
| Timing | Simulation steps, seconds, wall time, shots, heat, energy, or uses per match? |
| Lifetime | What expires, interrupts, or resets it in normal and custom-map battles? |
| UI | Which stat panel, description, bar, or effect represents it? |

Reuse existing helpers such as `getEntityTankType`, `getTankShotCooldown`, `getEntityFireCooldownStep`, and applicable target/damage helpers. Inspect callers before changing them; similar attacks can intentionally differ.

## Detailed procedures

- [Combat and status](references/combat-and-status.md): damage units, reloads, bursts, heat, energy, status priority, targeting, abilities, and descriptions.
- [World and AI](references/world-and-ai.md): box chains, destruction, barrels, summons, navigation, reset paths, and test selection.

## Workflow

1. State the before/after rule observably. Resolve consequential ambiguity such as faster cooldown progress versus shorter duration using source/conversation, or ask if still unresolved.
2. Change the smallest relevant set of paths. Reuse shared calculations where appropriate without rewriting combat to impose unrequested uniformity.
3. Keep gameplay in updates. Larger explosions, debris, or decorative fire do not automatically increase damage or collision radius.
4. Exercise player, allied AI, and hostile AI for shared rules. Include friendly/hostile drones or summons when eligible. Preserve ownership on copying, reflection, and transformation.
5. Check activation, sustained behavior, expiry, interruption, death, pause, and restart as applicable. Inspect both `startGame` and `window.startCustomMapMode` for per-battle state.
6. Synchronize changed numeric statistics and ability rules. Keep atmospheric prose readable rather than inserting every parameter. Hiding a bar must not remove a real cooldown.
7. Extend the nearest meaningful regression test with boundary cases using the existing Node/VM pattern. Avoid new dependencies and generic ability frameworks.

Run focused tests and syntax checks. Run `node --test tests/*.test.js` for shared combat, movement, status, or reset changes. Check real browser input/HUD/fights where available; isolated functions do not establish full integration.

Completion requires the requested rule, correct eligible actor paths, cleanup, matching UI, and honest verification. Update affected game-design/architecture documentation; keep complete balance tables in source rather than copying them into skills.
