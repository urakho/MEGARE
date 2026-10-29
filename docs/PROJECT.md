# MEGARE

MEGARE is a top-down browser combat game built around player-controlled tanks and mechs fighting AI opponents. Players select a vehicle, fight on generated or custom maps, and earn progression rewards. The game UI is primarily Russian; this technical documentation is in English.

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
| [.agents/skills/](../.agents/skills/), [plans/](../plans/) | Future reusable workflows and concrete implementation plans |

## Status and direction

This is an existing playable browser implementation with regression tests. Simulation, rendering, input, UI, and persistence remain coupled through global state. A release support matrix and a minimum browser version are not declared in the repository.

The confirmed direction is a simple, self-contained desktop application, clearer subsystem boundaries, an independent authoritative simulation, and eventual possible multiplayer. These are goals, not implemented features or selected technologies. See [ROADMAP.md](ROADMAP.md).

Use [ARCHITECTURE.md](ARCHITECTURE.md) to locate behavior, [GAME_DESIGN.md](GAME_DESIGN.md) for game rules, and [DEVELOPMENT.md](DEVELOPMENT.md) for running and verification.
