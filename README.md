# MEGARE

**[Play MEGARE online](https://urakho.github.io/MEGARE/)** — open the game in your browser without downloading or installing it. GitHub Pages publishes the game from the `main` branch of [urakho/MEGARE](https://github.com/urakho/MEGARE); updates pushed to `main` are published automatically, with no separate manual deployment step.

MEGARE is a top-down browser combat game about tanks and mechs fighting bots. Choose a vehicle, learn its weapons and special abilities, and use movement and the battlefield to survive. Between battles, unlock more vehicles, upgrade your favorites, and build your own combat scenarios in the map editor.

The game focuses on trying different fighting styles: holding a firing line, attacking through ricochets, controlling enemies with elemental effects, or supporting an AI teammate. Its interface is primarily Russian; the repository documentation is in English.

## What you can do

- **Find your fighting style.** Tanks use cannons, machineguns, rockets, flamethrowers, beams, mines, and other weapons. Special abilities include shields, temporary transformations, drones, and summoned legionaries. Three mech types combine health with an energy resource used by their weapons.
- **Use the surroundings.** Push boxes, break or burn wooden walls, and trigger explosive barrels. Different attacks interact with obstacles in different ways, making positioning and firing angles part of the fight.
- **Fight across different environments.** Generated battlefields can use forest, snow, desert, swamp, or rain terrain. Swamp slows movement; rain changes movement and reload speed. The boss has a dedicated lava arena.
- **Develop a collection.** Earn coins and trophies in standard battles, claim progression rewards, open containers, unlock vehicles, and spend parts on upgrades. Ranks, achievements, avatars, and titles add longer-term goals and customization.
- **Create your own battles.** Place obstacles and player, enemy, and ally spawns in the map editor. Save maps locally and exchange them as `.meg` files. Touch mode offers map loading/import rather than the full editor.

## Battle modes

All opponents and teammates are controlled by AI. Team mode does not require other players.

| Mode | Experience |
| --- | --- |
| Solo | Fight three bots on a generated map. |
| Team | Join an AI ally in a battle between four teams of two. |
| Duel | Face one bot while the safe zone shrinks. |
| One versus all | Take on seven bots fighting together against you. |
| Boss fight | Challenge a boss with multiple attack phases in a lava arena. |
| Vehicle trial | Test a vehicle, including one you have not unlocked, in a free-for-all battle. |
| Training | Practice with specialized targets and automatic recovery after death. Unowned vehicles can be tested here too. |
| Custom maps | Play scenarios created in the editor or imported from a `.meg` file. |

Trial, training, and custom maps provide no normal battle rewards or trophy-loss penalties. See [Game design](docs/GAME_DESIGN.md) for the current rules.

## Play locally

1. Download or clone the repository, keeping its folders together.
2. Open [index.html](index.html) in a modern browser.
3. Select a vehicle and a battle mode. Training is a useful place to learn the controls and try vehicles.

No compilation, package installation, or backend process is needed. You can also serve the repository through a static web server. Browser music playback may require an initial click or other interaction.

## Controls and saves

| Input | Action |
| --- | --- |
| W / A / S / D | Move |
| Left / right arrow, or mouse wheel | Rotate the turret |
| Space | Fire |
| E | Use the vehicle's special ability, where available |
| Escape | Pause or resume during a battle |

Movement and turret aiming are separate controls. A touch-control mode provides on-screen movement, aiming/attack, and ability controls.

Progress, local profiles, settings, and saved maps use browser `localStorage`. Keep using the same browser and origin/location to access the same saves. Clearing browser storage can remove them; local profiles are not online accounts and have no cloud synchronization. Switching between opening the file directly and serving it over HTTP can expose different storage areas.

The published GitHub Pages game also saves progress in your browser. Saves from a local copy do not automatically transfer to the published game.

## Project and documentation

MEGARE currently runs entirely in the browser using plain JavaScript, HTML, CSS, Canvas 2D, DOM menus, and browser audio. Node.js is used for regression tests, not to run the game. No minimum browser version or tested platform support matrix is declared.

| Document | Read it for |
| --- | --- |
| [Project overview](docs/PROJECT.md) | Game concept, current capabilities, technology, and repository layout |
| [Architecture](docs/ARCHITECTURE.md) | Script loading, shared state, and subsystem boundaries |
| [Game design](docs/GAME_DESIGN.md) | Implemented modes, combat, progression, and map rules |
| [Development](docs/DEVELOPMENT.md) | Running the game, tests, and working conventions |
| [Roadmap](docs/ROADMAP.md) | Confirmed direction and open decisions |
| [Agent instructions](AGENTS.md) | Shared working rules for Codex and GitHub Copilot |

A self-contained desktop application and possible future multiplayer are goals. Desktop packaging and multiplayer are not implemented; their technologies remain undecided. See the [roadmap](docs/ROADMAP.md).
