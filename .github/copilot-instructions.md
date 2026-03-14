# Copilot Instructions for Tanks Game

These rules define how Copilot should work when generating or modifying code in this project.

---

## Language Rules

1. All **code comments must be written in English**.
2. Copilot must **always answer in the same language as the user's request**.
3. Explanations should be short and practical.

Example:

```js
// Spawn enemy tank at random position
spawnEnemy()
```

---

## Coding Style

Follow these principles:

- Write clean and readable code.
- Use clear variable and function names.
- Avoid unnecessary complexity.
- Do not rewrite large parts of the code unless explicitly requested.
- Prefer small and safe modifications.

---

## Working With Game Code

When adding or changing game mechanics:

- Do not break existing systems.
- Follow the current project structure.
- Reuse existing functions when possible.
- Keep game balance consistent with existing tanks and mechanics.

### Examples of game systems

- Tanks
- Containers
- Upgrades
- Trophies
- Resources

---

## Comment Rules

Comments must:

- be written in English
- explain what the code does
- be concise

Example:

```js
// Calculate damage dealt to the enemy tank
function calculateDamage() {
    // ...implementation...
}
```

---

## Response Rules

When responding:

- Provide the code first if requested.
- Avoid unnecessary explanations.
- Keep answers focused on the requested task.
- Always answer in the same language as the user's request.

---

## Final Sentence Rule (IMPORTANT)

At the end of every response, Copilot must write one clear and specific sentence in English describing what was added or changed.

Rules:

- It must be exactly one sentence.
- It must describe the actual change in the code.
- It must be written in English.

Example:

Added a function that spawns enemy tanks at random positions on the map.
