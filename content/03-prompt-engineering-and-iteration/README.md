# Section 3 — Prompt engineering and CLI session control

| [← Previous: Instructions files][previous-lesson] | [Next: Agent skills →][next-lesson] |
|:--|--:|

The hard part of advanced CLI usage isn't writing clever prompts — it's
controlling the session. Asking for a plan before edits, reviewing diffs
before accepting, and knowing how to rewind when the agent goes sideways.
This section is about staying in charge of a multi-turn agent session.

## What you will learn

- How to use plan-first prompting to keep multi-step changes auditable.
- The CLI session-control surface: context, sessions, resume, compact,
  and how to use `@`-file and `#`-issue mentions to keep prompts focused.
- How to review and selectively reject agent edits via `/diff` and
  `/review`.
- How to roll back when an iteration goes the wrong way — using both
  CLI mechanisms (`/rewind` / `/undo` if available) and git as the
  always-available safety net.

## Scenario

> [!NOTE]
> **Starting state**: clean fork of `legacy-app` with the instructions
> files from [Section 2][s02] in place. Both exercises modify Java or
> template code. Make a clean branch (e.g., `section-03`) before starting.

You've got Copilot grounded in the project. Now you'll fix two real bugs
in AssetTrack — a SQL injection and a dashboard display bug — and use them
as a forcing function to learn how to plan, review, iterate, and roll
back inside a CLI session.

## Tech overview: Plan-first prompting and CLI session control

Talking points:

- Plan-first as a workflow: ask for a written plan before any edits, push
  back on the plan, then approve the edits.
- Slash commands worth knowing for session control:
  `/plan`, `/context`, `/compact`, `/session`, `/resume`,
  `/clear`. Defer the diff/review/rewind family to the next overview.
- `@`-file mentions to drag a specific file into the agent's context;
  `#`-issue mentions if your CLI version supports them.
- Why long, drift-prone sessions hurt quality, and how `/compact`
  (or starting a new session with a focused prompt) helps.
- Prompting patterns specific to brownfield work: "explain before
  change," "smallest possible diff," "tell me what you're about to do
  before doing it."

## Exercise: Plan-first refactor of `AssetRepository.findByAssetTag()`

Talking points:

- **Goal**: fix the SQL-injection vulnerability in
  `AssetRepository.findByAssetTag()` using a plan-first workflow — no
  blind edits.
- **Files/areas touched**: `AssetRepository.java` (one method only).
  `searchAssets()` is intentionally **not** in scope here — leave it
  for later authors.
- **Steps**:
  - Pull `AssetRepository.java` into context with `@`.
  - Ask Copilot for a plan: what's wrong, what the fix looks like, what
    the test/verification approach is. Don't accept any edit yet.
  - Iterate on the plan until it specifies parameterized
    `PreparedStatement` usage and identifies whether tests exist.
  - Approve the implementation step.
- **How to verify**: the method uses `PreparedStatement` with `?`
  placeholders (no string concatenation of user input); the app still
  starts; an existing or newly added test for `findByAssetTag` passes.

## Tech overview: Iterating, reviewing diffs, and rolling back

Talking points:

- Reviewing what the agent did before you accept it: `/diff`, `/review`,
  reading tool-call output carefully.
- Rejecting individual tool calls vs. accepting the whole turn.
- Rolling back: `/rewind` / `/undo` if your CLI version supports them;
  `git restore` / `git reset` / `git stash` as universal fallbacks.
- Why git checkpoints (`git commit -m "wip"` between turns) are the
  cheapest insurance policy in agentic work.
- Recognizing when a session has drifted and it's better to start fresh
  with a tighter prompt than to keep iterating.

## Exercise: Iterate on the dashboard color-mapping bug

Talking points:

- **Goal**: fix the Bootstrap label color mapping on the dashboard so
  retired assets render gray and lost assets render red.
- **Files/areas touched**: `dashboard.html` and possibly `app.js`.
- **Steps**:
  - Start a focused session.
  - Ask Copilot to identify the wrong mapping (e.g., "retired" rendered
    as `label-success`, "lost" as `label-info`).
  - Use `/diff` to inspect the proposed change.
  - If the first attempt over-reaches (e.g., touches unrelated badges
    or restyles the page), reject and re-prompt or rewind.
  - Repeat until the diff is tight: only the status-color mapping
    changes.
- **How to verify**:
  - `retired` renders with `label-default` (gray)
  - `lost` renders with `label-danger` (red)
  - other badges (`available`, `assigned`) are unchanged.
  - The dashboard summary numbers still match the underlying data.

## Summary

You've now run two real edits through a controlled, plan-first workflow,
seen the diff/review surface, and practiced rolling back. From here on,
plan-first is the default expectation when the work is non-trivial.

Next, you'll move from one-off prompts to **reusable skills** in
[Section 4][next-lesson].

## Resources

- [Copilot CLI documentation][copilot-cli-docs]
- [Copilot CLI commands and slash commands][copilot-cli-commands]
- [Best practices for prompting GitHub Copilot][copilot-prompting]
- [Spring JDBC parameterized queries reference][spring-jdbc]

---

| [← Previous: Instructions files][previous-lesson] | [Next: Agent skills →][next-lesson] |
|:--|--:|

[previous-lesson]: ../02-instructions-files/README.md
[next-lesson]: ../04-agent-skills/README.md
[s02]: ../02-instructions-files/README.md
[copilot-cli-docs]: https://docs.github.com/en/copilot/how-tos/use-copilot-agents/use-copilot-cli
[copilot-cli-commands]: https://docs.github.com/en/copilot/how-tos/use-copilot-agents/use-copilot-cli
[copilot-prompting]: https://docs.github.com/en/copilot/get-started/best-practices
[spring-jdbc]: https://docs.spring.io/spring-framework/reference/data-access/jdbc.html
