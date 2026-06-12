# Module 4 — Shaping Copilot CLI's lifecycle with hooks

| [← Previous: Enhancing the test suite with remote and delegation][previous-lesson] | [Next: Adding a new feature →][next-lesson] |
|:--|--:|

Agents that move fast still need feedback loops. Hooks let you wire that feedback in automatically — run tests after an edit, lint on save, build before a commit — so Copilot's next decision is grounded in the result of the last one, not in a stale assumption.

## What you will learn

- What lifecycle hooks are in Copilot CLI and where they fit in the agent loop.
- The categories of work that belong in a hook (validation, formatting, build) vs. work that doesn't (judgment calls).
- How to author a hook, register it, and troubleshoot it when it misfires.
- How hooks complement instructions, skills, and custom agents.

## Scenario

> [!NOTE]
> **Starting state**: instructions, custom agents, and the test scaffold from [Modules 2–3][m02] in place. Exercises **target the learner's fork only** and add config files; no production code changes.

Your test suite is growing. Right now Copilot runs the tests only when you remember to ask. Hooks fix that — every time the agent edits a file in a covered area, the right checks fire automatically and the agent sees the result on its next turn.

## Tech overview: Lifecycle hooks in Copilot CLI

Talking points:

- **What a hook is**: a small declarative script that runs at a defined point in the agent's lifecycle (e.g., after an edit, before a tool call, before a commit). Output is fed back into the conversation as context.
- **Where hooks live**: repo-scoped configuration (checked into source control so the team gets the same loops) vs. user-level configuration.
- **Hook categories that pay off**:
  - **Validation** — run unit tests, integration tests, type checks, security scanners after a relevant edit.
  - **Formatting / lint** — run the project's formatter / linter and report on diff.
  - **Build** — fast incremental build after structural changes; full build before commit.
- **Hook categories that don't**:
  - Anything requiring human judgment (review, prioritization, design decisions).
  - Long-running commands that block the agent for minutes — push these to CI or a delegation.
- **Hooks vs. other AI infrastructure**:
  - Instructions = always-on context.
  - Skills = on-demand capabilities the agent calls.
  - Custom agents = personas for recurring kinds of work.
  - **Hooks = automatic checkpoints the harness runs around the agent's actions.**
- **Failure mode to avoid**: hooks that flake. A noisy hook trains the agent (and you) to ignore signal.

## Exercise: Author a hook that runs tests and lint after relevant edits

Talking points:

- **Goal**: an after-edit hook that runs the right checks for the file just touched, with output the agent can act on next turn.
- **Files/areas touched**: hook configuration file(s) checked into the repo; small wrapper scripts in `scripts/hooks/` if needed.
- **Steps**:
  - Pick the events you care about for the AssetTrack stack: an edit to `*.java` triggers the relevant Maven/Gradle test goal; an edit to `*.ts`/`*.astro` triggers the JS/TS test runner and a lint pass; an edit to `*.cs` triggers `dotnet test` on the affected project; an edit to `*.py` (FastAPI services) triggers `pytest` plus the project's formatter.
  - Author hook scripts that scope their work to the affected module / project, not the whole monorepo, so they finish fast.
  - Register the hooks in the repo-level config.
  - Run a small edit through the CLI and confirm the right hook fired, with the result surfaced in the next turn's context.
- **How to verify**:
  - `/env` (or the equivalent for your CLI version) shows the hooks registered.
  - Editing a Java service file via Copilot triggers only the Java hook (not the JS or .NET ones).
  - Failing tests surface in the conversation; the agent's next response references the failure.

## Exercise: Observe hook-driven feedback on a real change

Talking points:

- **Goal**: prove the loop end-to-end on a deliberately broken change.
- **Files/areas touched**: a small, reversible edit to a single service file in one of the four stacks (commit after; revert if needed).
- **Steps**:
  - Ask Copilot to add a trivial method to a service in the AssetTrack codebase.
  - Watch the after-edit hook run, report the new test result, and feed back to the agent.
  - Deliberately introduce a broken assertion; confirm the agent sees the failure and proposes a fix on its own turn.
  - Revert if the test is throwaway; commit if you want to keep the example.
- **How to verify**: the agent's response includes the test output verbatim or summarized, and proposes a next step driven by that output.

## Summary

You've now:

- Wired hooks into your local Copilot CLI loop for the AssetTrack stack.
- Seen the after-edit feedback loop close automatically.
- Internalized the distinction between work that belongs in a hook and work that doesn't.

Next, you'll add a real **new feature** — barcode / QR support — and orchestrate it with `/plan`, rubber-duck critique, `/research`, and `/fleet` in [Module 5][next-lesson].

## Resources

- [Copilot CLI documentation][copilot-cli-docs]
- [Best practices for writing prompts][copilot-prompting]

---

| [← Previous: Enhancing the test suite with remote and delegation][previous-lesson] | [Next: Adding a new feature →][next-lesson] |
|:--|--:|

[previous-lesson]: ./03-test-suite-remote-delegation.md
[next-lesson]: ./05-add-feature-barcode.md
[m02]: ./02-building-ai-infrastructure.md
[copilot-cli-docs]: https://docs.github.com/copilot/how-tos/use-copilot-agents/use-copilot-cli
[copilot-prompting]: https://docs.github.com/copilot/get-started/best-practices
