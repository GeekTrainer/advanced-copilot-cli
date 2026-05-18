# Section 3 — Enhancing the test suite with remote and delegation

| [← Previous: Building an AI infrastructure][previous-lesson] | [Next: Shaping Copilot CLI's lifecycle with hooks →][next-lesson] |
|:--|--:|

Validating an accessibility upgrade — or any change — means having tests that actually exercise the behavior. This section uses Playwright tests as the forcing function for two surfaces beyond the local CLI: `/remote` for running Copilot CLI against a hosted environment, and `/delegate` for handing well-bounded work to the Copilot cloud agent.

## What you will learn

- The local-vs-remote-vs-cloud trade-off for Copilot work.
- How `/remote` lets a Copilot CLI session operate against a hosted environment.
- How `/delegate` hands a session off to the Copilot cloud agent — what state travels, what comes back, and how to review the resulting PR.
- What makes a delegation prompt actually work — and what makes it fail silently.

## Scenario

> [!NOTE]
> **Starting state**: your fork has the AI infrastructure from [Section 2][s02] in place, including the `accessibility-updater` custom agent and the changes it produced. The test scaffold exists but is incomplete. Exercises **target the learner's fork only**.

You shipped accessibility changes in [Section 2][s02] with a test scaffold that's not yet complete. You'll start the test work locally with Playwright, use `/remote` to drive a session against a hosted environment, then hand the broader test backfill to the Copilot cloud agent via `/delegate` so you can keep moving on other work.

## Tech overview: `/remote` and the Copilot cloud agent

Talking points:

- **Same harness, three surfaces**: the same Copilot CLI logic runs locally, against a remote hosted environment via `/remote`, or fully asynchronously as the cloud agent.
- **`/remote`** — drive a Copilot session against a hosted runner while you keep using your terminal. Useful when local setup is heavy (multi-stack apps, big test runners) or when you want CI-equivalent execution without leaving the CLI.
- **Copilot cloud agent** — fully asynchronous. Runs on a hosted runner, opens a branch on the configured repo, makes commits, opens a PR. You catch up when the PR lands.
- **When delegation pays off**:
  - Scope is clearly bounded ("write tests for these N files").
  - Acceptance criteria are objective (CI passes, coverage exceeds X, specific behaviors are exercised).
  - You don't need to be in the loop turn-by-turn.
- **When delegation hurts**:
  - Work needs your judgment at each step (architecture decisions, ambiguous requirements).
  - Scope is fuzzy ("improve the codebase").
  - The agent needs context only available locally (uncommitted changes, your shell history).

## Exercise: Start the Playwright tests locally and use `/remote` to validate against a hosted environment

Talking points:

- **Goal**: produce a small, working Playwright suite for the migrated accessibility flow, then validate it against a hosted environment using `/remote`.
- **Files/areas touched**: new test files under `tests/playwright/accessibility/` and `playwright.config.*` if missing.
- **Steps**:
  - Scaffold a minimal Playwright config for AssetTrack.
  - Have Copilot draft tests for: keyboard navigation on dashboard and asset list, alt text presence, form labels on the create / search forms, landmark presence.
  - Run the suite locally to confirm it executes (failures are acceptable — they document the gaps).
  - Invoke `/remote` to run the same suite against a hosted environment and compare results.
- **How to verify**: tests execute both locally and via `/remote`; failure messages clearly identify the a11y gap or environment mismatch.

## Tech overview: Authoring delegation prompts that work

Talking points:

- **What good delegation prompts look like**:
  - Specific files / scope.
  - Explicit acceptance criteria.
  - "Do not" rules where they matter.
  - References to existing patterns (e.g., "match the test style in `AssetServiceTest.java`").
  - Output expectations (PR title, description format, label).
- **What bad delegation prompts look like**:
  - Vague verbs ("improve", "enhance", "modernize").
  - No success criteria.
  - No constraint on what *not* to touch.
- **What state travels with `/delegate`**: prompt, conversation history, references to repo state. Local uncommitted changes do not — commit and push first.
- **Reviewing the PR**: use `/pr` to inspect status and diffs; use `/review` to walk the PR with Copilot help; or review on github.com directly.
- **Course-correcting**: leave PR comments to redirect the agent. The cloud agent reads PR comments and iterates.
- **When to abandon a delegation**: if the agent has spun for two iterations without converging, close the PR and either re-scope the brief or do the work locally.

## Exercise: Use `/delegate` to push the test backfill to the cloud agent

Talking points:

- **Goal**: hand a delegation brief to the cloud agent, keep working locally, merge the resulting PR after review.
- **Files/areas touched**: `docs/delegations/test-backfill.md` (the brief, committed as a reviewable artifact); new test files created on the cloud agent's branch.
- **Steps**:
  - Author the brief: list the test gaps to close (Playwright a11y coverage, unit-test gaps in the Java service layer, integration tests for controllers / endpoints across the multi-stack app), state acceptance criteria per gap, and add "do not" rules (don't change production code; don't add new dependencies; file follow-up issues for real bugs).
  - Confirm your fork has the latest committed state.
  - Run `/delegate` with the brief.
  - While the cloud agent works, move on (start sketching the [hooks work][next-lesson]).
  - Review with `/pr` + `/review`. Comment to redirect if needed. Merge once green.
- **How to verify**:
  - PR exists on the learner's fork (not upstream).
  - CI is green.
  - The new tests cover what the brief said they would.
  - No production code was changed (per the brief's "do not" rules).

## Summary

You've now:

- Authored a small Playwright suite locally and used `/remote` to validate it against a hosted environment.
- Written a real delegation brief with explicit scope and acceptance criteria.
- Used `/delegate` to push work to the Copilot cloud agent.
- Reviewed and course-corrected a PR opened by an agent.

Next, you'll **shape Copilot's lifecycle** so the tests (and lint and build) run automatically at the right moments using hooks in [Section 4][next-lesson].

## Resources

- [Using Copilot agents (overview)][copilot-agents]
- [About Copilot coding agent (cloud agent)][cloud-agent]
- [Best practices for writing prompts][copilot-prompting]
- [Playwright test documentation][playwright]

---

| [← Previous: Building an AI infrastructure][previous-lesson] | [Next: Shaping Copilot CLI's lifecycle with hooks →][next-lesson] |
|:--|--:|

[previous-lesson]: ./02-building-ai-infrastructure.md
[next-lesson]: ./04-lifecycle-hooks.md
[s02]: ./02-building-ai-infrastructure.md
[copilot-agents]: https://docs.github.com/copilot/concepts/agents
[cloud-agent]: https://docs.github.com/copilot/concepts/agents/cloud-agent/about-cloud-agent
[copilot-prompting]: https://docs.github.com/copilot/get-started/best-practices
[playwright]: https://playwright.dev/docs/intro
