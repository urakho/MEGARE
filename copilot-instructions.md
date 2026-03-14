# Copilot Instructions — MEGARE Repository

This file contains rules and a workflow for Copilot when working in the MEGARE repository. Follow these guidelines when making changes.

---

## Mandatory steps before work

- Always start multi-step work by creating or updating a plan using the `manage_todo_list` tool.
- Before calling any tools that modify the workspace (file edits, searches, patches), send a short preamble (1–2 sentences) describing what you will do and why.

---

## Editing files

- Use `apply_patch` for edits to existing files. Fill the `explanation` field with a short description of the change.
- Use `create_file` to create new files.
- Use `read_file`, `grep_search`, `semantic_search`, or `search_subagent` for reading and searching repository content.
- Do not modify files unrelated to the task. Prefer minimal, local changes.

---

## Style of changes

- Fix the root cause rather than applying surface-level patches.
- Preserve existing code style and formatting used in the project.
- Avoid unnecessary refactoring or symbol renames unless requested.
- Do not add license headers or metadata to files unless explicitly asked.
- Avoid single-letter variable names for new public functions.

---

## Behavior on errors and testing

- After changing files, call `get_errors` and fix errors related to your changes (up to 3 attempts per file).
- If the project contains automated tests, run them locally when possible; otherwise perform basic validation (syntax checks, console sanity).

---

## UI / content changes

- For edits in `index.html` and CSS, change only the specific block — do not rebuild the page layout entirely.
- When referencing files in messages, use workspace-relative paths and, when useful, link them like `[copilot-instructions.md](copilot-instructions.md)`.

---

## Final communication

- After completing a task, provide a concise summary: what was changed, which files were edited (list of paths), how to verify, and a suggested next step.
- Keep the final message short and include links to changed files when helpful.

---

## Security and ethics

- If the user requests anything that would be harmful or violates policies, respond: "Sorry, I can't assist with that."

---

## Recommended workflow (example)

1. Update the plan: `manage_todo_list` (create or update tasks).
2. Send a short preamble (1–2 sentences) before using tools.
3. Make edits with `apply_patch` / `create_file`.
4. Run `get_errors` and fix issues (≤ 3 attempts per file).
5. Update `manage_todo_list` to mark completed items.
6. Send a concise final message with links to changed files.

---

## Preamble examples

"I will format `copilot-instructions.md` into valid Markdown and add an `apply_patch` example."

"I will adjust upgrade button sizes in `src/tanks.js` and verify with `get_errors`."

---

## Example `apply_patch` (V4A diff)

Use the exact V4A patch format when calling `apply_patch`, for example:

```text
*** Begin Patch
*** Update File: c:\path\to\file.js
@@
 -    oldLine
 +    newLine
*** End Patch
```

Include a short `explanation` describing the goal of the change when invoking `apply_patch`.

---

## Example final message to the user

- Short summary: **What was done** — formatted `copilot-instructions.md` into Markdown; **Files**: `copilot-instructions.md`; **Verify**: open the file in the editor. Would you like example `apply_patch` templates added as well?

---

If you'd like, I can add more patch examples or short/medium/long preamble templates — say "yes" and indicate which length you prefer.