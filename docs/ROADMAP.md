# Confirmed direction

These are product and technical goals, not an approved implementation plan. No release dates, milestone order, or technology selections are established here.

## Implemented today

Browser-based tank and mech combat against bots, Canvas 2D and DOM UI, local progression/profiles, generated maps and custom map editing/import/export, and Node.js regression tests. Simulation runs in the browser and shares state with presentation and persistence; see [ARCHITECTURE.md](ARCHITECTURE.md).

## Near-term direction

- Improve understandable boundaries between game rules, physics, AI, rendering and input through small, incremental changes that preserve working gameplay.
- Preserve a simple, self-contained experience as the existing browser game evolves toward desktop use.

These priorities do not define a refactoring sequence or authorize changes outside a specific task.

## Long-term objectives

- Package a desktop application based on the existing game.
- Separate client and server responsibilities logically.
- Make authoritative game simulation independent of rendering.
- Allow possible multiplayer support in later releases.

## Open architectural decisions

Desktop runtime, packaging/distribution approach, module organization, simulation boundary, networking transport, and eventual server deployment remain undecided. Logical client/server separation does not require a separate server process in the first desktop application. Electron, WebSockets, a framework, or a particular module system must not be assumed selected.

Apply **KEEP IT SIMPLE, STUPID (KISS)**: choose technologies only for demonstrated requirements. Record confirmed decisions here or in the relevant existing document; reserve [plans/](../plans/) for future concrete implementation work.
