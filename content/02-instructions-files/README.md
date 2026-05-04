# Section 2 — Instructions files: AGENTS.md and friends

| [← Previous: Getting started with Copilot CLI][previous-lesson] | [Next: Prompt engineering and CLI session control →][next-lesson] |
|:--|--:|

Copilot CLI reads instruction files from several well-known locations and
layers them by scope. Once you know the precedence rules, you can codify
your team's conventions in source control and stop re-explaining them in
every session.

## What you will learn

- The full set of instruction sources Copilot CLI loads, and the order
  they take effect in.
- When to use a top-level `AGENTS.md` vs. directory-scoped instructions
  vs. user-level instructions.
- How to write an `AGENTS.md` that actually changes Copilot's behavior on
  a brownfield project (specific, scoped, enforceable rules — not vague
  "write good code" platitudes).
- How to verify what Copilot has loaded.

## Scenario

> [!NOTE]
> **Starting state**: clean fork of `legacy-app`. **Implementation
> exercises** — you'll add new instruction files but not change Java or
> Python source. The files you add here are used by every later section.

In Section 1, you watched Copilot rediscover AssetTrack from scratch.
That's wasteful. Now you'll write down what Copilot needs to know — the
stack, the conventions, the "do/don't" rules, the unenforced business
invariants — so every future session starts from the right baseline.

## Tech overview: The Copilot CLI instruction landscape

Talking points:

- Instruction sources Copilot CLI may load (subject to your CLI
  version — confirm with the docs in [Resources](#resources)):
  - Repo-root `AGENTS.md`
  - `.github/copilot-instructions.md`
  - `.github/instructions/**/*.instructions.md` (path-scoped)
  - User-level instructions in `$HOME/.copilot/`
  - Additional directories via `COPILOT_CUSTOM_INSTRUCTIONS_DIRS`
  - Coexistence with sibling files like `CLAUDE.md` / `GEMINI.md`
- Precedence and merging: which source wins when they disagree, and how
  scope (repo vs. user vs. env) is meant to be used.
- Inspecting what's loaded: `/instructions`, `/env`, or whatever the
  current CLI exposes. Useful when "Copilot is ignoring my rules" —
  usually it's loading from somewhere you forgot.

## Exercise: Author an `AGENTS.md` for AssetTrack

Talking points:

- **Goal**: produce a repo-root `AGENTS.md` that captures everything a
  new agent session should know about AssetTrack before touching it.
- **Files/areas touched**: `AGENTS.md` at the repo root (new file).
- **Steps**:
  - Have Copilot draft `AGENTS.md` based on the audit from Section 1.
  - Iterate to ensure it covers: the stack (Spring Boot 2.7, Java 11,
    Bootstrap 3, jQuery, SQLite, Python 3 in a deliberately old style),
    project structure, repository / service / controller conventions,
    "do" rules (parameterized SQL, server-side validation), "don't"
    rules (don't change package names, don't auto-upgrade Spring Boot),
    and the **unenforced business invariants** from
    `legacy-app/plan.md` (active assignment uniqueness, inactive
    employees can't receive assets, lost/retired assets can't be
    assigned, `returned_date >= assigned_date`).
  - Commit the file.
- **How to verify**: start a fresh Copilot CLI session, ask "what do
  you know about this project?" and confirm Copilot cites the new
  `AGENTS.md` and reflects its rules. Optionally use `/instructions`
  (or equivalent) to confirm it's loaded.

## Tech overview: Scoped instructions for messy areas

Talking points:

- When repo-root `AGENTS.md` is too coarse: e.g., `scripts/` follows
  different rules than the Java codebase, and `repository/` has known
  SQL-injection-flavored patterns the agent should never reproduce.
- Two ways to scope:
  - Drop a child `AGENTS.md` (or equivalent) inside the directory.
  - Use `.github/instructions/<name>.instructions.md` with a glob
    `applyTo` pattern.
- When to prefer one over the other (proximity vs. centralization).
- Repo-level vs. user-level: same rules everywhere on your machine vs.
  rules baked into the project.

## Exercise: Add scoped instructions for `scripts/` and `repository/`

Talking points:

- **Goal**: keep Copilot honest about the messy bits of AssetTrack.
- **Files/areas touched**: a new instructions file for `scripts/` and
  one for `repository/`. Pick one approach (child `AGENTS.md` or
  `.github/instructions/*.instructions.md`) and be consistent.
- **Steps**:
  - For `scripts/`: codify the Python modernization rules — prefer
    f-strings, prefer `pathlib`, type hints encouraged on new code,
    keep stdlib-only unless told otherwise.
  - For `repository/`: never use string concatenation to build SQL;
    use `PreparedStatement` parameterization; flag any existing
    string-built queries when seen.
  - Commit both files.
- **How to verify**: in a fresh session, ask Copilot to add a small
  helper to `scripts/import_assets.py` and a query method to
  `AssetRepository`. Confirm the proposed code follows the scoped rules
  (modern Python; parameterized SQL).

## Summary

You should now have:

- A repo-root `AGENTS.md` Copilot picks up automatically.
- Scoped instructions for `scripts/` and `repository/`.
- A way to verify what Copilot is loading.

Next, you'll learn to **drive** the agent — plan-first prompting, diff
review, and rollback — in [Section 3][next-lesson].

## Resources

- [Copilot CLI documentation][copilot-cli-docs]
- [Custom instructions for GitHub Copilot][copilot-instructions]
- [`AGENTS.md` overview][agents-md]
- [Path-scoped instructions (`.github/instructions/`)][path-scoped-instructions]
- [Legacy app implementation plan (business invariants)][legacy-app-plan]

---

| [← Previous: Getting started with Copilot CLI][previous-lesson] | [Next: Prompt engineering and CLI session control →][next-lesson] |
|:--|--:|

[previous-lesson]: ../01-getting-started-with-copilot-cli/README.md
[next-lesson]: ../03-prompt-engineering-and-iteration/README.md
[copilot-cli-docs]: https://docs.github.com/en/copilot/how-tos/use-copilot-agents/use-copilot-cli
[copilot-instructions]: https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions
[agents-md]: https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions
[path-scoped-instructions]: https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions
[legacy-app-plan]: https://github.com/geektrainer/legacy-app/blob/main/plan.md
