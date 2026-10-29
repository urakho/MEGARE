# MEGARE agent instructions

**KEEP IT SIMPLE, STUPID (KISS).** Simplicity is the overriding engineering priority for this project, including its documentation and agent workflows.

## Engineering principles

- Choose the simplest solution that satisfies actual requirements. Prefer plain JavaScript and existing browser APIs when sufficient.
- Avoid speculative abstractions, unnecessary architectural patterns, dependencies, files, layers, and indirection. Add a technology or dependency only with a demonstrated need and clear justification.
- Keep changes small, focused, safe, and understandable to a beginner programmer. Use clear variable and function names and reuse existing functions where practical.
- Preserve working functionality, established gameplay, and balance unless the task explicitly requests a change. Prefer incremental refactoring over rewrites; do not rewrite large areas without an explicit request.

## Project overview and navigation

MEGARE is a browser game about tank and mech combat against bots. It uses JavaScript, HTML, CSS, Canvas 2D, DOM UI, browser audio, and localStorage. Classic scripts share mutable state; there is no configured frontend build system, desktop package, or authoritative game server.

The public game is hosted on [GitHub Pages](https://urakho.github.io/MEGARE/) from `main`; pushing updates to `main` publishes them without a separate manual deployment step. See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for publishing details.

Read the relevant documents before substantial changes:

| Need | Source |
| --- | --- |
| Purpose, features, technology, repository layout | [docs/PROJECT.md](docs/PROJECT.md) |
| Current architecture, entry points, state, dependencies, limitations | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |
| Existing gameplay rules and progression | [docs/GAME_DESIGN.md](docs/GAME_DESIGN.md) |
| Running, testing, conventions, assets | [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) |
| Confirmed direction and open technical decisions | [docs/ROADMAP.md](docs/ROADMAP.md) |
| Reusable project skills, when available | [.agents/skills/](.agents/skills/) |
| Active concrete implementation plans, when available | [plans/](plans/) |

The skills and plans directories initially contain only tracking placeholders. Do not treat their existence as evidence of an active skill or approved plan.

## Development rules

- Inspect the actual code and Git status before editing. Preserve pre-existing modifications, untracked work, and test artifacts; avoid unrelated changes.
- Follow existing conventions unless there is a concrete reason to improve them. Understand script order, shared state, callers, and subsystem dependencies before refactoring.
- Check implementations and tests before documenting behavior. Distinguish implemented functionality, known limitations, and future goals. Filenames, UI descriptions, and old chat assessments are not sufficient evidence by themselves.
- Verify changes with appropriate existing tests and, when relevant, browser checks; see [development instructions](docs/DEVELOPMENT.md). Never claim tests passed unless they were executed, and report verification limits accurately.
- Write new or changed code comments in English. Keep them concise and useful, explaining the behavior or a non-obvious reason. Keep technical documentation in English and preserve existing identifiers and game terminology.

## Responses

These rules apply to both Codex and GitHub Copilot:

- Write the main response in the language of the user's request. Keep explanations short, practical, and focused. Provide code first when the user requests code.
- **End every response with exactly one short English sentence on its own final line, in commit-message style, describing the work actually performed.** This is an explicit exception to the main-response language rule. Use only a few words where practical.
- Describe documentation, planning, or inspection accurately when no code was changed. Never imply an edit or successful check that did not happen.

## Documentation maintenance

Update the relevant document when changing architecture, important public interfaces or subsystem boundaries, game mechanics, development or build workflows, supported platforms or technologies, or important architectural decisions. Trivial changes do not require documentation updates.

Keep rules here, detailed project facts in the linked documents, and concrete task plans in `plans/` when needed. Avoid redundant documents and copying source code or full documentation into this file. Keep current implementation separate from the goals in the roadmap.

## Skills and knowledge across conversations

Reusable project skills belong in `.agents/skills/`. Recommend a skill only when practical experience reveals a genuinely useful, repeatable workflow. Do not automatically create skills, placeholder `SKILL.md` files, registries, or loaders for individual tasks.

Repository files are the persistent source of project knowledge. Previous conversation history must not be required to understand the project. Preserve important verified knowledge in the appropriate repository document so a new conversation can continue using the repository alone. Do not rely on automatic memory as the only source of important information.

GitHub Copilot enters through [.github/copilot-instructions.md](.github/copilot-instructions.md), which delegates to this file. Maintain shared rules here so both agents receive consistent guidance.
