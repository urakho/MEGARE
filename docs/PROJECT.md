# MEGARE

MEGARE is a top-down browser combat game built around player-controlled tanks and mechs fighting AI opponents. Players select a vehicle, fight on generated or custom maps, and earn progression rewards. The game UI is primarily Russian; this technical documentation is in English.

For a player-facing introduction, launch instructions, and basic controls, start with the root [README](../README.md).

## Availability and distribution

The game is publicly available at [urakho.github.io/MEGARE](https://urakho.github.io/MEGARE/). GitHub Pages publishes the static game files from the `main` branch of [urakho/MEGARE](https://github.com/urakho/MEGARE). Updates pushed to `main` are published automatically; no separate manual deployment, application installation, or game server is required. Local copies can also run directly in a browser.

Public web hosting serves the game files; combat simulation and saves still run in each player's browser. It does not provide multiplayer or shared progression. See [DEVELOPMENT.md](DEVELOPMENT.md) for the publishing workflow.

## Game concept and player experience

The core experience is learning different vehicles and using their strengths in combat. A battle combines movement, independent turret aiming, weapon timing, special abilities, and use of the surroundings. Players can work toward victory in standard matches, challenge a boss, practice unfamiliar equipment, or create their own scenarios.

The usual progression loop is to select an owned vehicle, enter a battle, earn rewards, and use those rewards to expand or improve the collection. Standard victories grant coins and trophies; defeats can cost trophies. Trial and training let players explore vehicles before unlocking them, while custom maps offer a separate space for experimentation. Those three activities have no normal battle rewards or trophy-loss penalties.

### Vehicles and fighting styles

Vehicles offer different ways to approach a fight rather than only different appearances. Cannons, rapid fire, spread shots, rockets, ricochets, beams, elemental attacks, and mines favor different distances and firing angles. Abilities can change positioning, provide protection, transform a vehicle, or bring drones and summoned fighters into combat. The three mech types add energy management alongside health.

This variety gives players reasons to try another vehicle and learn how to handle its opponents. Upgrades support continued investment in favorite vehicles; unlocks provide access to other fighting styles. Exact statistics, costs, and ability rules belong in the source and [GAME_DESIGN.md](GAME_DESIGN.md), rather than a second balance table here.

### Battlefields and modes

The environment contributes to combat. Boxes can be pushed, wooden walls can be destroyed and affected by fire or other attacks, and explosive barrels can trigger nearby barrels. Obstacles shape movement, cover, and lines of fire. Generated maps vary the layout, while forest, snow, desert, swamp, and rain terrain provide different settings. Swamp and rain also apply gameplay modifiers.

Solo, team, duel, and one-versus-all modes offer different arrangements of AI opponents and allies. Duels add a shrinking safe zone; the boss encounter uses a dedicated lava arena and phased attacks. Trial and training support learning and vehicle testing. All current battles run locally against bots, including the teammates in team mode; no online players are involved.

### Collection and local identity

Coins, gems, parts, and trophies serve different progression roles. Containers and trophy-road rewards contribute currencies and vehicle unlocks, while parts fund vehicle upgrades. Ranks, achievements, avatars, and titles provide additional goals and ways to customize a local profile.

Profiles keep separate local progression and identity data. They are browser-side profiles, with no online account or cloud synchronization. Settings and saved maps are stored separately from profile snapshots. Clearing browser storage can remove saved data, and changing the browser or origin/location can expose a different storage area.

### Custom scenarios

The map editor extends play beyond generated battles. Players can choose map sizes, place obstacles and player/enemy/ally spawns, configure enemy grouping, and write custom result messages. Maps can be saved locally and imported or exported as `.meg` files to exchange scenarios. Touch mode exposes map loading/import instead of the full editor.

## Current implementation

- Runs entirely in a browser using JavaScript, HTML, and CSS. Keyboard controls and a touch-control mode are implemented.
- Canvas 2D draws the battlefield, vehicles, effects, and previews. DOM elements and CSS provide menus, HUD, shops, and dialogs.
- Includes solo, team, duel, one-versus-all, boss, trial, and training play, plus a custom map editor and `.meg` map import/export.
- Provides vehicle unlocks, upgrades, containers, currencies, trophies, ranks, achievements, avatars, titles, and local profiles.
- Uses browser `Audio` objects for music and localStorage for progress, settings, profiles, and custom maps.

The application loads classic scripts directly from [index.html](../index.html); there is no ES module or frontend framework setup. Runtime code and assets are local repository files. No package manifest, external JavaScript runtime dependency, build pipeline, desktop packaging, multiplayer transport, or separate game server is configured. Node.js is used for tests, not to run the game.

## Repository layout

| Location | Purpose |
| --- | --- |
| [index.html](../index.html), [style.css](../style.css) | Page structure, script loading, DOM UI, styling |
| [src/](../src/) | Shared state, gameplay, physics, AI, rendering, UI, persistence |
| [tests/](../tests/) | Node.js regression tests and existing browser/image artifacts |
| [music/](../music/) | Audio assets; current music paths use `music/mp3/`; `music/m4a/` also exists |
| [png/](../png/), [svg/](../svg/) | Raster artwork and vector assets, including currency icons |
| [AGENTS.md](../AGENTS.md) | Shared Codex and Copilot working rules and knowledge entry point |
| [docs/](./) | Current project knowledge and confirmed direction |
| [.agents/skills/](../.agents/skills/), [plans/](../plans/) | Reusable development skills and space for concrete implementation plans |

## Status and direction

This is an existing playable browser implementation with regression tests. Simulation, rendering, input, UI, and persistence remain coupled through global state. A release support matrix and a minimum browser version are not declared in the repository.

The confirmed direction is a simple, self-contained desktop application, clearer subsystem boundaries, an independent authoritative simulation, and eventual possible multiplayer. These are goals, not implemented features or selected technologies. See [ROADMAP.md](ROADMAP.md).

Use [ARCHITECTURE.md](ARCHITECTURE.md) to locate behavior, [GAME_DESIGN.md](GAME_DESIGN.md) for game rules, and [DEVELOPMENT.md](DEVELOPMENT.md) for running and verification.
