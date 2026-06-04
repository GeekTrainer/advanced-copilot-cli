# Section 3: Enhancing the test suite with remote control and delegation

| [← Previous: Building an AI infrastructure][previous-lesson] | [Next: Shaping Copilot CLI's lifecycle with hooks →][next-lesson] |
|:--|--:|

Section 2 made AssetTrack more accessible. Now you need proof that lasts longer than one manual click-through. The next time someone touches the form, navigation, or dashboard, the test suite should raise a clear signal if something important breaks.

Your first job is to make that signal real. You'll ask Copilot CLI to scaffold a small Playwright suite, then treat the first failures as evidence instead of noise. Some failures will point to test setup. Some may expose real accessibility gaps. Your job is to tell the difference and make the smallest responsible fix.

Then you'll stretch the workflow beyond one terminal. `/remote` lets you steer the active CLI session from GitHub.com or GitHub Mobile, while `/delegate` sends the larger test backfill to Copilot cloud agent. The goal is the rhythm developers actually need: test the fragile path, read the result, fix only what the evidence supports, and hand agents work with enough context that the pull request is reviewable.

<img src="images/03-test-backed-workflow.png" alt="Test-backed agent workflow showing Section 2 accessibility work flowing into Playwright tests, failure diagnosis, remote control, delegation, and pull request review" width="800"/>

## What you will learn

In this lesson, you will learn:

- how to decide which test work belongs in your local session and which work is safe to delegate.
- how `/remote` lets you steer an active Copilot CLI session from GitHub.com or GitHub Mobile.
- how `/delegate` hands a scoped task to Copilot cloud agent.
- how to use test output to guide small, targeted improvements to the app.
- how to write a useful delegation brief.
- how to review an agent-created pull request before merging it.

## Scenario

> [!NOTE]
> **Starting state**: your fork contains the AI infrastructure from [Section 2][previous-lesson], including repository instructions, scoped instructions, issue and PR templates, and the `accessibility-updater` custom agent. If you used the agent to make accessibility updates, commit those changes before starting this section. If you only created and smoke-tested the agent but did not apply accessibility fixes, some Playwright tests may fail. That's useful information, not a disaster. Exercises target your fork only.

You're still working on **AssetTrack**, Contoso Industries' internal asset-tracking app. The app has a few backend smoke tests, but the UI has no browser test coverage yet. That leaves the team guessing when accessibility changes are made.

Playwright lets you test the app the way a person uses it: load a page, find controls by label, tab through links, and confirm the right content appears. Copilot CLI can help you get the first tests in place, but you still need to make the calls a developer would make. Is the test wrong? Is the app wrong? Is the environment broken?

Once the first pass is working, the rest of the test backfill is a good candidate for delegation. It has concrete files, concrete commands, and a pull request you can review.

## Tech topics

This section covers:

- `/remote`, which gives you remote control of the Copilot CLI session already running in your terminal or codespace.
- `/delegate`, which hands scoped work to Copilot cloud agent.
- Copilot cloud agent, the hosted agent that creates a branch, commits changes, and opens a draft pull request.
- Test-guided agent work: create a test, read the failure, make a narrow fix, then rerun the command.

<img src="images/03-copilot-work-surfaces.png" alt="Three Copilot work surfaces compared side by side: local Copilot CLI, remote control with slash remote, and delegation with slash delegate" width="800"/>

## Choosing the right place for the work

Not every task belongs in the same agent session. Some work needs you in the loop. Some work is mostly mechanical once the instructions are specific.

| Surface | Where work happens | Use it for | Be careful about |
|---|---|---|---|
| Local Copilot CLI session | Your terminal or codespace | Exploration, debugging, reviewing diffs, making judgment calls | You approve tool calls and keep the session running |
| `/remote` | The same active CLI session, controlled from GitHub.com or GitHub Mobile | Watching longer commands, approving prompts while away, checking progress from another device | The original machine or codespace must stay online |
| `/delegate` | Copilot cloud agent on GitHub | Test backfills and other scoped work with commands that prove success | Uncommitted local changes may not be available to the cloud agent |

> [!IMPORTANT]
> `/remote` does not move the work to a hosted runner. It gives you remote control of the session that is already running. Use `/delegate` when you want Copilot cloud agent to work on GitHub in the background.

## Exercise: Start the Playwright test suite locally

In this exercise, you'll ask Copilot CLI to add the first Playwright tests for the AssetTrack web UI. Keep the first pass small. The point is to get a real test harness running, then use the results to validate the accessibility work from Section 2.

<img src="images/03-test-evidence-loop.png" alt="Playwright evidence loop showing scaffold, run, classify, fix narrowly, rerun, and commit evidence" width="800"/>

1. Open your fork of `GeekTrainer/legacy-app` in a codespace.
2. Open a terminal with <kbd>Ctrl</kbd> + <kbd>`</kbd>.
3. Confirm dependencies are installed. The devcontainer normally runs `npm install && npm run install:all` when it is created. If you see missing package errors, run:

    ```bash
    npm install
    npm run install:all
    ```

4. Start the app from the repository root:

    ```bash
    npm run dev
    ```

5. Wait for the services to start, then open the web app:

    ```text
    http://localhost:4321
    ```

> [!NOTE]
> In Codespaces, use the forwarded port URL for port 4321 if `http://localhost:4321` does not open from your browser. You can find it in the **Ports** tab.

6. Stop the dev server with <kbd>Ctrl</kbd> + <kbd>C</kbd> before continuing.
7. Start Copilot CLI from the repository root:

    ```bash
    copilot
    ```

8. If prompted to trust the folder, approve access for the session. If Copilot asks about session sync, use the option your instructor recommends.
9. Ask Copilot to inspect the current test setup:

    ```text
    Inspect this repository's current test setup. Summarize what test frameworks already exist, which services have tests, which services are missing tests, and where a Playwright browser test suite should live. Do not edit files yet.
    ```

10. Review the response. Copilot should find:
    - xUnit tests under `services/assets-svc/Tests/`.
    - a Spring Boot context test under `services/workforce-svc/src/test/`.
    - an intentionally empty `services/reporting-svc/tests/` folder.
    - no Playwright setup for `services/web` yet.
    - a good reason to put the Playwright config at the repo root, since the tests need to start the full app with `npm run dev`.
11. Ask Copilot to scaffold Playwright:

    ```text
    Add a minimal Playwright browser test setup for the AssetTrack web UI.

    Requirements:
    - Put the Playwright config at the repository root as playwright.config.ts.
    - Put tests under tests/playwright/.
    - Add npm scripts at the repository root for test:e2e and test:e2e:ui.
    - Use the existing npm run dev command as the Playwright webServer command.
    - Target http://localhost:4321 as the base URL.
    - Use Chromium only for now so the course exercise stays fast.
    - Do not change production application code in this step.
    - After editing, run the install or test command needed to verify the setup. A normal first setup may add @playwright/test and run npx playwright install chromium. In Codespaces, npx playwright install --with-deps chromium may be needed.
    ```

12. Review the permission prompts before approving them. A reasonable first result is:

    ```text
    playwright.config.ts
    tests/playwright/accessibility.spec.ts
    package.json
    package-lock.json
    ```

13. Before running the whole app, ask Copilot to check that Playwright can see the tests:

    ```text
    Run npx playwright test --list and confirm the accessibility tests are discovered. If the command fails, fix only the Playwright setup.
    ```

14. Ask Copilot to add focused accessibility tests:

    ```text
    Create the first Playwright accessibility tests for AssetTrack.

    Cover these user-visible behaviors:
    1. The dashboard has a navigation landmark, a main landmark, and a level-one heading named Dashboard.
    2. The top navigation exposes the active page with aria-current="page" when the user opens Dashboard and Assets.
    3. The new asset form fields can be located by accessible label: Asset tag, Type, Manufacturer, Model, Serial number, Status, Purchase date, Warranty expiry, and Notes.
    4. The assets list filter controls can be located by accessible label: Type, Status, and Search tag / manufacturer / model.
    5. A keyboard user can tab from the page into the navigation and reach the Assets link.

    Keep the tests small and readable. Prefer Playwright role and label locators such as getByRole and getByLabel. Do not use CSS selectors unless there is no accessible alternative.
    ```

> [!NOTE]
> If `getByLabel` fails, read the failure carefully. A visible label is not enough if it is not connected to the input, select, or textarea. That is exactly the kind of issue these tests should catch.

15. Run the Playwright tests:

    ```text
    Run the Playwright tests and summarize the result. If any tests fail, classify each failure as one of: test bug, app accessibility gap, or environment/startup issue. Do not change production code yet.
    ```

16. Review the output. You may see form labels that are not associated with controls, keyboard focus problems, or service startup issues.
17. If the test setup is broken, keep the fix limited to the setup:

    ```text
    Fix only the Playwright setup or test code needed to make the tests run reliably. Do not change application source files yet. Keep the scope limited to playwright.config.ts, tests/playwright/**, and package files.
    ```

18. If the failures point to real accessibility gaps, use the custom agent from Section 2 for a narrow follow-up fix. If Copilot does not automatically switch to the right agent, run `/agent`, select `accessibility-updater`, and then send the prompt:

    ```text
    Fix only the accessibility gaps identified by the failing Playwright tests. Keep the changes narrow: associate labels with their controls, add missing landmark labels if needed, and avoid visual redesigns. After the fix, rerun npm run test:e2e and summarize the before/after result.
    ```

19. Review the test evidence Copilot gives you. A useful summary should include:
    - the command it ran.
    - how many tests Playwright found.
    - the pass/fail count.
    - each failure classified as a test bug, app accessibility gap, or environment/startup issue.
    - the next action Copilot recommends.
20. Review the diff. You want either a passing validation result or a small app change backed by a test result. Commit the Playwright foundation. Commit the accessibility fix only if one was needed.

    Suggested commit messages:

    ```text
    test: add Playwright accessibility foundation
    fix: address accessibility gaps found by Playwright
    ```

> [!IMPORTANT]
> A failing test can be a good result if it points to a real gap. Do not stop at the report, though. The real workflow is test, diagnose, fix narrowly, rerun, then commit the evidence.

## Remote control with `/remote`

Remote control lets you connect to a running Copilot CLI session from a browser or GitHub Mobile. You can view output, respond to permission prompts, and keep working without sitting in front of the terminal.

Remote control and delegation solve different problems:

- **Remote control** steers the same active CLI session.
- **Delegation** starts asynchronous work with Copilot cloud agent.

Remote control is handy when a task takes a while, such as installing Playwright browsers, starting several services, or waiting for browser tests to finish.

<img src="images/03-remote-control-flow.png" alt="Remote control flow showing GitHub.com and GitHub Mobile steering the same active Copilot CLI session running in a terminal or codespace" width="800"/>

## Exercise: Use `/remote` to steer the session from GitHub

In this exercise, you'll enable remote control for the running Copilot CLI session and use the remote UI to run the Playwright suite again. This is realistic when a validation command is running in your codespace and you need to approve the next step from another tab or device.

1. In the same Copilot CLI session, enter:

    ```text
    /remote on
    ```

2. Copilot CLI displays a link to open the session on GitHub.com. Open the link. You should see the same conversation that is visible in your terminal.
3. Sign in with the same GitHub account that started the CLI session.
4. Confirm the remote page shows the current prompt history and accepts a new message.
5. From the remote session UI, send this prompt:

    ```text
    Run the Playwright suite again. If the app needs to start first, use the existing Playwright webServer configuration. Summarize any failures as test bug, app accessibility gap, or environment/startup issue.
    ```

6. Watch the session from the browser or mobile app. If Copilot asks for permission to run commands, respond from the remote UI.
7. If you expect to step away while the machine or codespace keeps working, enter this in the CLI session:

    ```text
    /keep-alive busy
    ```

> [!TIP]
> If your Copilot CLI version does not recognize `/keep-alive`, keep the codespace or machine active using your instructor's environment guidance. Remote control lets you steer the session, but it cannot keep a stopped terminal session alive.

8. When you are done testing remote control, enter:

    ```text
    /remote off
    ```

You can also enter `/remote` without an argument to check the current status.

> [!NOTE]
> If Copilot reports that remote sessions are disabled because the current folder is not a GitHub repository, confirm you started Copilot from the root of your fork of `legacy-app`. Remote control also does not fix missing local dependencies. If the original environment cannot install Playwright browsers or start the app, fix that environment or switch to the course codespace.

## Authoring delegation prompts that work

The next exercise uses `/delegate`, which sends work to Copilot cloud agent. The cloud agent works on GitHub, creates a branch, makes commits, and opens a draft pull request.

This is where the chapter shifts from local help to team workflow. You define a test backlog item, send it to the cloud agent, and review the PR like you would review a teammate's work.

<img src="images/03-delegation-handoff-flow.png" alt="Delegation handoff flow showing a local branch and delegation brief sent through slash delegate to Copilot cloud agent, which opens a draft pull request for human review" width="800"/>

Good delegation prompts include:

- the exact files or folders in scope.
- commands the agent should run.
- things the agent should not touch.
- what the PR description should include.
- what to do if a real bug blocks the test.

A weak prompt is vague:

```text
/delegate improve the tests
```

A better prompt gives the agent a job it can finish:

```text
/delegate Add Playwright tests under tests/playwright for the AssetTrack navigation and asset form accessibility behaviors described in docs/delegations/test-backfill.md. Do not change production code. Open a draft PR with test evidence.
```

The brief should live in the repo so the prompt can point to a real artifact and reviewers can see what the agent was asked to do.

## Exercise: Use `/delegate` to offload the test backfill

In this exercise, you'll create a delegation brief and send it to Copilot cloud agent. The primary job is to expand the Playwright accessibility coverage you started locally. Since the cloud agent will already be working in the test suite, you'll also ask it to backfill a few unit tests for the .NET asset service and the Python reporting service. This is a real backlog item: bounded, worth doing, and easy to verify with commands.

1. Ask Copilot CLI to create a delegation brief:

    ```text
    Create docs/delegations/test-backfill.md with a delegation brief for Copilot cloud agent.

    The brief should make the priorities clear:

    Primary goal:
    - Expand the Playwright accessibility coverage started locally for the AssetTrack UI.
    - Keep using role and label locators where possible.
    - Cover the dashboard, navigation, asset list filters, and new asset form behaviors introduced earlier in this section.

    Secondary goal:
    - Add xUnit backfill coverage for services/assets-svc covering create, read, update, delete, search, stats-by-status, and not-found edge cases.
    - Add pytest backfill coverage for services/reporting-svc covering warranty-expiring reports, utilization reports, and CSV import behavior.

    Constraints:
    - Do not change production application code.
    - Do not add new backend framework dependencies unless required for the test framework already implied by the service.
    - Prefer isolated test data and temporary SQLite databases.
    - If a real production bug blocks a test, document it in the PR and add a skipped or clearly named failing test only if the course instructor approves.
    - Include exact commands run in the PR description.
    ```

2. Review the generated brief before continuing. It should be specific enough for the cloud agent to act without asking you many follow-up questions.
3. Make sure the cloud agent can see the state you want it to work from. First, ask Copilot for a read-only review of the working tree:

    ```text
    Show me the current git status and summarize the files changed for the Playwright setup, accessibility follow-up if any, and delegation brief. Do not commit or push yet.
    ```

4. Review the output before approving any write operation. Pay special attention to `package-lock.json`. It should only reflect the packages needed for this test setup. The files you expect to see are usually:
    - `playwright.config.ts`
    - `tests/playwright/accessibility.spec.ts`
    - `package.json`
    - `package-lock.json`
    - `docs/delegations/test-backfill.md`
    - any narrow Astro accessibility fix, only if the tests proved one was needed
5. After the diff summary looks right, ask Copilot to create the branch, commit, and push:

    ```text
    Create a branch named test-suite-foundation. Commit the Playwright foundation and delegation brief with the message "test: add Playwright accessibility foundation". If there is a narrow accessibility fix, use a second commit with the message "fix: address accessibility gaps found by Playwright". Then push the branch to my fork.
    ```

> [!WARNING]
> Do not delegate from a dirty working tree unless you understand what Copilot is checkpointing. The cloud agent works from GitHub state, not from hidden local files.

6. Use `/delegate` with the brief:

    ```text
    /delegate Use docs/delegations/test-backfill.md as the source of truth. Focus first on expanding the Playwright accessibility coverage started locally, then add the secondary xUnit and pytest backfill described in the brief. Keep production application code unchanged. If production behavior blocks a test, document the gap in the PR instead of fixing it. Open a draft pull request with the title "Add test suite backfill" and include the commands you ran plus their results in the PR description.
    ```

7. Copilot may ask to create a checkpoint commit or confirm the target repository. Review the prompt and approve only if it points to your fork.
8. Once the cloud agent starts, Copilot CLI provides links to the agent session and the draft pull request when it is created.
9. While the cloud agent works, continue reviewing the local Playwright results:

    ```text
    Based on the current Playwright results, identify which ones are likely real accessibility gaps and which ones are test setup issues. Create a short note I can use during PR review.
    ```

10. When the PR is ready, review it like any other PR. You can use GitHub.com, or ask Copilot CLI to help inspect it:

    ```text
    Open the draft PR created by the delegated test backfill. Summarize the changed files, the tests added, the commands reported by the agent, and any production code changes.
    ```

11. Review the PR against this checklist:
    - The PR targets your fork and the expected branch.
    - The PR description references `docs/delegations/test-backfill.md`.
    - Playwright tests live under `tests/playwright/`.
    - Asset service tests live under `services/assets-svc/Tests/`.
    - Reporting service tests live under `services/reporting-svc/tests/`.
    - The agent did not change production code unless it clearly explained why.
    - The PR includes test evidence, including commands and results.
    - Any skipped or failing tests are justified and easy to find.
12. If the PR needs changes, comment with specific feedback:

    ```text
    Please revise the Playwright tests to use role and label locators instead of CSS selectors. Keep production code unchanged. Update the PR description with the new test command output.
    ```

13. Before merging, make sure the required test tools are available. For the reporting service, the dev dependencies include `pytest`. If `pytest` is missing, install the service with its dev extras from the repository root:

    ```bash
    pip install -e "services/reporting-svc[dev]"
    ```

14. Run or verify the main commands:

    ```bash
    npm run test:e2e
    dotnet test services/assets-svc/Tests/AssetsService.Tests.csproj
    cd services/reporting-svc && pytest
    ```

15. Depending on your environment, you may also run:

    ```bash
    npm --prefix services/web run build
    ```

At the end of this section, your fork should contain the Playwright foundation, a validation result for the Section 2 accessibility work, any narrow follow-up accessibility fix that was needed, and a delegation brief. The delegated PR should primarily expand Playwright accessibility coverage, with xUnit and pytest backfill included as secondary work. The exact test file names matter less than the behaviors covered and the commands that prove they work.

## Summary

You used Copilot CLI in three different ways in this section. First, you worked locally to create the Playwright foundation and validate the accessibility work. Then you used `/remote` to steer that same session from GitHub. Finally, you used `/delegate` to send a scoped test backfill to Copilot cloud agent.

In this lesson, you learned:

- how to start a Playwright suite for AssetTrack.
- how to read early browser test failures without guessing.
- how to turn a failing accessibility test into a narrow product improvement when the evidence calls for it.
- how `/remote` gives you remote control of an active CLI session.
- how `/delegate` sends scoped work to Copilot cloud agent.
- how to write and review a useful delegation brief.

Next, you'll **shape Copilot CLI's lifecycle with hooks** so tests, builds, and lint checks run automatically as Copilot edits the project in [Section 4][next-lesson].

## Resources

- [Steer a Copilot CLI session remotely][remote-docs]
- [Delegate tasks to Copilot cloud agent][delegate-docs]
- [About Copilot cloud agent][cloud-agent]
- [Playwright getting started][playwright]
- [Playwright locators][playwright-locators]
- [Accessible name and description computation][accessible-name]

---

| [← Previous: Building an AI infrastructure][previous-lesson] | [Next: Shaping Copilot CLI's lifecycle with hooks →][next-lesson] |
|:--|--:|

[previous-lesson]: ./02-building-ai-infrastructure.md
[next-lesson]: ./04-lifecycle-hooks.md
[remote-docs]: https://docs.github.com/copilot/how-tos/copilot-cli/use-copilot-cli/steer-remotely
[delegate-docs]: https://docs.github.com/copilot/how-tos/copilot-cli/use-copilot-cli/delegate-tasks-to-cca
[cloud-agent]: https://docs.github.com/copilot/concepts/agents/cloud-agent/about-cloud-agent
[playwright]: https://playwright.dev/docs/intro
[playwright-locators]: https://playwright.dev/docs/locators
[accessible-name]: https://www.w3.org/TR/accname-1.2/
