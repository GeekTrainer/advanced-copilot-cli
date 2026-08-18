# Advanced GitHub Copilot CLI

A hands-on course for experienced developers who are ready to take GitHub Copilot CLI beyond the basics and use it for **real-world brownfield work** — building reusable AI infrastructure (custom instructions, custom agents, agent skills, lifecycle hooks, LSP, and MCP integrations) on top of an existing multi-stack legacy codebase.

> [!IMPORTANT]
> Because GitHub Copilot, and generative AI at large, is probabilistic rather than deterministic, the exact code, files changed, and outputs may vary between runs. You may notice slight differences between what's described here and what you see in your terminal. This is expected.

## Who this course is for

You're already comfortable with Copilot in an IDE and with the basics of Copilot CLI (running `copilot`, having a chat, accepting an edit). You want to:

- Use Copilot CLI as your primary agent surface, not as a fallback when you're away from your editor.
- Codify your team's conventions so Copilot follows them automatically.
- Build reusable skills and custom agents instead of re-prompting from scratch every session.
- Extend Copilot CLI with LSP, MCP, and lifecycle hooks, and distribute it all as a plugin your team installs in one shot.

### Course prerequisites

This course assumes you are familiar with:

- Copilot CLI and are looking to expand your knowledge.
- GitHub flow, including working with issues and pull requests.
- using VS Code as a code editor (or similar IDEs).
- creating software using different programming languages.

> [!NOTE]
> The app used in the course scenario uses several programming languages, including Python, Java, TypeScript and C#. Familiarity with all languages **is not** a requirement to successfully complete this course. In fact, one of the core tasks you'll be performing is to ask Copilot about the project and how it works.

## The scenario

You've inherited **AssetTrack** at **Contoso Industries** — an internal asset-tracking application built across **Java**, **Astro/TypeScript with React islands**, **.NET**, and **FastAPI**. It's a brownfield app build like many brownfield apps: incomplete documentation, a long bug list, and the usual rough edges that come from years of accumulated tech decisions and tech debt.

You'll work the legacy app from [`geektrainer/legacy-app`][legacy-app] throughout the course, using Copilot CLI to understand it, extend it, and modernize it.

## What you'll learn

Across the seven core modules of this course (plus a prerequisites module and a wrap-up) you will:

- Understand what an AI agent is and how the Copilot CLI harness works under the hood, including how to control models, permissions, and modes — then use Copilot CLI to explore the repo and fill the obvious documentation gaps.
- Build the AI infrastructure for a brownfield repo: generate `copilot-instructions.md` with `/init`, add path-scoped `.instructions` files, author a custom agent for accessibility, and import the `make-repo-contribution` skill so every Copilot contribution flows through issues and PRs.
- Validate accessibility upgrades with Playwright tests, drive a session against a hosted environment with `/remote`, and offload bounded test work to the Copilot cloud agent with `/delegate`.
- Wire lifecycle **hooks** so tests, lint, and build feedback flow back to the agent automatically.
- Plan and execute a new feature (barcode support) with `/research`, `/plan`, rubber-duck critique, QA + accessibility custom agents, and `/fleet` parallel subagents.
- Give Copilot better signal with LSP servers across stacks, a documentation MCP server, and `/research` — then drive modernization with per-stack migrator agents.
- Scale your AI infrastructure: package it as a plugin, build a custom MCP server exposing AssetTrack's database safely, and reason about enterprise-tier custom agents.

## Course structure

Each module is a single markdown file under [`content/`](./content/). Modules build on each other but each module's exercises include a starting-state note so you can drop in if you need to.

1. [Environment setup][m00]
2. [Working with Copilot CLI][m01]
3. [Building an AI infrastructure foundation][m02]
4. [Enhancing the test suite with remote and delegation][m03]
5. [Shaping Copilot CLI's lifecycle with hooks][m04]
6. [Adding a new feature: barcode support][m05]
7. [Modernizing apps with Copilot CLI][m06]
8. [Managing Copilot's infrastructure][m07]
9. [Wrap-up and next steps][m08]

## Get started

Head to [Module 0: Environment setup][m00] to get your environment ready.

## Jumping into a module: catch-up branches

Each module assumes the cumulative output of every earlier module. If you skip ahead, check out the matching catch-up branch on your AssetTrack repository before you start. Each `start-of-module-N` branch holds the state a learner has after finishing every module before `N`, so `start-of-module-03` gives you everything the first two modules produce.

Create your AssetTrack repository from the [`geektrainer/legacy-app`][legacy-app] template with **Include all branches** selected so the catch-up branches come along, then check out the branch for the module you're starting (Module 3 shown):

```bash
git checkout start-of-module-03
```

| Starting module | Check out | What it gives you |
|---|---|---|
| [Working with Copilot CLI][m01] | *(default branch)* | pristine AssetTrack fork |
| [Building an AI infrastructure foundation][m02] | `start-of-module-02` | Module 1 documentation updates |
| [Enhancing the test suite with remote and delegation][m03] | `start-of-module-03` | the above plus the AI infrastructure (instructions, custom agents, `make-repo-contribution` skill) |
| [Shaping Copilot CLI's lifecycle with hooks][m04] | `start-of-module-04` | the above plus the Playwright test foundation |
| [Adding a new feature: barcode support][m05] | `start-of-module-05` | the above plus the lifecycle hooks |
| [Modernizing apps with Copilot CLI][m06] | `start-of-module-06` | the above plus the barcode feature and QA agent |
| [Managing Copilot's infrastructure][m07] | `start-of-module-07` | the above plus the modernized services |

Module 1 starts from the pristine fork, so it has no catch-up branch, and there is no branch after Module 7 because that module's work targets your fork only. Older forks and content may still carry the deprecated `02-building-ai-infra-solution` and `03-test-suite-remote-delegation-solution` branches; these are kept as frozen aliases of `start-of-module-03` and `start-of-module-04` and still resolve.

### Keeping the catch-up branches current

The `start-of-module-N` branches live on `GeekTrainer/legacy-app`, which owns their generation, validation, and promotion. `legacy-app` regenerates them by pulling this repository's public content on a schedule and on demand through a manual `workflow_dispatch`, then opens a pull request that a human reviews and approves before the branches move. This repository stays pure content — it publishes module updates and holds no automation that reaches into `legacy-app`.

## Status

This repository contains the **skeleton** for the course. Each module file captures the structure, talking points, and exercise outlines. Full prose, screenshots, and step-by-step content will be filled in by the course authors.

## License

This project is licensed under the terms of the MIT license — see [`LICENSE`][license].

## Contributing

Contributions are welcome. See [`CONTRIBUTING.md`][contributing] for how to author and edit content, the pull request flow, and commit conventions.

## Code of conduct

This project has adopted a [Code of Conduct][code-of-conduct]. By participating, you agree to abide by its terms.

## Support

For help, questions, and how to file issues, see [`SUPPORT.md`][support].

## Security

To report a security vulnerability, follow the coordinated disclosure process in [`SECURITY.md`][security].

[legacy-app]: https://github.com/geektrainer/legacy-app
[license]: ./LICENSE
[contributing]: ./CONTRIBUTING.md
[code-of-conduct]: ./CODE_OF_CONDUCT.md
[support]: ./SUPPORT.md
[security]: ./SECURITY.md
[m00]: ./content/00-prerequisites.md
[m01]: ./content/01-working-with-copilot-cli.md
[m02]: ./content/02-building-ai-infrastructure.md
[m03]: ./content/03-test-suite-remote-delegation.md
[m04]: ./content/04-lifecycle-hooks.md
[m05]: ./content/05-add-feature-barcode.md
[m06]: ./content/06-modernize-apps.md
[m07]: ./content/07-manage-infrastructure.md
[m08]: ./content/08-wrap-up.md
