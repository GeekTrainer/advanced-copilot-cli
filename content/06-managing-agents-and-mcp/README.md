# Section 6 — Managing agents and MCP

| [← Previous: Custom agents][previous-lesson] | [Next: Real-world workflow →][next-lesson] |
|:--|--:|

Copilot CLI ships with built-in GitHub MCP tools, and it can be extended
with additional MCP servers. In this section you'll learn how to inspect
what's already available, configure an additional server, and use MCP
tools to drive a real piece of work — drafting (and optionally filing)
the AssetTrack backlog as GitHub issues.

## What you will learn

- What MCP is, what tools the GitHub MCP server exposes, and how
  Copilot CLI discovers them.
- How to inspect MCP tools at runtime with `/mcp`.
- How to configure an additional MCP server, with appropriate trust and
  secret-handling hygiene.
- How to use MCP tools to take real action on a GitHub repo without
  polluting upstream projects.

## Scenario

> [!NOTE]
> **Starting state**: all prior sections complete (instructions files,
> skills, agents). The first exercise is **read-only** against the
> learner's fork. The second exercise **drafts** issue bodies first and
> only optionally **creates** issues — and only on the learner's fork,
> under a dedicated label for easy cleanup.

You've built up a backlog mentally during sections 1–5: tech debt,
unenforced rules, missing tests, the dashboard bug. Now you'll get that
backlog into GitHub the way a real team would — through MCP.

## Tech overview: MCP in Copilot CLI

Talking points:

- What MCP is and the problem it solves (one protocol for tools,
  agnostic to the host).
- The built-in GitHub MCP tools shipped with Copilot CLI: read
  issues / PRs, search code, create issues, comment, create PRs, etc.
- Inspecting available MCP tools at runtime: `/mcp` (or the current
  CLI's equivalent).
- Trust model: treat MCP servers like any other dependency — review
  source, prefer first-party / well-known, be cautious with broad
  access.
- The MCP registry as a discovery surface.

## Exercise: Inspect and use the built-in GitHub MCP tools

Talking points:

- **Goal**: confirm the GitHub MCP tools are available and use a few
  of them to read state from the learner's fork.
- **Files/areas touched**: none (read-only).
- **Steps**:
  - Run `/mcp` (or equivalent) and list the GitHub MCP tools that are
    available. Note tools for issues, PRs, and search.
  - Ask Copilot to list open issues in the learner's `legacy-app`
    fork using MCP. (If there are none, ask it to list recent
    commits or open PRs.)
  - Ask Copilot to fetch a specific file (`README.md`) via MCP rather
    than the local filesystem and compare what comes back.
- **How to verify**:
  - `/mcp` shows GitHub tools.
  - The fetched data matches what's actually in the fork on
    github.com.
  - No working-tree changes are made.

## Tech overview: Configuring additional MCP servers, allowlists, and team distribution

Talking points:

- How to add an MCP server to Copilot CLI configuration (consult
  current docs for the exact file/path; talking-point only here).
- Differences between local (`stdio`-spawned) and remote (`http`)
  servers, and the auth implications of each.
- Secrets and `inputs` blocks: never commit tokens; use OAuth where
  available; prefer remote servers with OAuth for team distribution.
- Allowlists: limiting which tools from a server the agent is allowed
  to call.
- Sharing configuration with a team — repo-checked config vs.
  user-level config, and the tradeoffs.
- Review hygiene before adopting a third-party MCP server (publisher,
  source, scope of access).

## Exercise: Draft (then optionally file) the AssetTrack backlog as GitHub issues

Talking points:

- **Goal**: produce a clean backlog of issues for AssetTrack from a
  Copilot-driven audit, then file them on the learner's fork only,
  under a dedicated label.
- **Files/areas touched**: none locally; new issues created on the
  learner's fork only.
- **Steps**:
  - Have Copilot review what you produced in earlier sections (the
    `security-audit` report, the migration planner output, the
    business-rule gaps surfaced in test stubs from section 5).
  - Ask Copilot to produce **draft issue bodies** — title, summary,
    acceptance criteria — and print them. Do not create yet.
  - Review the drafts and edit any that need cleanup.
  - Use a GitHub MCP tool to create the issues on the **learner's
    fork** with the label `course-backlog` (or similar). Avoid the
    upstream `geektrainer/legacy-app` repo.
  - Optionally have Copilot dedupe / deprioritize / link related
    issues.
- **How to verify**:
  - On github.com, the learner's `legacy-app` fork shows new issues
    tagged `course-backlog`.
  - Issues cover the topics surfaced earlier: SQL audit findings,
    Python modernization, dashboard bug (if not yet committed),
    business-rule enforcement, Spring Boot 3 migration plan.
  - No issues were created on the upstream `geektrainer/legacy-app`.
- **Cleanup**: when done, the learner can close all issues with the
  `course-backlog` label in one go.

## Summary

You've now used MCP both as a read surface (inspecting fork state) and
as a write surface (filing draft issues), with appropriate guardrails
for trust and cleanup.

Next, you'll combine everything — instructions, skills, agents, and MCP —
into an end-to-end workflow in [Section 7][next-lesson].

## Resources

- [Copilot CLI documentation][copilot-cli-docs]
- [Model Context Protocol (MCP) introduction][mcp-intro]
- [GitHub MCP server][github-mcp-server]
- [MCP registry][mcp-registry]
- [What the heck is MCP and why is everyone talking about it?][mcp-blog]

---

| [← Previous: Custom agents][previous-lesson] | [Next: Real-world workflow →][next-lesson] |
|:--|--:|

[previous-lesson]: ../05-custom-agents/README.md
[next-lesson]: ../07-real-world-workflow/README.md
[copilot-cli-docs]: https://docs.github.com/en/copilot/how-tos/use-copilot-agents/use-copilot-cli
[mcp-intro]: https://modelcontextprotocol.io/introduction
[github-mcp-server]: https://github.com/github/github-mcp-server
[mcp-registry]: https://github.com/mcp
[mcp-blog]: https://github.blog/ai-and-ml/llms/what-the-heck-is-mcp-and-why-is-everyone-talking-about-it/
