# Existing game design

This document describes the current source behavior. Detailed balance values remain in the source; menu descriptions and comments can lag behind implementation. See [ARCHITECTURE.md](ARCHITECTURE.md) for subsystem boundaries and limitations.

## Battle modes and objectives

Mode setup is in `startGame` in [src/main.js](../src/main.js), with spawning and map rules in [src/mode-map.js](../src/mode-map.js).

| Mode identifier | Current behavior |
| --- | --- |
| `single` | Player against three randomly selected bots on a generated map. |
| `team` | Four teams of two: the player and one AI ally against three opposing pairs. Opposing teams have separate team identifiers and can fight one another. |
| `duel` | Player against one bot. A rectangular safe zone shrinks in grid-sized steps; units outside it take damage. |
| `onevsall` | Player against seven bots sharing an opposing team on a large map. |
| `trial` | Vehicle test battle against seven bots with separate team identifiers, allowing free-for-all combat. Trial bypasses vehicle ownership checks and provides no coins/trophies or trophy-loss penalty. |
| `training` | Forest practice map with four specialized areas, stationary targets and a shooter target restricted to its practice area. Unowned vehicles can be tested. Targets recover/respawn; the player is restored and returned to the training spawn after death. No normal match result or battle rewards. |
| `custom` | Editor/imported map with placed obstacles and spawn points, grouped or individually teamed enemies, optional allies and custom result messages. No battle rewards or trophy penalties. |

The menu also launches `bossfight`, described below. The legacy identifier `leaderhunt` is mapped to `bossfight`. Existing `war` branches are not a separate currently configured mode entry.

Standard victory is reached when the enemy collection is empty; defeat is normally triggered by player death. Trial checks surviving enemies explicitly and training has its own recovery path. Outcomes and rewards are handled across `main.js`, [src/physics.js](../src/physics.js), and [src/win-lose.js](../src/win-lose.js); do not assume one outcome handler owns every case.

## Controls, movement, and collisions

- WASD moves the player. Left/right arrows or the mouse wheel rotate the turret. Space fires; E activates the selected vehicle's special ability where implemented. These are separate movement and aiming controls.
- Touch mode provides movement and attack/aim controls plus ability input. Escape toggles pause; result and pause screens provide restart/menu actions.
- Vehicles have type-specific HP and speed, modified by upgrades and active effects. Chassis orientation/animation follows movement and can differ from turret direction.
- Movement respects world bounds and obstacle rectangles. `moveSmallSteps` in [src/bot.js](../src/bot.js) is shared by bots and collision-aware movement/knockback paths.
- Boxes can be pushed in connected rows/chains; the push slows with the load and stops at blocking terrain. Stone walls block movement. Wooden walls are destructible and support burning, poison decay and ice interactions. Barrels can explode and ignite other barrels through fuse processing.

## Vehicles and combat

The starting vehicle is `normal`. Other tanks and the three mech types can be unlocked and selected. Base HP/speed and setup are in `main.js`; attacks and effects are distributed among `main.js`, `physics.js`, and `bot.js`. [src/tanks.js](../src/tanks.js) and [src/mechs.js](../src/mechs.js) contain presentation and descriptions, not the sole gameplay definitions.

Weapons differ in trajectories, reloads, damage, range, targeting and terrain interaction. Ordinary projectiles, piercing shots, ricochets, flames, beams, clouds, explosives, mines and summons use different processing paths. Owner/team fields help distinguish hostile targets, but individual attack paths implement their own rules.

Representative implemented mechanics:

| Vehicles | Distinguishing behavior |
| --- | --- |
| `normal`, `machinegun`, `buckshot` | Standard projectile; sustained machinegun fire with heat/overheat; spread pellets. |
| `fire`, `pyro`, `ice`, `toxic` | Flamethrower bursts; burning projectiles; cold effects and ice field; poison clouds and a special toxic wave. |
| `buratino`, `musical`, `plasma` | Rocket barrages; wall ricochets; piercing plasma shots and an enhanced attack. |
| `waterjet`, `air` | Water stream with damage and pushback; wind attacks that displace targets. |
| `illuminat`, `electric` | Sustained beam and ground marks that can ignite; chain attacks and an area ultimate. |
| `mirror`, `time`, `imitator` | Remembering incoming projectile types and shielding; returning to a recorded earlier position; temporary transformation. |
| `egyptian`, `burovoy` | Arrows and a pursuing curse swarm; contact drill damage/control suppression and temporary burrowing through obstacles. |
| `robot`, `medical`, `mine` | Combat drones; healing allies/damaging enemies; placed explosive traps. |
| `roman`, `spartan`, `kvant` | Ricocheting blade and banner-summoned legion; piercing spear and low-health speed change; transforming projectiles and an overload ability. |
| `kamikaze`, `myasnoy` | Special dash/explosion and ghost behavior; a separation ability with a controlled eye and independently acting body. |

`mechDiy`, `mechShield`, and `mechRocket` use regenerating energy as well as HP. Their attacks spend energy; very low energy triggers a temporary power stun. Their attack patterns differ: queued cannon bursts, a shield-oriented dense shot, and rockets. Energy capacity and shield behavior are type-specific; upgrades can change energy capacity. See `updateMechPower` and mech attack paths rather than treating energy as ordinary tank heat.

Abilities do not share one universal resource model. Some have cooldowns, some have match-limited uses, and some depend on energy or vehicle state. Effects include burn, poison, freeze/slow, paralysis, blindness/control disruption, shields and knockback; each has attack-specific protection and expiry rules.

## AI and maps

Bots navigate with A* on an obstacle grid, perform local movement checks, select targets, aim, evade, shoot and use vehicle-specific abilities. Allies use a separate update path. Navigation searches have a shared per-step budget; moved/destroyed terrain requests a grid rebuild. AI sight also accounts for night visibility and certain abilities such as burrowing.

Generated maps contain walls, wooden walls and boxes, with additional objects/spawns depending on mode. World dimensions differ by mode and the camera follows the player. [src/terrain.js](../src/terrain.js) implements biome appearance and rules:

- Ordinary battles randomly select forest, snow, desert, swamp or rain.
- Swamp applies a movement penalty. Rain applies a smaller movement penalty and faster reload progression.
- Night is implemented with limited range and obstacle-blocked sight, but excluded from ordinary random selection.
- Boss fights use lava terrain; training explicitly uses forest. Lava has its own appearance without the swamp/rain modifiers.

Weather, traces, footsteps and impact effects are presentation systems; not every visual difference changes combat stats.

## Boss encounter

`bossfight` places the player against `boss_hell` in a dedicated lava arena. `spawnBossFightMode` creates the boss and `updateBossFight` controls it. HP thresholds advance through three phases, increasing movement/attack pressure. Attacks include direct fire, radial volleys in later phases, and telegraphed meteors. Landed meteors continue dealing local damage; the third phase also leaves a visual fire trail, with no separate trail-damage handler in the current source. Boss handling replaces ordinary enemy AI during this mode. The in-game information panel's reference to two phases is outdated.

## Progression, economy, and rewards

- **Coins** fund paid container openings and some cosmetics. **Gems** buy locked vehicles and some cosmetics. **Parts** fund upgrades. **Trophies** track progression; global and per-vehicle trophy totals are stored separately.
- Standard victories grant mode-specific coins and trophies; defeats can remove trophies. `loseModeTrophies` handles common penalties. Fast, flawless or crushing wins can receive extra trophies in `syncResultOverlay`, and qualifying boss wins also receive extra coins. Classification uses elapsed wall time and remaining HP relative to starting HP, so healing can affect the result category. Result presentation is part of the reward path.
- The trophy road offers claimable milestone rewards: currencies, containers, vehicles and choices. Ranks use the selected vehicle's trophy total when supplied to `getRankInfo` in [src/rank.js](../src/rank.js). Vehicle trophy thresholds can unlock titles.
- Achievements track wins and collected vehicle groups, with claimable containers and icon rewards. Avatars, titles and profile selection customize local identity; they are not online accounts.
- Upgrades are stored by vehicle and stat. Upgrade UI in `tanks.js` spends parts and limits upgrade levels; stat availability differs by vehicle. Damage, health, speed and mech energy are among the supported improvements.

Container opening is coordinated in `main.js`, with artwork in [src/container-art.js](../src/container-art.js). Current shop identifiers include `mini`, `bronze`, `legendary`, `omega`, `alpha`, and `mechParts`. Trophy/achievement reward handlers map legacy labels such as `normal` and `super` to current identifiers before queuing free containers; identifiers and displayed rarity names are not interchangeable.

Paid openings deduct coins and generate several reward slots. Mini containers produce coins; other types can produce coins, gems, parts or vehicle unlocks according to their own tables. Alpha openings include a guaranteed vehicle slot, with compensation if already owned. Duplicate compensation and per-opening gem restrictions depend on container context. Free containers from progression are queued in `pendingFreeContainers`. Consult the current opening functions for exact probabilities and amounts rather than maintaining a second balance table here.

## Custom maps and local progress

[src/mapeditor.js](../src/mapeditor.js) supports grid placement, erasing, undo, panning/zoom, map sizes, obstacles, enemy/ally/player spawns and result messages. Maps are saved locally under `me_maps` and imported/exported as versioned `.meg` JSON. Import checks format, object types, bounds and blocked player spawns. Name collisions preserve both maps. Touch/mobile mode exposes the map import/load view instead of the full editor.

Local profiles snapshot progression and identity data. Settings and saved maps are separate from those snapshots. Clearing browser storage can remove progress and maps; no online synchronization is implemented. See [ARCHITECTURE.md](ARCHITECTURE.md) for storage ownership.
