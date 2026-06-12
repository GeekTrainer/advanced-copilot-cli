# Section 3 — Enhancing the test suite with remote and delegation

| [← Previous: Building an AI infrastructure][previous-lesson] | [Next: Shaping Copilot CLI's lifecycle with hooks →][next-lesson] |
|:--|--:|

Validating an accessibility upgrade — or any change — means having tests that actually exercise the behavior. This section uses Playwright tests as the forcing function for two surfaces beyond the local CLI: `/remote` for running Copilot CLI against a hosted environment, and `/delegate` for handing well-bounded work to the Copilot cloud agent.

## What you will learn

By the end of this section you will be able to:

- Choose between local, remote, and cloud execution for a given piece of Copilot work.
- Use `/remote` to operate a Copilot CLI session against a hosted environment.
- Use `/delegate` to hand a session off to the Copilot cloud agent, and review the resulting PR.
- Write a delegation prompt that succeeds instead of failing silently.

## Scenario

You shipped accessibility changes in [Section 2][s02] with a test scaffold that's not yet complete. You'll start the test work locally with Playwright, use `/remote` to drive a session against a hosted environment, then hand the broader test backfill to the Copilot cloud agent via `/delegate` so you can keep moving on other work.

> [!NOTE]
> Starting state: your fork has the AI infrastructure from [Section 2][s02] in place, including the `accessibility-updater` custom agent and the changes it produced. The test scaffold exists but is incomplete. Exercises target the learner's fork only.

## Three surfaces for Copilot work

The same Copilot CLI logic runs in three places, and choosing the right one is the core skill of this section.

- Running locally drives a Copilot session in your own terminal. This is best when work needs your judgment turn-by-turn, scope is fuzzy, or the agent needs context that only exists locally such as uncommitted changes or shell history.
- `/remote` drives a Copilot session against a hosted runner while you keep using your terminal. It's useful when local setup is heavy (multi-stack apps, large test runners) or when you want CI-equivalent execution without leaving the CLI.
- The Copilot cloud agent works fully asynchronously. It runs on a hosted runner, opens a branch on the configured repo, makes commits, and opens a PR. You catch up when the PR lands.

Delegation to the cloud agent pays off when scope is clearly bounded ("write tests for these N files"), acceptance criteria are objective (CI passes, specific behaviors are exercised), and you don't need to be in the loop at each step. It hurts when work needs your judgment at every step, scope is vague ("improve the codebase"), or the agent needs context only available locally.

## Exercise 1: Start the Playwright tests locally and validate with `/remote`

In this exercise you'll produce a small, working Playwright suite for the migrated accessibility flow, then validate it against a hosted environment using `/remote`. You'll create new test files under `tests/playwright/accessibility/` and a `playwright.config.*` if one is missing.

1. With Copilot CLI running in your codespace, ask Copilot to scaffold a minimal Playwright config for AssetTrack:

    ```text
    Scaffold a minimal Playwright config for the AssetTrack web app if one doesn't already exist. Use the existing dev server command as the webServer and target the local web URL.
    ```

2. Ask Copilot to draft accessibility tests for the key flows:

    ```text
    Draft Playwright tests under tests/playwright/accessibility/ for: keyboard navigation on the dashboard and asset list, alt text presence on images, form labels on the create and search forms, and landmark presence on each page.
    ```

3. Run the suite locally to confirm it executes. Failures are acceptable here — they document the accessibility gaps:

    ```text
    Run the Playwright suite locally and summarize which tests pass and which fail.
    ```

4. Invoke `/remote` to run the same suite against a hosted environment, then compare the results with your local run.

The exercise is complete when the tests execute both locally and via `/remote`, and the failure messages clearly identify either an accessibility gap or an environment mismatch.

## Authoring delegation prompts that work

A delegation prompt is a brief for an agent you won't be supervising, so precision matters more than it does in an interactive session.

A prompt that works specifies the files and scope in play, states explicit acceptance criteria, includes "do not" rules where they matter, references existing patterns (for example, "match the test style in `AssetServiceTest.java`"), and sets output expectations such as PR title, description format, and labels. A prompt that fails leans on vague verbs ("improve", "enhance", "modernize"), omits success criteria, and never constrains what the agent must leave alone.

Only committed state travels with `/delegate` — the prompt, conversation history, and references to repo state. Local uncommitted changes do not, so commit and push first. Once the agent opens a PR, use `/pr` to inspect status and diffs, `/review` to walk the PR with Copilot, or review on GitHub.com directly. Leave PR comments to redirect the agent; it reads them and iterates. If the agent has spun for two iterations without converging, close the PR and either re-scope the brief or do the work locally.

## Exercise 2: Delegate the test backfill with `/delegate`

In this exercise you'll hand a delegation brief to the cloud agent, keep working locally, and merge the resulting PR after review. You'll commit the brief as a reviewable artifact at `docs/delegations/test-backfill.md`; the new test files are created on the cloud agent's branch.

1. Ask Copilot to author the delegation brief as a committed artifact:

    ```text
    Create docs/delegations/test-backfill.md describing the test gaps to close: Playwright accessibility coverage, unit-test gaps in the Java service layer, and integration tests for controllers and endpoints across the stack. State acceptance criteria per gap and add "do not" rules: don't change production code, don't add new dependencies, and file follow-up issues for real bugs.
    ```

2. Confirm your fork has the latest committed state so the agent works from what you expect:

    ```text
    Show me git status and confirm everything needed for the delegation is committed and pushed.
    ```

3. Run `/delegate` with the brief to hand the work to the cloud agent.
4. While the cloud agent works, move on to other work — for example, start sketching the [hooks work][next-lesson] from the next section.
5. Review the PR with `/pr` and `/review`. Leave comments to redirect the agent if needed, and merge once CI is green.

The exercise is complete when a PR exists on the learner's fork (not upstream), CI is green, the new tests cover what the brief specified, and no production code was changed per the brief's "do not" rules.

## Summary

You've now:

- Authored a small Playwright suite locally and used `/remote` to validate it against a hosted environment.
- Written a real delegation brief with explicit scope and acceptance criteria.
- Used `/delegate` to push work to the Copilot cloud agent.
- Reviewed and course-corrected a PR opened by an agent.

Next, you'll shape Copilot's lifecycle so the tests — and lint and build — run automatically at the right moments using hooks in [Section 4][next-lesson].

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
