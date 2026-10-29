# Existing game design

This document describes the current source behavior. Detailed balance values remain in the source; menu descriptions and comments can lag behind implementation. See [ARCHITECTURE.md](ARCHITECTURE.md) for subsystem boundaries and limitations.

Players can access the public game through [GitHub Pages](https://urakho.github.io/MEGARE/) without installation. It is published from `main`; see [PROJECT.md](PROJECT.md) for distribution details. Battles run in the player's browser against bots, and progression remains local to that browser even when playing on the public site.

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
- Boxes can be pushed in connected rows/chains and stop at blocking terrain. One moving box has no speed penalty; each additional moving box multiplies speed by 0.9. Only boxes contacted along the push direction join the moving group. Contact between boxes must overlap by at least one tenth of the smaller relevant side; a tank touching two rows can push both together. The same chain rules are used for player and bot movement. See `pushBoxChain` in `physics.js`.
- Stone walls block movement. Wooden walls are destructible and react differently to ordinary hits, burning, poison and ice; barrels support chain explosions. See the terrain interaction rules below.

## Vehicles and combat

The starting vehicle is `normal`. Other tanks and the three mech types can be unlocked and selected. Base HP/speed and setup are in `main.js`; attacks and effects are distributed among `main.js`, `physics.js`, and `bot.js`. [src/tanks.js](../src/tanks.js) and [src/mechs.js](../src/mechs.js) contain presentation and descriptions, not the sole gameplay definitions.

Weapons differ in trajectories, reloads, damage, range, targeting and terrain interaction. Ordinary projectiles, piercing shots, ricochets, flames, beams, clouds, explosives, mines and summons use different processing paths. Owner/team fields help distinguish hostile targets, but individual attack paths implement their own rules.

Standard weapon cooldowns for the player and bots share `getTankShotCooldown`; bursts, heat and energy still have type-specific behavior. Reload bars are drawn for the player and allies, not enemies, and omitted for all three mech types. Machinegun reload display follows overheat recovery rather than every bullet interval; Illuminat's bar follows beam cooldown rather than active beam time.

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

`mechDiy`, `mechShield`, and `mechRocket` use regenerating energy as well as HP. Their attacks spend energy; very low energy triggers a temporary power stun that blocks movement and firing. Energy continues regenerating during the stun, and a depleted battery does not repeatedly restart it until rearmed by recovery. Their attack patterns differ: queued cannon bursts, a shield-oriented dense shot, and rockets. Energy capacity and shield behavior are type-specific; upgrades can change energy capacity. See `updateMechPower` and mech attack paths rather than treating energy as ordinary tank heat.

Abilities do not share one universal resource model. Some have cooldowns, some have match-limited uses, and some depend on energy or vehicle state. Effects include burn, poison, freeze/slow, paralysis, blindness/control disruption, shields and knockback; each has attack-specific protection and expiry rules.

### Control effects and special abilities

- An ice projectile slows a hostile vehicle without fully freezing it. The ice ultimate immediately freezes nearby eligible targets and creates an ice field with contact-freeze behavior. Full ice freeze prevents movement and firing.
- Ordinary paralysis prevents firing and weapon abilities while allowing movement; paralyzed bots can retreat. Burovoy's drill suppresses attacks while in contact, and its drill-specific paralysis clears when contact ends. Other independent effects can still remain active. Mech power stun and full ice freeze also stop movement, unlike paralysis alone.
- Waterjet deals continuous damage and knockback without applying paralysis; its burst ends in a reload.
- Toxic projectiles do no direct contact damage to vehicles: their clouds apply the poison. The toxic ultimate launches a forward fan of expanding clouds once per battle, for players and bots. Overlapping clouds do not multiply poison damage on the same target in a simulation step; wood also receives non-stacking poison decay.
- Kamikaze's ultimate is an invulnerable dash with gradual steering limited to 20 degrees either side of its launch direction. It ends in an area explosion, followed by a brief recovery with slower movement and blocked firing. Its normal projectiles also explode; fiery dash tracks are visual effects.
- Illuminat leaves a ground sign after three simulated seconds stationary, retaining only the two newest signs per vehicle. Signs damage hostile units touching them. The super makes the eye red and ignites that vehicle's signs visually for its duration; the flames do not add a separate fire-damage effect.
- Roman's ultimate places a banner and summons reinforcements after a delay. A normal successful summon yields three legionaries; if a centurion is rolled, the group expands to four legionaries and one mounted centurion. Only one centurion is selected for that group. Placement requires free space. The banner ignores projectiles and is not a destructible objective in the current implementation. Soldiers escort their commander, return from distant pursuits, throw weapons and use melee attacks that require a windup and a target still in reach. The mounted centurion uses a spear and spatha and outlives ordinary legionaries. The ability also works for bots.

### Terrain interactions and damage presentation

Wooden walls retain localized damage marks instead of uniformly shrinking. Ordinary hits produce chips and splinters whose visible severity depends on damage. Fire leaves persistent charring; igniting snow-covered wood removes its snow even after the fire ends. Poison causes gradual rot and a crumbling destruction effect; ice creates a local crust that fractures into icy wood fragments. These effects share wall HP and destruction handling, rather than being separate kinds of wall.

Roman blades/pilums, Spartan spears and Egyptian arrows can embed in targets using their original artwork and dimensions. In wooden walls they remain until the wall is destroyed; marks embedded in vehicles expire. Repeated impacts preserve earlier wall damage shapes. Rocket-mech impacts can create larger visible wood damage without increasing the underlying HP damage merely because the effect is larger.

Generated-map barrels occupy one 50-pixel cell; newly placed editor barrels use the selected grid-cell size. A barrel blast ignites nearby barrels with a fuse of 15 simulation steps, or 0.25 simulated seconds at the game's update rate. Overlapping blasts preserve an already burning fuse, and each barrel detonates once. Direct damaging hits can detonate a barrel immediately. Chain processing advances through simulation updates, so it pauses with combat and does not recursively detonate the entire chain at once. Clearing the map clears pending barrels too.

Explosion artwork and gameplay hit areas are distinct: a larger fireball or more debris does not by itself imply a larger damage radius or more HP damage. Debris and destruction animations are temporary presentation objects, not replacement blocking obstacles. Relevant handlers include `explodeBarrel`, `updateBarrelFuses`, `damageWoodenWall`, and `addEmbeddedProjectile` in `physics.js`.

## AI and maps

Bots navigate with A* on an obstacle grid, perform local movement checks, select targets, aim, evade, shoot and use vehicle-specific abilities. Allies use a separate update path. Navigation searches have a shared per-step budget; moved/destroyed terrain requests a grid rebuild. AI sight also accounts for night visibility and certain abilities such as burrowing.

Generated maps contain walls, wooden walls and boxes, with additional objects/spawns depending on mode. World dimensions differ by mode and the camera follows the player. [src/terrain.js](../src/terrain.js) implements biome appearance and rules:

- Ordinary battles randomly select forest, snow, desert, swamp or rain.
- Swamp reduces movement speed by 10%. Rain reduces movement speed by 5% and increases reload duration by 5% relative to the same weapon on ordinary terrain. `reloadFactor()` scales cooldown progress by `1 / 1.05`, so a lower factor means a longer reload. Wooden-wall burn duration is 20% shorter in rain.
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
