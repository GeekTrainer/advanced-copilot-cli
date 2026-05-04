# Advanced GitHub Copilot CLI

A hands-on course for experienced developers who are ready to take GitHub
Copilot CLI beyond the basics and use it for **real-world brownfield work** —
building reusable AI infrastructure (custom instructions, agent skills,
custom agents, and MCP integrations) on top of an existing legacy codebase.

> [!IMPORTANT]
> Because GitHub Copilot, and generative AI at large, is probabilistic rather
> than deterministic, the exact code, files changed, and outputs may vary
> between runs. You may notice slight differences between what's described
> here and what you see in your terminal. This is expected.

## Who this course is for

You're already comfortable with Copilot in an IDE and with the basics of
Copilot CLI (running `copilot`, having a chat, accepting an edit). You want
to:

- Use Copilot CLI as your primary agent surface, not as a fallback when
  you're away from your editor.
- Codify your team's conventions so Copilot follows them automatically.
- Build reusable skills and custom agents instead of re-prompting from
  scratch every session.
- Extend Copilot CLI with MCP servers and integrate it into a real
  end-to-end workflow (audit → backlog → fix → PR → review).

## The scenario

You've just inherited **AssetTrack** at **Contoso Industries** — an internal
asset-tracking application built on Spring Boot 2.7, Java 11, jQuery,
Bootstrap 3, SQLite, and a couple of crusty Python scripts. It's a
realistic brownfield app: missing tests, an SQL-injection-flavored
repository method, unenforced business rules, a buggy dashboard, and
Python scripts written in a deliberately old-fashioned style.

You'll work the legacy app from [`geektrainer/legacy-app`][legacy-app]
throughout the course, using Copilot CLI to understand it, modernize it,
and add to it.

## What you'll learn

Across the nine sections of this course you will:

- Run Copilot CLI productively against a brownfield repo, with a clear
  understanding of permissions, allowed directories, and approval flows.
- Author repo-level and scoped instructions so Copilot picks up your
  team's conventions automatically.
- Use plan-first prompting, diff review, and session controls to keep
  multi-turn work under control.
- Build agent skills that encode reusable, well-scoped tasks (e.g., a
  Python modernizer, a security-audit reporter).
- Compose custom agents with skills and instructions for focused jobs
  like migration planning and test authoring.
- Work with MCP — the built-in GitHub MCP tools, custom MCP servers,
  and the trust/distribution model around them.
- Tie it all together in an end-to-end workflow: audit the codebase,
  file issues, implement a fix, run tests, and open a PR — driven from
  the CLI.

## Course structure

Each section is a folder under [`content/`](./content/) with its own
`README.md`. Sections build on each other but each section's exercises
include a starting-state note so you can drop in if you need to.

1. [Prerequisites and environment setup][s00]
2. [Getting started with Copilot CLI][s01]
3. [Instructions files: AGENTS.md and friends][s02]
4. [Prompt engineering and CLI session control][s03]
5. [Agent skills: building reusable, scoped tasks][s04]
6. [Custom agents: composing skills, instructions, and tools][s05]
7. [Managing agents and MCP][s06]
8. [Real-world workflow: audit to PR][s07]
9. [Wrap-up and next steps][s08]

## Get started

Head to [Section 0: Prerequisites and environment setup][s00] to get your
environment ready.

## Status

This repository contains the **skeleton** for the course. Each section
README captures the structure, talking points, and exercise outlines. Full
prose, screenshots, and step-by-step content will be filled in by the
course authors.

[legacy-app]: https://github.com/geektrainer/legacy-app
[s00]: ./content/00-prerequisites/README.md
[s01]: ./content/01-getting-started-with-copilot-cli/README.md
[s02]: ./content/02-instructions-files/README.md
[s03]: ./content/03-prompt-engineering-and-iteration/README.md
[s04]: ./content/04-agent-skills/README.md
[s05]: ./content/05-custom-agents/README.md
[s06]: ./content/06-managing-agents-and-mcp/README.md
[s07]: ./content/07-real-world-workflow/README.md
[s08]: ./content/08-wrap-up/README.md
