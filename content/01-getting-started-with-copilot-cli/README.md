# Section 1 — Getting started with Copilot CLI

| [← Previous: Prerequisites and environment setup][previous-lesson] | [Next: Instructions files →][next-lesson] |
|:--|--:|

Copilot CLI is a different operating model than chat-in-IDE. The agent runs
in your terminal, executes shell commands, edits files, and uses tools
directly against your working tree. This section grounds you in that model
and gets your first real conversation with AssetTrack on the page.

## What you will learn

- How a Copilot CLI session is structured (turns, tool calls, approvals).
- How tool calling works in the CLI, what gets approved automatically vs.
  prompted, and how to keep that under control.
- How to use Copilot CLI to explore an unfamiliar codebase quickly.
- That GitHub MCP tools ship built-in — you'll use them lightly here and
  go deep in [Section 6][s06].

## Scenario

> [!NOTE]
> **Starting state**: clean fork of `legacy-app` from [Section 0][s00].
> Both exercises in this section are **read-only / no source changes**.
> You'll start `mvn spring-boot:run` but you won't edit Java or template
> files.

You're new to AssetTrack. Before changing anything, you want to understand
the layout, follow a real request through the stack, and form an opinion
about what's risky. Copilot CLI is your way in.

## Tech overview: Copilot CLI fundamentals

Talking points:

- What Copilot CLI is and how it differs from Copilot chat in an IDE.
- Session lifecycle: starting a session, conversation turns, exiting.
- The model picker and what model defaults mean for a CLI session.
- The default toolset: file read, file edit, shell execution.
- Brief mention: GitHub MCP tools are available out of the box — used
  lightly in this section, deep dive in [Section 6][s06].
- A few quality-of-life slash commands worth knowing on day one
  (`/version`, `/help`, `/session`, `/resume`, `/context`).

## Exercise: First conversation with the AssetTrack codebase

Talking points:

- **Goal**: get a clear, accurate picture of AssetTrack's architecture
  without opening any files yourself first.
- **Files/areas touched**: none (read-only).
- **Steps**:
  - Start a Copilot CLI session inside the fork.
  - Ask Copilot to summarize the architecture and main packages.
  - Ask it to trace a request from `DashboardController` through the
    service layer to `AssetRepository`.
  - Ask it to call out tech debt or risk areas it noticed.
- **How to verify**: spot-check Copilot's claims against the actual files
  in `src/main/java/com/contoso/assettracker/`. The summary should
  correctly identify Spring Boot 2.7, Thymeleaf, raw JDBC repositories,
  and the dashboard summary stats.

## Tech overview: Tool calling, approvals, and allowed directories

Talking points:

- The tool-call model in Copilot CLI: file reads, file writes, shell
  execution — and how each is surfaced to you for approval.
- Allowed directories: `/add-dir`, `/list-dirs`, `/cwd`. Why scoping the
  agent to the repo matters on a brownfield machine.
- Approval prompts: read vs. edit vs. shell, and what "always allow for
  this command" really means.
- Why blanket approval (e.g., `/allow-all` or equivalent) is dangerous on
  a brownfield repo where the agent might decide to delete or rewrite at
  scale.
- Tip: review tool-call output before approving the next edit — the agent
  often proposes follow-ups that depend on the previous tool's results.

## Exercise: Run and inspect the app via Copilot CLI

Talking points:

- **Goal**: have Copilot start the app, exercise the UI, and produce a
  list of "things that look broken" — all from the CLI.
- **Files/areas touched**: none (Copilot may run shell commands but
  shouldn't edit source).
- **Steps**:
  - Approve a shell tool call to `mvn spring-boot:run` in the
    background.
  - Have Copilot use `curl` (or describe what to click) to hit the
    dashboard, asset list, and employee list.
  - Ask Copilot to summarize anomalies — wrong status colors, missing
    serial numbers, "assigned" assets with inactive employees, etc.
- **How to verify**: open `http://localhost:8080` in a browser and
  confirm at least one of Copilot's flagged anomalies (e.g., the
  dashboard color bug or messy manufacturer names) is real.

## Summary

You've now:

- Run a real Copilot CLI session against a brownfield repo.
- Seen the tool-call / approval surface in practice.
- Produced an initial mental model of AssetTrack and a small list of
  things worth fixing.

Next, you'll codify what you learned about the codebase as **instructions
files** so Copilot keeps that context in every future session — go to
[Section 2][next-lesson].

## Resources

- [Copilot CLI documentation][copilot-cli-docs]
- [Copilot CLI commands reference][copilot-cli-commands]
- [Working with Copilot in the terminal][copilot-terminal]
- [Legacy app source: `geektrainer/legacy-app`][legacy-app]

---

| [← Previous: Prerequisites and environment setup][previous-lesson] | [Next: Instructions files →][next-lesson] |
|:--|--:|

[previous-lesson]: ../00-prerequisites/README.md
[next-lesson]: ../02-instructions-files/README.md
[s00]: ../00-prerequisites/README.md
[s06]: ../06-managing-agents-and-mcp/README.md
[copilot-cli-docs]: https://docs.github.com/en/copilot/how-tos/use-copilot-agents/use-copilot-cli
[copilot-cli-commands]: https://docs.github.com/en/copilot/how-tos/use-copilot-agents/use-copilot-cli
[copilot-terminal]: https://docs.github.com/en/copilot/how-tos/use-copilot-agents/use-copilot-cli
[legacy-app]: https://github.com/geektrainer/legacy-app
