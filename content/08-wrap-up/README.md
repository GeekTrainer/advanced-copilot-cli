# Section 8 — Wrap-up and next steps

| [← Previous: Real-world workflow][previous-lesson] |  |
|:--|--:|

You've worked Copilot CLI through a brownfield Java + Python codebase,
codified your team's conventions, built reusable skills and agents,
integrated MCP, and shipped a PR. This section is a quick recap and a
pointer to where to go next.

## What you will learn

- A consolidated view of the AI infrastructure you built across the
  course.
- How the patterns generalize beyond AssetTrack.
- Where to go next with Copilot CLI.

## Recap

Talking points:

- **Instructions** (`AGENTS.md` + scoped instruction files) — the
  passive context every session inherits.
- **Skills** (`python-modernizer`, `security-audit`) — invokable,
  narrow, well-scoped tasks.
- **Custom agents** (`spring-boot-3-migration-planner`, `test-author`)
  — focused personas with curated tool surfaces.
- **MCP** — the GitHub MCP tools that ship built-in plus the option
  to add servers; used here to read fork state and to draft / file
  issues.
- **Workflow** — plan-first prompting, diff review, rollback,
  end-to-end audit-to-PR flow.

## Generalizing beyond AssetTrack

Talking points:

- The same pattern (instructions → skills → agents → MCP → workflow)
  applies to any brownfield repo. Walk the learner through how to
  bootstrap each piece on their own codebase.
- Common variations:
  - A team coding standards `AGENTS.md` shared across many repos.
  - User-level skills for tasks that recur outside any one project
    (e.g., "rewrite this commit message in our team's house style").
  - Custom agents for compliance-sensitive areas (security review,
    license audit).
- Knowing when **not** to use any of this — for genuinely one-off,
  exploratory work, a plain CLI session is still the right tool.

## Suggested next steps

Talking points:

- Apply the instructions / skills / agent / MCP pattern to a real
  repo at work. Start with `AGENTS.md`.
- Share one skill or agent with your team. See how the conversation
  changes when everyone has the same one available.
- Explore the [MCP registry][mcp-registry] for a server that fits
  your team's external tools.
- Subscribe to the [GitHub Changelog][changelog] — Copilot CLI
  features evolve fast.

## Further reading

- [Copilot CLI documentation][copilot-cli-docs]
- [GitHub Copilot best practices][copilot-best-practices]
- [Model Context Protocol introduction][mcp-intro]
- [`github-samples/agents-in-sdlc` workshop][agents-in-sdlc] — the
  IDE-focused companion to this course; useful if your team is split
  between CLI and IDE workflows.
- [Legacy app: `geektrainer/legacy-app`][legacy-app]

## Resources

- [Copilot CLI documentation][copilot-cli-docs]
- [GitHub Copilot Changelog][changelog]
- [MCP registry][mcp-registry]
- [Course tracking issue (`github/devrel#5212`)][tracking-issue]

---

| [← Previous: Real-world workflow][previous-lesson] |  |
|:--|--:|

[previous-lesson]: ../07-real-world-workflow/README.md
[copilot-cli-docs]: https://docs.github.com/en/copilot/how-tos/use-copilot-agents/use-copilot-cli
[copilot-best-practices]: https://docs.github.com/en/copilot/get-started/best-practices
[mcp-intro]: https://modelcontextprotocol.io/introduction
[mcp-registry]: https://github.com/mcp
[agents-in-sdlc]: https://github.com/github-samples/agents-in-sdlc
[legacy-app]: https://github.com/geektrainer/legacy-app
[changelog]: https://github.blog/changelog/label/copilot/
[tracking-issue]: https://github.com/github/devrel/issues/5212
