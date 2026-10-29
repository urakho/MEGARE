# Development

Follow [AGENTS.md](../AGENTS.md), especially KISS, preservation of existing gameplay, English code comments, and honest verification reporting.

## Run the game

Play the public version at [urakho.github.io/MEGARE](https://urakho.github.io/MEGARE/) without downloading the repository. It is hosted on GitHub Pages from `main`.

Open [index.html](../index.html) in a modern browser, keeping the repository directories together so relative script, stylesheet, audio and artwork paths resolve. No compilation, package installation or backend process is configured. A static web server may also serve the repository, but there is no project-specific server command.

The page directly loads classic scripts in a fixed order. See [ARCHITECTURE.md](ARCHITECTURE.md) before moving declarations or changing startup: `main.js` refers to functions supplied by later scripts and starts the frame loop on window load.

Use a consistent browser and origin/location for local progress. Profiles, settings and maps use localStorage; serving from a different origin or switching between a local file and HTTP can expose a different storage area. Browser music playback may wait for user interaction. No minimum browser version or tested platform support matrix is declared.

## Publish updates

GitHub Pages publishes this repository from the `main` branch. Pushing updates to `main` triggers publication of the public game; there is no separate manual deployment command or project build step. Publication may take time to appear on the live site. Local edits and work on other branches do not update the public version until pushed to `main`.

Keep script, stylesheet, and asset URLs relative so they work under the `/MEGARE/` project path. GitHub Pages serves static files; it does not run the game simulation or store player progress. Saves in a local copy do not automatically transfer to the hosted version.

## Tests

Tests require Node.js with the built-in `node:test`, `node:assert/strict`, `node:fs`, `node:path`, and `node:vm` facilities. Node.js v22.16.0 was used for the verified command below; this records an observed environment, not a declared minimum version.

From the repository root:

```text
node --test tests/*.test.js
```

This command was executed during the documentation assessment on 2026-10-29: all 200 tests in 22 test files passed. This is a historical verification result, not a guarantee about later changes.

For a focused check:

```text
node --test tests/startup.test.js
```

The focused form selects an existing test file; the full-suite command above is the command executed during the assessment.

Tests in [tests/](../tests/) read source files and run complete scripts or selected functions/source sections in VM contexts with mocked game/browser globals. They cover startup and frame timing, movement and box pushing, navigation/collision indexing, targeting and damage, explosions, status effects, reloads, terrain, training, mech behavior and progression, maps, and specific vehicle abilities. They do not launch the full browser game.

Use the relevant existing regression tests when changing these systems:

| Area | Tests |
| --- | --- |
| Paralysis, ice freeze, mech power depletion | [paralysis.test.js](../tests/paralysis.test.js), [combat-targets.test.js](../tests/combat-targets.test.js) |
| Shared cooldowns, bursts, heat, reload bars, waterjet | [reload.test.js](../tests/reload.test.js) |
| Directional box contact, parallel rows, speed penalties, stable movement | [box-push.test.js](../tests/box-push.test.js) |
| Wood reactions, projectile embedding, poison, damage and explosion presentation, barrel chains | [combat-targets.test.js](../tests/combat-targets.test.js), [explosions.test.js](../tests/explosions.test.js) |
| Roman banners, escort behavior, centurions, placement and melee attacks | [roman-legion.test.js](../tests/roman-legion.test.js) |
| Biomes, sight, traces and terrain rendering | [terrain.test.js](../tests/terrain.test.js) |
| Resource-save guard and animation/frame-loop lifecycles | [resources.test.js](../tests/resources.test.js), [performance-loops.test.js](../tests/performance-loops.test.js), [background-loop.test.js](../tests/background-loop.test.js) |
| Battle resets and custom maps | [bug-fixes.test.js](../tests/bug-fixes.test.js), [critical-fixes.test.js](../tests/critical-fixes.test.js), [map-obstacles.test.js](../tests/map-obstacles.test.js) |

Shared mechanics should be checked for the player, AI allies and AI opponents as applicable, including hostile/friendly drones or summons when targeted. Exercise both `startGame` and `window.startCustomMapMode` when changing per-battle state, cooldowns or effects; a standard restart test does not establish that custom-map restart also resets them.

When adding a regression test:

1. Use or extend the relevant existing `*.test.js` file; use the existing built-in Node pattern without dependencies.
2. Supply the globals the tested code actually uses and test observable behavior, including the regression's boundary conditions.
3. When changing source markers or declaration layout, inspect tests that extract source slices. A test harness failure can reflect an extraction assumption.
4. Run the relevant checks and report the exact command, result and any untested behavior. Do not add tests that merely duplicate implementation details or test unrelated behavior.

## Browser verification

For changes affecting browser behavior, check startup/console errors, the relevant menu or battle mode, input, pause/restart, and the affected save/load path as appropriate. Exercise touch mode or audio interactions when changed. Node tests do not establish Canvas appearance, real event behavior, audio playback or browser storage compatibility.

The documentation task ran the Node suite but did not perform a complete browser smoke test. No automated end-to-end browser workflow is configured in the repository.

## Performance diagnosis

[src/main.js](../src/main.js) exposes an opt-in browser-console profiler for an actual game session:

```js
window.startGamePerformanceProfile();
// Play the scenario you want to measure, then run:
window.stopGamePerformanceProfile();
```

The start call resets and enables measurement. The stop call disables it and returns per-phase `count`, `averageMs`, and `maxMs`; it returns `null` if profiling was not active. Measured phases include `update`, `render`, `enemyAI` (also used for boss AI), `allyAI`, and `physics`. `count` is the number of calls, not the number of displayed frames: simulation can run several updates per render.

AI and physics measurements are nested inside `update`; do not add their times to `update` as though they were independent phases. These timings cover the instrumented JavaScript calls, not all browser work or end-to-end FPS. Compare the same map, vehicle, unit load and settings, and use browser performance tools for rendering, layout, audio or other costs outside those calls.

Preserve the existing resource-change guard, navigation budget/indexing, cached graphics and visibility-aware animation lifecycles when optimizing; see [ARCHITECTURE.md](ARCHITECTURE.md). Historical FPS figures from development conversations are not current measurements or a performance guarantee. Record the actual scenario and measurement method before claiming an improvement. The profiling calls above were inspected in source; this documentation update did not run a browser benchmark.

## Working conventions and assets

- Inspect Git status first and preserve existing tracked and untracked work. Existing browser profile directories, screenshots and an icon archive under `tests/` are artifacts, not the test runner or dependencies; do not clean them up as an unrelated task.
- Keep existing script order and global naming conventions unless an intentional change requires otherwise. Inspect both standard and custom-map reset paths, and all player/enemy/ally paths when changing a shared mechanic.
- Prefer small JavaScript/HTML/CSS changes. No formatter, linter, package manager, build configuration, CI workflow or desktop packaging procedure is configured.
- [png/](../png/) contains menu, mech/drone and other raster artwork, including subdirectories for containers. [svg/](../svg/) includes currency artwork referenced from [style.css](../style.css).
- [music/mp3/](../music/mp3/) contains the music currently referenced by `main.js`; [music/m4a/](../music/m4a/) is also present. Much of the game artwork is drawn procedurally in Canvas rather than loaded as image files.
- Developer commands are implemented in [src/admin.js](../src/admin.js), controlled by `ADMIN_ENABLED`. Optional maintenance behavior lives in [src/pause-menu.js](../src/pause-menu.js). These are browser-side controls, not a server or access-control architecture.

## Documentation and cross-chat continuity

Start from `AGENTS.md`, then read only the documents relevant to the task. For every user request, assess and update affected documentation within the same task, including README files when present, relevant files in `docs/`, and other repository documentation, following the [documentation maintenance rules](../AGENTS.md#documentation-maintenance). Keep stable working rules in `AGENTS.md`; do not copy the documents into agent instructions or depend on prior conversations.

Reusable workflows belong in [.agents/skills/](../.agents/skills/) after a repeated need is demonstrated. Four skills cover recurring development work:

| Skill | Use |
| --- | --- |
| [game-visuals](../.agents/skills/game-visuals/SKILL.md) | Vehicle/projectile art, animation, materials, effects, containers, and visual UI consistency |
| [tank-mechanics](../.agents/skills/tank-mechanics/SKILL.md) | Balance, weapons, statuses, energy, AI combat, summons, and obstacle interactions |
| [bugfix-regression](../.agents/skills/bugfix-regression/SKILL.md) | Reproduction, root-cause correction, and focused regression checks |
| [performance-profiling](../.agents/skills/performance-profiling/SKILL.md) | Comparable measurements, optimization, and lifecycle verification |

Start with the defect or performance skill when that is the user's primary concern; consult subsystem references as needed. Each entry point links detailed scenarios without requiring the original development chat. Current source and tests remain authoritative for implementation and balance; historical examples are not new benchmark results or universal design requirements.

Concrete approved task plans may live in [plans/](../plans/), which currently contains a tracking placeholder. The skills and plans directories are not a separate build framework or automatic task backlog.
