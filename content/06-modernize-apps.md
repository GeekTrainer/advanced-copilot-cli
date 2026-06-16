# Module 6 — Modernizing apps with Copilot CLI

| [← Previous: Adding a new feature][previous-lesson] | [Next: Managing Copilot's infrastructure →][next-lesson] |
|:--|--:|

Modernizing a brownfield app is a research problem before it's a coding problem — and an orchestration problem once the research is done. This module gives Copilot the signal it needs (LSP for structured code intelligence, MCP servers as documentation surfaces), uses `/research` to produce a citation-backed plan, and then drives the migration with custom agents on AssetTrack.

## What you will learn

- What an LSP buys Copilot beyond text grep, and how to configure `/lsp` for AssetTrack's multi-stack codebase.
- How MCP servers extend Copilot's tool surface — including using MCP servers as documentation sources for unfamiliar frameworks.
- What `/research` does, what good research prompts look like, and how to consume the resulting report.
- How to drive the upgrade itself with custom agents per stack, grounded in the LSP + docs MCP signal you wired up.

## Scenario

> [!NOTE]
> **Starting state**: the AI infrastructure, custom agents, and feature work from [Modules 2–5][m02] are in place. This module adds **LSP and MCP configuration**, a **research report**, and then **production code changes** under a feature branch as the modernization is applied.

End-of-life pressure is mounting on AssetTrack's stack — older framework majors, deprecated runtimes, packages with no maintainers. Before doing the modernization, you need to know what the modern targets look like, what the migration paths are, and where the risk lives. Then you execute.

## Tech overview: Giving the agent better signal — LSP and MCP

Talking points:

- **What an LSP buys you**: structured code intelligence — go-to-definition, find-references, hover types, diagnostics — instead of relying on text search. Copilot CLI consumes LSP output to ground its code claims.
- **`/lsp` and the configuration files**:
  - User-level: `~/.copilot/lsp-config.json` (applies across all projects).
  - Repo-level: `.github/lsp.json` (applies to a specific project; checkable into source control).
  - LSP servers are **not bundled** — install separately.
- **Recommended servers for AssetTrack's stacks**:
  - `jdtls` (Eclipse JDT Language Server) for Java.
  - `typescript-language-server` for the Astro/TypeScript frontend (covers the React islands too).
  - `omnisharp` or the modern `csharp-language-server` for .NET.
  - `pyright` or `python-lsp-server` for the FastAPI services.
- **MCP recap (depth in [Module 7][m07] for plugins)**:
  - Built-in GitHub MCP ships out of the box.
  - Custom MCP servers via `/mcp`. Configuration is repo-checkable.
  - **MCP as a documentation surface**: a docs MCP (e.g., a Context7 server, a Microsoft Learn server, a project's own docs MCP) gives the agent first-party documentation as a tool, instead of relying on web search or stale training data.
  - Trust model: review MCP server source like any dependency; prefer first-party / well-known publishers; scope what the agent can call.

## Exercise: Configure `/lsp` and register a documentation MCP server for AssetTrack

Talking points:

- **Goal**: give Copilot structured code intelligence across all four stacks and a documentation surface for the modernization research that follows.
- **Files/areas touched**:
  - `.github/lsp.json` (new, repo-level — preferred for a course / shared repo) **or** `~/.copilot/lsp-config.json` (user-level).
  - `.copilot/mcp.json` (or wherever the CLI expects MCP config — confirm with the docs in [Resources](#resources) for your CLI version).
- **Steps**:
  - Install the LSP servers you want for the stacks in play (Java, TypeScript, .NET, Python).
  - Configure the LSP file mapping each language to its server.
  - Run `/lsp` to confirm the servers are registered and healthy.
  - Add a documentation-oriented MCP server (e.g., a Context7-style server, a Microsoft Learn server, or another matching your modernization targets). Run `/mcp` to confirm.
  - Spot-check by asking Copilot to look up a modern-framework API symbol via the docs MCP, then to find a AssetTrack symbol via the LSP rather than via grep.
- **How to verify**:
  - `/lsp` shows the servers; `/mcp` shows the new docs server (in addition to the built-in GitHub MCP).
  - Copilot reports symbol locations and types from the LSP, citing line numbers / files precisely.
  - Copilot's modern-framework answers cite the docs MCP, not just web search.

## Tech overview: `/research` for modernization planning

Talking points:

- **What `/research` is for**: deep, multi-source investigation that produces a citation-backed report. Use it for decisions you need to defend — modernization targets, framework comparisons, migration strategy.
- **Anatomy of a good research prompt**: a specific question, the decision criteria, the constraints (org policy, team skill, deadline tolerance), and the sources to prefer.
- **Anatomy of a bad research prompt**: "what's the best way to modernize this app?" — too vague, no constraints, no decision criteria, the agent will drift.
- **How to consume the report**: treat it as input to your own decision, not as the decision. Verify cited sources, push back on weak claims, ask follow-ups.

## Exercise: Use `/research` to evaluate AssetTrack's modernization path

Talking points:

- **Goal**: produce a research report you can defend, covering the major modernization decisions AssetTrack needs to make per stack.
- **Files/areas touched**: `docs/research/modernization.md` (new) — the committed report.
- **Steps**:
  - Run `/research` with a prompt that names the per-stack decisions: Java framework / runtime upgrade, Astro / TS major-version upgrade, .NET target framework, FastAPI / Python runtime upgrade, plus the shared concerns (data layer, test / CI strategy).
  - For each decision, require: options considered, recommendation with rationale, risks, migration phases, rough effort.
  - Iterate on the report; ask Copilot to deepen any section that's thin.
  - Commit the report locally (no push without your go-ahead).
- **How to verify**:
  - The report cites real, current sources for each recommendation.
  - Each section names the decision criteria and identifies the trade-offs.
  - The phased plan is detailed enough that you could hand it to a teammate and they'd know where to start.

## Tech overview: Driving the upgrade with custom agents

Talking points:

- **Per-stack migrators**: author a custom agent per stack you're upgrading (e.g., `java-migrator`, `astro-migrator`, `dotnet-migrator`, `flask-migrator`). Each has a tight scope (its stack only) and a small tool surface (file edits + that stack's build / test runners).
- **Why per-stack agents help**: cross-stack changes get split into independently reviewable diffs. A failure in one stack doesn't block the others.
- **Phasing the migration**: per the research report — baseline (dependency / runtime versions in CI), per-stack upgrades, cross-stack contract validation, cleanup.
- **Validation between phases**: hooks from [Module 4][m04] run the relevant suites automatically; failures route back to the responsible migrator on its next turn.

## Exercise: Execute one stack's modernization with a custom migrator agent

Talking points:

- **Goal**: prove the pattern end-to-end on one stack of AssetTrack; the others follow the same recipe.
- **Files/areas touched**: a new `.github/agents/<stack>-migrator.md` plus the production code in the chosen stack and its tests.
- **Steps**:
  - Pick the stack whose modernization is best-bounded per the research report.
  - Author the migrator agent with: persona, scope (the stack's source paths only), tool allowlist (file r/w, that stack's build / test runners), and rules (no cross-stack edits, file follow-up issues for anything out of scope).
  - Run the agent on the first migration phase from the report.
  - Let the after-edit hooks surface failures; let the agent iterate.
  - Open a PR via `make-repo-contribution` (from [Module 2][m02]).
- **How to verify**:
  - The chosen stack builds and tests against the new target.
  - The PR is scoped to one stack, with the issue / branch / template hygiene the skill enforces.
  - Cross-stack contracts (API shapes, shared types) still hold against the unchanged stacks.

## Summary

You've now:

- Configured an LSP across the stacks so Copilot has structured code intelligence on AssetTrack.
- Registered a documentation MCP server so Copilot has first-party docs as a tool, not just training data.
- Produced a citation-backed modernization research report.
- Built a per-stack migrator agent and shipped one stack's upgrade through the contribution-flow skill.

Next, you'll scale this work to the team — enterprise agents, plugins, and a custom MCP server — in [Module 7][next-lesson].

## Resources

- [Configuring LSP servers for Copilot CLI][lsp-config]
- [Model Context Protocol introduction][mcp-intro]
- [GitHub MCP server][github-mcp-server]
- [MCP registry][mcp-registry]
- [Eclipse JDT Language Server (`jdtls`)][jdtls]
- [Pyright][pyright]
- [Python LSP Server (`python-lsp-server`)][pylsp]
- [TypeScript Language Server][ts-lsp]
- [OmniSharp][omnisharp]

---

| [← Previous: Adding a new feature][previous-lesson] | [Next: Managing Copilot's infrastructure →][next-lesson] |
|:--|--:|

[previous-lesson]: ./05-add-feature-barcode.md
[next-lesson]: ./07-manage-infrastructure.md
[m02]: ./02-building-ai-infrastructure.md
[m04]: ./04-lifecycle-hooks.md
[m07]: ./07-manage-infrastructure.md
[lsp-config]: https://github.com/github/copilot-cli#-configuring-lsp-servers
[mcp-intro]: https://modelcontextprotocol.io/introduction
[github-mcp-server]: https://github.com/github/github-mcp-server
[mcp-registry]: https://github.com/mcp
[jdtls]: https://github.com/eclipse-jdtls/eclipse.jdt.ls
[pyright]: https://github.com/microsoft/pyright
[pylsp]: https://github.com/python-lsp/python-lsp-server
[ts-lsp]: https://github.com/typescript-language-server/typescript-language-server
[omnisharp]: https://github.com/OmniSharp/omnisharp-roslyn
