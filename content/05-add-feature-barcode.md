# Module 5 — Adding a new feature: barcode support

| [← Previous: Shaping Copilot CLI's lifecycle with hooks][previous-lesson] | [Next: Modernizing apps with Copilot CLI →][next-lesson] |
|:--|--:|

Greenfield features in a brownfield app are where Copilot CLI earns its keep — *if* the work is scoped, researched, planned, and parallelized correctly. This module uses barcode / QR support for AssetTrack as the forcing function for `/research`, `/plan`, rubber-duck critique, custom agents (QA + accessibility), and `/fleet`.

## What you will learn

- How to use `/research` to pick a library / API before committing to an approach.
- How to use `/plan` (and plan mode) to produce a written plan before any code changes, and rubber-duck it.
- What custom agents are, how they differ from skills and instructions, and how to author one per concern (QA, accessibility).
- How `/fleet` runs subagents in parallel — when that helps, when it hurts, and how to use it without losing track of the diff.

## Scenario

> [!NOTE]
> **Starting state**: hooks from [Module 4][s04] in place; instructions, custom agents, and tests from [Modules 2–3][s02] in place. Exercises **modify code across one or more stacks** of AssetTrack under a feature branch (e.g., `feat/barcode-support`).

AssetTrack needs barcode support. Each asset gets a unique QR code (or 1-D barcode, depending on what research recommends); operators can scan to look up an asset. The work touches the data model, the API, the UI, and the test suite. Exactly the kind of feature where unbounded prompting goes off the rails — so you'll research, plan, and parallelize instead.

## Tech overview: Researching the right library with `/research`

Talking points:

- **What `/research` is for**: a citation-backed investigation into a question you need to defend — here, which barcode library to adopt across the stacks involved.
- **Anatomy of a good research prompt**: a specific question, the decision criteria (license, maintenance, browser support, server-side runtime support), the constraints (org policy, team skill), the sources to prefer.
- **Anatomy of a bad research prompt**: "what's the best barcode library?" — too vague, no criteria, the agent will drift.
- **Consuming the report**: treat it as input, not as the decision. Verify cited sources; push back on weak claims; ask follow-ups.

## Exercise: Use `/research` to choose a barcode library

Talking points:

- **Goal**: a research report you can defend, naming a library (or libraries) for QR / 1-D barcode generation and scanning across AssetTrack's stacks.
- **Files/areas touched**: `docs/research/barcode-library.md` (new) — the committed report.
- **Steps**:
  - Run `/research` with a prompt that names: the use cases (generate codes per asset on the server; scan codes from the browser / a phone camera), the stacks involved (Java service for generation, Astro/TS for the operator UI, .NET / FastAPI if they need to expose endpoints), and the decision criteria (license compatible with the project, active maintenance, no native dependencies if possible).
  - Require: options considered, recommendation with rationale, risks, integration sketch, rough effort.
  - Iterate; ask Copilot to deepen any thin section.
  - Commit the report locally.
- **How to verify**: the report cites real, current sources; the recommendation names a specific library and version; integration sketch references actual project paths.

## Tech overview: Planning the feature with `/plan` and rubber-duck critique

Talking points:

- **Why plan-first work matters for agents**: a written plan is the cheapest place to catch scope creep, missing files, or wrong assumptions. Once tools start running, course-correction gets expensive.
- **Two ways to get a plan**:
  - **Plan mode**: toggle and let Copilot ask clarifying questions before producing a plan without executing changes.
  - **`/plan` command**: explicitly invoke a planning agent for a specific task.
- **Anatomy of a good plan**: scope, file list, ordered steps, acceptance criteria, risks, rollback strategy. If the plan is vague or covers too much, that's a smell.
- **Rubber-duck critique**: a second pass before you accept. Either ask Copilot in the same session to critique, or spin up a separate critique agent.
- **When to iterate vs. start over**: when the plan keeps drifting, the prompt is wrong — start a fresh focused session.

## Exercise: Use `/plan` to scope the barcode feature

Talking points:

- **Goal**: a specific, bounded plan for barcode support — generation, persistence, API exposure, UI integration, tests — before writing a line of code.
- **Files/areas touched**: none (planning only); plan committed as `docs/plans/barcode-support.md`.
- **Steps**:
  - Toggle plan mode (or invoke `/plan`) and ask for a plan covering: schema change for storing the code, server-side generation in the Java service, API endpoint exposure (where it belongs across the stacks), Astro UI for display + scan, FastAPI / .NET integration if those services need to consume the code, tests across all touched layers.
  - Push back on vague items: which files change, which endpoints get added, what the migration looks like, what the rollback is.
  - Rubber-duck the plan: what's missing? Where will this break the existing UI? What would you *not* change?
  - Iterate until the plan splits into 2–3 clearly bounded waves that can be reviewed independently.
- **How to verify**: the plan names specific files and specific changes per file; you could hand it to a teammate and they'd produce the same diff.

## Tech overview: Custom agents and `/fleet` for parallel execution

Talking points:

- **What a custom agent is**: a configured persona of Copilot — a name, a description, an optional tool allowlist, and instructions that shape how it works on its scope. Lives in `.github/agents/` (repo-scoped) or `~/.copilot/agents/` (user-scoped). Invoked via `/agent`.
- **Custom agents vs. skills vs. instructions**:
  - Instructions = "what's true about this codebase."
  - Skills = "here's a deterministic capability the agent can call."
  - Custom agents = "here's a personality + scope + toolset for a recurring kind of work."
- **`/fleet` for parallel subagents**: spins up multiple agents at once on independent slices. Helpful when slices are truly independent; harmful when they aren't.
- **Reviewing fleet output**: each subagent produces its own diff stream; review per-agent, then integrate.
- **When parallelism helps**: independent files, independent test files, independent feature toggles. When it doesn't: cross-cutting refactors, shared template files, anything where one agent's output is the other's input.

## Exercise: Build QA + accessibility custom agents and run them under `/fleet` to implement the feature

Talking points:

- **Goal**: implement the barcode plan using two custom agents in parallel — a QA agent that authors tests alongside each change, and an accessibility agent that validates the UI additions are operable.
- **Files/areas touched**:
  - `.github/agents/qa-engineer.md` and `.github/agents/accessibility-reviewer.md` (new agent definitions).
  - Feature code across AssetTrack's stacks: Java service for generation, Astro/TS UI for display + scan, plus whichever endpoints in .NET / FastAPI need to expose / consume the code.
  - New tests under the project's test conventions plus Playwright accessibility tests for the new UI.
- **Steps**:
  - Author the QA agent: persona ("test-first engineer"), scope (test files + minimal production touches to make tests runnable), tool allowlist (file read/write, shell limited to test runners), rules (write tests for every behavior the plan names; flag untestable areas).
  - Author the accessibility reviewer: persona ("a11y reviewer"), scope (UI templates + a11y test files only), tool allowlist (file read/write, axe-driving shell), rules (WCAG-aligned changes only, don't restyle).
  - Run `/fleet` with at least two subagents:
    - **Subagent A**: implements the plan's wave 1 (server-side generation + API exposure) — uses the QA agent inline for tests.
    - **Subagent B**: implements the plan's wave 2 (UI display + scan) — uses both the QA agent and the accessibility reviewer.
  - Review each subagent's diff independently before integrating.
- **How to verify**:
  - Feature code matches the plan: barcodes generate, persist, expose via API, render in UI, and scan from the browser / camera.
  - Tests run; the QA agent left a checklist of any coverage gaps it couldn't fill.
  - Playwright a11y tests pass for the new UI; the accessibility reviewer signed off.
  - Each subagent's diff is independently reviewable.

## Summary

You've now:

- Used `/research` to defend a library choice with citations.
- Used `/plan` + rubber-duck critique to produce a bounded plan for a multi-stack feature.
- Authored QA and accessibility custom agents.
- Used `/fleet` to parallelize independent waves and integrated the result.

Next, you'll plan and execute a **modernization** of AssetTrack using `/research`, `/lsp`, MCP servers, and custom agents in [Module 6][next-lesson].

## Resources

- [Plan mode in Copilot CLI][copilot-plan]
- [About custom agents][copilot-agents]
- [WCAG 2.2 quick reference][wcag-quickref]
- [axe-core accessibility testing][axe-core]
- [Playwright accessibility testing guide][playwright-a11y]

---

| [← Previous: Shaping Copilot CLI's lifecycle with hooks][previous-lesson] | [Next: Modernizing apps with Copilot CLI →][next-lesson] |
|:--|--:|

[previous-lesson]: ./04-lifecycle-hooks.md
[next-lesson]: ./06-modernize-apps.md
[s02]: ./02-building-ai-infrastructure.md
[s04]: ./04-lifecycle-hooks.md
[copilot-plan]: https://docs.github.com/copilot/how-tos/use-copilot-agents/use-copilot-cli
[copilot-agents]: https://docs.github.com/copilot/concepts/agents/about-copilot-cli
[wcag-quickref]: https://www.w3.org/WAI/WCAG22/quickref/
[axe-core]: https://github.com/dequelabs/axe-core
[playwright-a11y]: https://playwright.dev/docs/accessibility-testing
