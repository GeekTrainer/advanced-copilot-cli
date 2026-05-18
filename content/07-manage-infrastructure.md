# Section 7 — Managing Copilot's infrastructure

| [← Previous: Modernizing apps with Copilot CLI][previous-lesson] | [Next: Wrap-up →][next-lesson] |
|:--|--:|

Everything so far has been about one developer's workflow. This section is about scaling that to a team: enterprise-level custom agents, plugins for distribution, and a custom MCP server that exposes a shared resource — for AssetTrack, the database — to every Copilot CLI session in the org.

## What you will learn

- What enterprise custom agents are and how they differ from repo-scoped ones.
- What a Copilot **plugin** is and how it bundles instructions, custom agents, agent skills, and MCP server configurations for one-shot installation.
- How to author a custom MCP server — including a AssetTrack database MCP — so the same shared tool is available to every session.
- How to think about distribution, trust, and lifecycle for AI infrastructure your team depends on.

## Scenario

> [!NOTE]
> **Starting state**: the modernization work from [Section 6][s06] is committed; the AI infrastructure across [Sections 2–5][s02] is in place. This section **targets the learner's fork only**, but the patterns are intended for org-wide rollout.

The accessibility upgrade, the test backfill, the hooks, the barcode feature, and the modernization all worked because *you* had the right AI infrastructure on your machine. Your teammates don't. Section 7 fixes that — package the setup so the next person who joins gets the same loops, agents, skills, and MCP servers in one install.

## Tech overview: Enterprise custom agents

Talking points:

- **Repo-scoped vs. user-scoped vs. enterprise-scoped agents**:
  - Repo-scoped (`.github/agents/`) — agents that belong to one codebase.
  - User-scoped (`~/.copilot/agents/`) — agents that travel with the developer.
  - Enterprise-scoped — agents the organization publishes for everyone, with policy enforcement.
- **What lives at the enterprise tier**: agents whose persona / scope / rules represent org policy (security review, license audit, compliance reviewer).
- **Why scope matters for distribution**: org policy belongs at the enterprise tier so it doesn't drift across repos.

## Tech overview: Plugins for distributing AI infrastructure

Talking points:

- **What a plugin bundles**: instructions, custom agents, agent skills, and MCP server configurations — distributed as a single installable unit.
- **`/plugin` mechanics**: list, install, enable / disable, inspect what got loaded.
- **Where plugins live**: marketplaces (when available), direct install from a repo, or a local path. Trust model is the same as skills and MCP — review the source before installing.
- **Authoring a plugin**: starts as a folder of the four asset types with a manifest tying them together; published or installed directly.
- **Versioning / lifecycle**: pin a version when behavior matters; update deliberately, not implicitly.

## Tech overview: Custom MCP servers as shared infrastructure

Talking points:

- **Recap**: MCP servers extend Copilot's tool surface. Built-in GitHub MCP ships out of the box; custom MCP servers add team-specific tools.
- **Authoring a custom MCP server**:
  - Define the tools the server exposes — name, description, input schema, output shape.
  - Implement the backing logic (database query, internal API call, etc.).
  - Apply auth + scope (read-only by default, explicit allowlist for writes).
- **When a custom MCP makes sense**: a resource every agent session needs, that's painful to access via shell. Examples: a database, an internal API, a queue, a feature-flag service.
- **Trust model**: an MCP server has tool-level capabilities. Review the implementation, scope the credentials, prefer read-only where possible.

## Exercise: Build a AssetTrack database MCP server

Talking points:

- **Goal**: a custom MCP server that exposes safe, read-mostly access to AssetTrack's database — so any session can ask "show me assignments older than 90 days" without writing shell SQL.
- **Files/areas touched**: a new MCP server project (own repo or a `mcp-servers/inventory-db/` folder), and the `mcp.json` (or equivalent) in the AssetTrack repo registering the server.
- **Steps**:
  - Define the tools the server exposes: `list_assets`, `get_asset`, `list_assignments`, `find_assignments_older_than(days)`, etc. Write inputs / outputs.
  - Implement the backing queries with parameterized SQL only (the rules from `repository.instructions.md` in [Section 2][s02] still apply).
  - Add an explicit allowlist for any write tool; default to read-only.
  - Register the server, run `/mcp` to confirm it's loaded, ask Copilot to call the new tools.
- **How to verify**: `/mcp` lists the inventory-db server; a smoke prompt ("how many active assignments do we have?") goes through the MCP tool rather than shell SQL; write attempts on read-only tools are rejected.

## Exercise: Explore enterprise custom agents

Talking points:

- **Goal**: identify which of the agents you've built belong at the enterprise tier, and sketch the policy they enforce.
- **Files/areas touched**: a short `docs/governance/enterprise-agents.md` proposal (committed for review).
- **Steps**:
  - Walk the agents authored across the course (accessibility reviewer, QA engineer, frontend / backend migrators).
  - Decide which represent **org policy** (e.g., the accessibility reviewer if a11y is org-wide), and which are repo-specific (the migrators).
  - For each policy agent, draft what its enterprise version would enforce, who owns it, and how it updates.
- **How to verify**: the proposal names specific agents, specific scope, and a specific owner per agent.

## Exercise: Package the AssetTrack AI infrastructure as a plugin

Talking points:

- **Goal**: bundle the instructions, custom agents, skills, and MCP server configuration into a plugin a teammate can install in one command.
- **Files/areas touched**: a new plugin folder (own repo or `plugins/contoso-inventory/`) with a manifest, the agent / skill / instructions files, and the MCP configuration pointing at the database MCP from the previous exercise.
- **Steps**:
  - Lay out the plugin per the CLI's plugin structure: manifest at the root, then the asset folders.
  - Reference (don't duplicate) the agent / skill / instructions content from the AssetTrack repo.
  - Include the MCP configuration for the inventory-db server from the previous exercise.
  - Install the plugin on a clean Codespace / VM and verify `/env`, `/skills`, `/agents`, and `/mcp` all reflect the expected components.
- **How to verify**: a fresh environment with the plugin installed has everything a course graduate needs — no extra setup.

## Summary

You've now:

- Authored a custom MCP server exposing AssetTrack's database safely.
- Decided which of your custom agents belong at the enterprise tier.
- Packaged the full AssetTrack AI infrastructure as a plugin a teammate can install in one shot.
- Closed the loop from individual workflow to team-wide capability.

Wrap up the course in [Section 8][next-lesson].

## Resources

- [About plugins for Copilot CLI][copilot-plugins]
- [About agent skills][copilot-skills]
- [Custom agents in Copilot CLI][custom-agents]
- [Model Context Protocol introduction][mcp-intro]
- [GitHub MCP server][github-mcp-server]
- [MCP registry][mcp-registry]

---

| [← Previous: Modernizing apps with Copilot CLI][previous-lesson] | [Next: Wrap-up →][next-lesson] |
|:--|--:|

[previous-lesson]: ./06-modernize-apps.md
[next-lesson]: ./08-wrap-up.md
[s02]: ./02-building-ai-infrastructure.md
[s06]: ./06-modernize-apps.md
[copilot-plugins]: https://docs.github.com/copilot/concepts/agents/about-copilot-plugins
[copilot-skills]: https://docs.github.com/copilot/concepts/agents/about-agent-skills
[custom-agents]: https://docs.github.com/copilot/concepts/agents/about-custom-agents
[mcp-intro]: https://modelcontextprotocol.io/introduction
[github-mcp-server]: https://github.com/github/github-mcp-server
[mcp-registry]: https://github.com/mcp
