# Section 4 — Agent skills: building reusable, scoped tasks

| [← Previous: Prompt engineering and CLI session control][previous-lesson] | [Next: Custom agents →][next-lesson] |
|:--|--:|

Some tasks come up more than once: modernizing Python, scanning for SQL
injection patterns, generating tests for a service. Re-prompting from
scratch every time is slow and inconsistent. **Agent skills** let you
package a well-scoped task with its instructions, triggers, and
guardrails so the CLI can invoke it on demand.

## What you will learn

- What an agent skill is and how it differs from a one-off prompt or a
  custom agent.
- How Copilot CLI discovers, lists, and invokes skills.
- How to design a skill with clear triggers, inputs, outputs, and
  guardrails — including how to keep it read-only when it should be.
- Common skill failure modes and how to debug them.

## Scenario

> [!NOTE]
> **Starting state**: clean fork of `legacy-app` plus the instructions
> files from [Section 2][s02]. The first exercise **modifies Python
> source** in `scripts/`. The second exercise is **read-only** — it
> only reports findings; it does not fix code. (This keeps the SQL
> injection bug intact for [Section 3][s03] / [Section 7][s07] use.)

You're going to need to modernize Python more than once and audit Java
for unsafe SQL more than once. You'll build a skill for each.

## Tech overview: What is an agent skill

Talking points:

- Skills vs. one-off prompts vs. custom agents (preview — full
  comparison in [Section 5][s05]).
- Skill anatomy: name, description, trigger conditions, instruction
  body, example invocations, optional tool restrictions.
- Where skills live: repo-local for project-specific skills, user-level
  for skills you want everywhere. Discovery via `/skills` (or
  equivalent).
- When a skill is the right answer: repeated, well-defined, narrow
  scope. When it's not: one-shot creative work, work that needs a lot
  of conversational back-and-forth.

## Exercise: Build a `python-modernizer` skill

Talking points:

- **Goal**: a reusable skill that converts the AssetTrack Python
  scripts (and any future similar code) from the deliberately
  old-fashioned style to modern idioms.
- **Files/areas touched**: a new skill definition (location depends on
  CLI version — repo-local recommended for course use). When invoked,
  it edits files under `scripts/`.
- **Steps**:
  - Author the skill with clear rules: prefer f-strings over `%`
    formatting, `pathlib` over `os.path`, modern exception handling,
    no behavioral changes (only stylistic / idiom-level edits).
  - Restrict the skill's effective scope (Python files only, ideally
    under `scripts/`).
  - Invoke the skill on `scripts/import_assets.py`. Inspect the diff.
  - Iterate on the skill definition if the agent over-reached or
    under-reached.
- **How to verify**:
  - `/skills` lists `python-modernizer`.
  - After invocation, no `%` formatting remains in
    `scripts/import_assets.py`; `pathlib` is used where appropriate;
    the script still runs against `scripts/data/sample_import.csv`
    with the same end-state behavior (same rows imported).

## Tech overview: Skill design — inputs, outputs, guardrails, debugging

Talking points:

- Designing inputs: explicit named arguments vs. natural-language
  prompts; when each is appropriate.
- Designing outputs: edits in place vs. structured reports vs.
  printed summaries; how output shape affects how a learner
  composes the skill into a larger workflow.
- Guardrails: scope restrictions, "report-only" vs. "fix" modes,
  refusing to act outside known patterns.
- Debugging when a skill misbehaves:
  - Skill not discovered → wrong location or naming.
  - Wrong skill triggered → ambiguous descriptions across skills.
  - Skill runs but produces wrong output → over-broad instruction,
    missing examples, missing guardrails.
  - Skill needs a tool it doesn't have permission for.
- Distribution: repo-local for project specifics, user-level for
  personal toolkit, sharing across a team.

## Exercise: Build a `security-audit` skill

Talking points:

- **Goal**: a **read-only** skill that scans Java repositories for
  string-concatenated SQL and reports findings — file, method, line,
  short snippet — without making any edits.
- **Files/areas touched**: a new skill definition. Invocation reads
  Java sources but **does not modify** them.
- **Steps**:
  - Author the skill with explicit "report only — never edit"
    guardrails.
  - Define the report shape: a markdown list grouped by file with
    method name, line number, and snippet.
  - Invoke on AssetTrack. Confirm `AssetRepository.searchAssets()`
    appears in the report. (`findByAssetTag` may already be fixed
    from Section 3 — that's fine; the skill is now demonstrating
    how to keep auditing.)
- **How to verify**:
  - `/skills` lists `security-audit`.
  - The skill produces a report and **no diff is generated** in the
    working tree (`git status` shows no changes after running it).
  - The report flags `AssetRepository.searchAssets()` (and any
    other vulnerable methods that exist).

## Summary

You've built two reusable skills, one that modifies code and one that
only reports. You've seen how to keep skills scoped, how to verify
discovery, and how to debug common failure modes.

Next, you'll level up from skills to **custom agents** that compose
skills, instructions, and tools in [Section 5][next-lesson].

## Resources

- [Copilot CLI documentation][copilot-cli-docs]
- [Building custom skills for GitHub Copilot][copilot-skills]
- [OWASP — SQL injection prevention cheat sheet][owasp-sqli]
- [Modern Python style guide (`pathlib`, f-strings)][python-modern]

---

| [← Previous: Prompt engineering and CLI session control][previous-lesson] | [Next: Custom agents →][next-lesson] |
|:--|--:|

[previous-lesson]: ../03-prompt-engineering-and-iteration/README.md
[next-lesson]: ../05-custom-agents/README.md
[s02]: ../02-instructions-files/README.md
[s03]: ../03-prompt-engineering-and-iteration/README.md
[s05]: ../05-custom-agents/README.md
[s07]: ../07-real-world-workflow/README.md
[copilot-cli-docs]: https://docs.github.com/en/copilot/how-tos/use-copilot-agents/use-copilot-cli
[copilot-skills]: https://docs.github.com/en/copilot
[owasp-sqli]: https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html
[python-modern]: https://docs.python.org/3/library/pathlib.html
