---
name: module-runner
description: |
  Simulate a learner running an advanced-copilot-cli course module end-to-end. Read a module from content/NN-*.md, execute every learner step in order on the machine where the skill runs, run every command and prompt individually, verify outcomes, and write findings to issues/NN-issues.md.
  USE FOR: run a module, test a module, validate a course section, simulate a student, learner walkthrough, find module issues, run section steps.
  DO NOT USE FOR: editing course content without running it, generic code review, running Azure agentic journeys, or static-only content review.
---

# Module Runner

Run an `advanced-copilot-cli` course module exactly like a learner would. The goal is not to skim the lesson or judge it from the Markdown. The goal is to perform the module step by step on the current machine, capture evidence, and report any learner-blocking issues.

## Required behavior

When this skill is invoked in this repository, you must:

1. Identify the target module in `content/`. If the user named a module, use that file. If the user did not name one, use the active or tagged module when available. If there is still no clear module, ask for the module file.
2. Extract the module number from the file name prefix, such as `03` from `content/03-test-suite-remote-delegation.md`.
3. Create a dedicated run workspace under `module-runs/<module-number>-<module-slug>-<timestamp>/` before executing any learner action.
4. Detect and enter the learner project's devcontainer environment before running learner commands when the project provides `.devcontainer/devcontainer.json`.
5. Read the module from top to bottom and build a learner execution plan from headings, numbered steps, fenced code blocks, prompts, expected outcomes, notes, warnings, and summary checks.
6. Execute each learner step in document order. Do not skip steps because they look manual, obvious, or already understood.
7. Run every command, prompt, or required action individually on the machine where the skill runs, inside the learner devcontainer when one is available.
8. Verify the expected result before moving to the next step.
9. Record any issue in `issues/<module-number>-issues.md`, for example `issues/03-issues.md`.

Static review alone is a failed run. If a step cannot be performed, record the reason as an issue with evidence instead of pretending it passed.

## Module format in this repo

Course modules live in `content/` and use numbered file names such as `content/03-test-suite-remote-delegation.md`. The H1 usually starts with a section title, exercises use `## Exercise: ...`, and learner substeps often use `### Phase ...` plus numbered lists. Code fences are meaningful:

- `bash` fences are shell commands the learner runs.
- `text` fences often contain Copilot CLI prompts, slash commands, URLs, or expected output.
- Other language fences may contain code a learner is expected to create, inspect, or compare.

Treat the module text, not assumptions from another course, as the source of truth.

## Execution rules

### Dedicated run workspace

Every run must keep the course repo, run evidence, and learner workspace separate:

| Path | Purpose |
|---|---|
| Course root | The `advanced-copilot-cli` repository where `content/` is read and `issues/<module-number>-issues.md` is written. |
| Run root | `module-runs/<module-number>-<module-slug>-<timestamp>/`, the preserved review folder for this simulation. |
| Learner root | `module-runs/<module-number>-<module-slug>-<timestamp>/learner-workspace/`, the working directory where learner commands, prompts, file edits, installs, app runs, tests, and generated artifacts happen. |

Create the run root before executing learner steps. Inside it, keep review artifacts:

```text
module-runs/<module-number>-<module-slug>-<timestamp>/
├── learner-workspace/
├── logs/
│   ├── commands.md
│   ├── prompts.md
│   └── transcript.md
└── artifacts/
```

Do not run learner commands from the course root unless the module explicitly says the learner should work in the course repository. The course root is for reading module content and writing the issue report.

If the module names a target learner repository, such as the Section 3 instruction to open an AssetTrack repository created from the `GeekTrainer/legacy-app` template, clone or copy that repository into `learner-workspace/` and run the module there. Prefer a fresh clone or copy so the complete resulting state is preserved for review. If the target repository, repository URL, branch, or credentials are not available, stop before the first dependent learner step and record a missing-prerequisite or external-service blocker in the issue report.

### GitHub template repository setup

Some modules depend on a learner-owned repository created from a GitHub template, such as Section 0's AssetTrack repository created from `GeekTrainer/legacy-app`. If the user provides the upstream template repository, a wrong repository, or no writable learner repository, you may offer to create a temporary learner repository from the template with GitHub CLI.

Template repository creation is an external GitHub side effect. Before running `gh repo create --template`, ask for explicit approval with the target owner, repository name, visibility, and cleanup expectation. Do not create, push to, delegate from, or delete a GitHub repository without explicit user approval.

When approved, use a unique repository name that includes the module number and timestamp, unless the user provides a name. Record the template source, created repository URL, visibility, command output, and cleanup expectation in `logs/transcript.md` and `logs/commands.md`. Clone the created repository into `learner-workspace/` and run the module from that clone. If creation fails because of permissions, naming conflicts, missing authentication, organization policy, or unavailable template access, record an external-service blocker and stop before dependent learner steps.

Keep `module-runs/` after the run finishes. Do not delete or overwrite it. Include the run root path in `issues/<module-number>-issues.md` so reviewers can inspect the final learner workspace, logs, and artifacts.

### Devcontainer-first execution

This course's green path is Codespaces. AssetTrack is expected to run in the target project's devcontainer, not directly on the host machine. If the learner project has `.devcontainer/devcontainer.json`, run learner commands and Copilot prompts inside that devcontainer unless the module explicitly says to use the host.

Use this order:

1. If already running inside the target learner repo's Codespace or devcontainer, use that environment and record the container evidence in `logs/transcript.md`.
2. If Docker and the Dev Containers CLI are available, build or start the devcontainer for the learner root, then run each learner command through the devcontainer execution surface.
3. If the Dev Containers CLI is unavailable but VS Code devcontainers or Codespaces controls are available, use that supported surface and record exactly how commands were run.
4. If no devcontainer execution surface is available, stop before dependency or app-start steps that rely on the container toolchain and record an environment blocker. Do not fall back to host execution for Java, Node, Python, .NET, Maven, Playwright, or app startup unless the user explicitly authorizes a local-host fallback.

When using the Dev Containers CLI, prefer this pattern from the course repo host:

```bash
devcontainer up --workspace-folder <learner-root>
devcontainer exec --workspace-folder <learner-root> <command>
```

Run each learner command separately. For example, run `devcontainer exec --workspace-folder <learner-root> npm install`, then `devcontainer exec --workspace-folder <learner-root> npm run install:all`, then start `npm run dev` in a controlled devcontainer process.

Record devcontainer setup separately from module steps. Devcontainer setup failures are environment blockers unless the module or target project contains a broken devcontainer definition.

### Step-by-step learner mode

Execute the module as a learner:

1. Before each step, identify the current heading, line reference, learner action, expected result, working directory, and whether the step changes files or external state.
2. Perform exactly that action.
3. Capture the result: command, prompt, tool used, exit code or observable outcome, and a short output excerpt.
4. Compare the result to the module's stated expectation.
5. Continue to the next step unless the current step blocks the rest of the module.

Do not combine separate learner steps. Do not batch separate commands with `&&` to save time. If the module itself shows a single command line that contains `&&`, run that line as written.

### Shell commands

For each `bash` fence:

1. Run each standalone command line individually in the documented order.
2. Run commands from the learner root by default, not the course root.
3. If the learner project has a devcontainer, run commands inside it by default.
4. Preserve the learner's working directory between commands when the module tells the learner to `cd`.
5. For multi-line commands that use continuation characters, run the continued command as one command.
6. For install commands, run the exact install command unless it is destructive or requires missing credentials.
7. For validation commands, record pass or fail with the actual output.

For dev servers such as `npm run dev`, `npm start`, `dotnet watch`, or similar:

1. Start the server in a controlled background process.
2. Wait until it is actually reachable or ready.
3. Run the verification steps against the running server.
4. Stop the exact process or session when the module no longer needs it.

### Copilot CLI prompts and slash commands

When the module tells the learner to start Copilot CLI and send a prompt:

1. Treat the prompt as an instruction to the current agent session unless the user explicitly asks you to spawn a nested Copilot CLI.
2. Execute the requested work as the learner would, including file edits, command runs, and follow-up verification.
3. Run the follow-up command in the module before deciding the prompt succeeded.

When the module includes slash commands such as `/remote`, `/delegate`, `/agent`, or `/keep-alive`:

1. Attempt the command only through the real Copilot CLI surface available in the current environment.
2. If the slash command cannot be executed from the current skill context, record a blocked or environment issue with the exact command and why it could not be run.
3. Do not replace a slash-command exercise with a conceptual explanation.

### Manual, browser, and external-service steps

Manual learner actions still need execution evidence:

- For browser steps, open or probe the stated URL with available browser automation, HTTP checks, or the environment's browser tooling. Confirm the expected page or UI state.
- For GitHub.com, GitHub Mobile, Codespaces, remote control, delegation, or pull request review steps, use `gh`, browser automation, or available Copilot CLI features when possible.
- If credentials, a GUI, mobile device, or external approval are unavailable, record the step as blocked with enough detail for a human to reproduce it.

Do not mark manual steps as passed unless you observed the required state.

### File edits and side effects

The module may instruct the learner to change an application or create files. Make those changes when the module requires them, because that is part of the learner simulation.

Do not edit the course module itself while running it unless the user explicitly asks for content fixes. The runner's job is to reveal issues, not silently repair the lesson.

For commits, pushes, cloud delegation, Azure deployment, paid resources, or other external side effects, proceed only when the current user invocation explicitly authorizes a full run that includes those side effects, or pause for approval. If approval is not available, record the step as blocked instead of skipping it silently.

## Issue reporting

Create the `issues/` directory if it does not exist. Always write `issues/<module-number>-issues.md` at the end of a run. If there are no issues, write a short report that says no issues were found and includes the executed scope.

Use this structure:

```markdown
# Module <module-number> issues

Module: `content/<module-file>.md`
Run date: <ISO timestamp>
Run workspace: `module-runs/<module-number>-<module-slug>-<timestamp>/`
Result: PASS | PARTIAL | FAIL | BLOCKED

## Summary

<One short paragraph describing what was executed and the overall outcome.>

## Issues

### 1. <Issue title>

- Location: `<heading or line range>`
- Step: `<learner step text or code fence summary>`
- Classification: content bug | command failure | ambiguous instruction | missing prerequisite | environment blocker | expected result mismatch | external-service blocker
- Expected: `<what the module said or implied should happen>`
- Actual: `<what happened>`
- Evidence: `<command, exit code, output excerpt, URL, screenshot path, or tool result>`
- Suggested fix: `<specific course-content or setup change>`

## Commands and prompts executed

| Step | Location | Action | Result |
|---|---|---|---|
| 1 | `<heading>` | `<command or prompt summary>` | PASS |
```

Keep the issue file factual. Include enough evidence that a course author can reproduce the failure without rerunning the whole module.

## Classification guide

Use consistent classifications:

| Classification | Use when |
|---|---|
| content bug | The module gives an incorrect command, path, prompt, file name, or expected result. |
| command failure | A command from the module exits nonzero or cannot complete as written. |
| ambiguous instruction | A learner would not know what to do next or where to run a step. |
| missing prerequisite | The module assumes a tool, account, dependency, service, or repo state without telling the learner. |
| environment blocker | The local machine cannot perform a valid learner step, such as no browser UI or no required service. |
| expected result mismatch | The step runs, but the observed result does not match the module. |
| external-service blocker | The step needs GitHub.com, cloud agent, mobile, Azure, billing, or another service that is unavailable or unauthorized. |

## Completion criteria

A module run is complete only when:

1. Every executable learner step has been run or recorded as blocked.
2. Every command and prompt has a pass, fail, or blocked result.
3. Devcontainer use has been verified and recorded when the learner project provides one, or a blocker explains why devcontainer execution was unavailable.
4. Required generated files, apps, tests, servers, PRs, or delegated tasks have been verified when the module asks for them.
5. The run root under `module-runs/` exists and contains the final learner workspace, logs, and artifacts needed for review.
6. `issues/<module-number>-issues.md` exists and contains either issues or a no-issues report with the run workspace path.
7. Any background process started during the run has been stopped unless the user explicitly asked to leave it running.

## Invocation examples

```text
Run module-runner for content/03-test-suite-remote-delegation.md.
```

```text
Use module-runner to simulate a learner through Section 3 and write issues to issues/03-issues.md.
```
