# Section 2 — Building an AI infrastructure foundation

| [← Previous: Working with Copilot CLI][previous-lesson] | [Next: Enhancing the test suite with remote and delegation →][next-lesson] |
|:--|--:|

A productive Copilot CLI session starts with the agent already knowing the basics about your project — *and* with the right specialized helpers in reach. This section takes the documentation you produced in [Section 1][previous-lesson], codifies what Copilot needs to know as `copilot-instructions.md` (via `/init`) and path-scoped `.instructions` files, builds an accessibility-focused custom agent, and imports an agent skill so contribution hygiene (issues, branches, templated PRs) is automatic.

## What you will learn

- The full Copilot CLI instruction landscape and how the CLI combines instruction sources.
- How `/init` seeds `copilot-instructions.md` and when to re-run it.
- How to write path-scoped `.instructions.md` files for areas (and stacks) that need different rules.
- What custom agents are, how they differ from skills and instructions, and how to author one for accessibility review.
- How to run a custom agent as the default working mode for a focused task.
- What agent skills are, how `/skills` discovers them, and how to import a skill (`make-repo-contribution`) that enforces issue → branch → templated PR.

## Scenario

> [!NOTE]
> **Starting state**: the documentation updates committed at the end of [Section 1][previous-lesson] are in place. **Implementation exercises** — you'll add instructions files, a custom agent, and import an agent skill, but won't change production code. Files added here are used by every later section.

You've already used Copilot to fill the obvious documentation gaps in AssetTrack. That gives every future session a much better starting context. Now you'll codify the rules Copilot should follow — the stacks, the conventions, the do/don't rules — and add the custom agent and skill that enforce best practices for accessibility and contribution hygiene.

## Tech overview: Instructions files and `/init`

Talking points:

- Copilot CLI loads instructions from several sources and combines them. These include:
  - `AGENTS.md` (git root and cwd)
  - `.github/instructions/**/*.instructions.md` (path-scoped via `applyTo` globs)
  - `.github/copilot-instructions.md`
  - `~/.copilot/copilot-instructions.md` (user-level rules that apply to every Copilot CLI session across repositories on your machine)
  - Additional directories via `COPILOT_CUSTOM_INSTRUCTIONS_DIRS`
  - Sibling files like `CLAUDE.md` / `GEMINI.md` are also recognized.
- **What `/init` does**: scans the repo and seeds `copilot-instructions.md` with a starting set of conventions inferred from what's there — stack, structure, build/test commands, observed patterns. It's a starting point, not a finished artifact.
- **When to re-run `/init`**: after major repo restructures, after adopting a new framework, or when the existing instructions have drifted far from reality.
- **Inspecting what's loaded**: `/instructions`, `/env`. When Copilot seems to ignore your rules, this is where to look first.
- **Writing instructions that change behavior**: be specific, scoped, and enforceable. "Use parameterized SQL in repositories" is enforceable; "write good code" is not.
- **Copilot Memory (concept only)**: separate from instructions files. Memories are auto-deduced by Copilot during sessions, scoped per-repo, validated against code, and decay after 28 days unless reused. Available in public preview; enabled by default for Copilot Pro/Pro+. Not a CLI command — surfaces through the GitHub UI for review/deletion.

## Exercise: Generate `copilot-instructions.md` with `/init` and add scoped `.instructions` files

Talking points:

- **Goal**: produce a layered instructions setup for AssetTrack — a repo-wide baseline plus targeted rules for each stack.
- **Files/areas touched**: `.github/copilot-instructions.md` (new, via `/init`), plus stack-scoped files such as `.github/instructions/java.instructions.md`, `.github/instructions/astro.instructions.md`, `.github/instructions/dotnet.instructions.md`, and `.github/instructions/flask.instructions.md`.
- **Steps**:
  - Run `/init` and review what Copilot generates. Refine to capture the AssetTrack specifics: naming and project-layout conventions, "do" rules (parameterized SQL, server-side validation, accessibility), and "don't" rules (don't auto-upgrade framework majors, don't change package names).
  - Add one per-stack `.instructions.md` file with `applyTo` globs targeting each stack's source paths:
    - Java for the workforce, audit, and auth services.
    - Astro/TypeScript with React islands for the frontend.
    - .NET for the asset service.
    - Python for reporting and notification services.
  - Each stack is different and needs its own conventions. Astro components need accessibility rules that do not apply to backend services, backend code needs SQL-safety rules that do not belong in frontend sessions, and FastAPI services should follow modern Python conventions that are not relevant in .NET contexts.
  - Ask Copilot to draft each scoped instruction file, then refine the drafts so they match your actual repository conventions.
  - Run `/instructions` (or `/env`) to confirm all files are loaded.
  - Capture a screenshot of the `/instructions` output showing the repo baseline and all scoped files loaded.
  - Commit locally (no push without your go-ahead).
- **How to verify**: in a fresh session, ask Copilot to add a small helper in each stack. Confirm each proposed change follows the scoped rules.

## Tech overview: Custom agents

Talking points:

- **What a custom agent is**: a configured persona of Copilot — a name, a description, an optional tool allowlist, and instructions that shape how it works on its scope. Lives in `.github/agents/` (repo-scoped) or `~/.copilot/agents/` (user-scoped). Invoked via `/agent`.
- **Custom agents vs. skills vs. instructions**:
  - Instructions = "what's true about this codebase."
  - Skills = "here's a deterministic capability the agent can call."
  - Custom agents = "here's a personality + scope + toolset for a recurring kind of work."
- **When to author one**: a recurring kind of review or change that benefits from a focused persona and a smaller tool surface (accessibility review, security review, test authoring).

## Exercise: Build an `accessibility-updater` custom agent

Talking points:

- **Goal**: a reusable custom agent for accessibility review and updates across AssetTrack's UI.
- **Files/areas touched**: a new agent definition in `.github/agents/accessibility-updater.md`.
- **Steps**:
  - Author the agent with: persona ("expert front-end accessibility engineer"), scope (Astro components, templates, and a11y test files only), tool allowlist (file read/write, shell limited to test runners), and the rules to follow (WCAG-aligned changes only, keep current functionality, no styling rewrites beyond what a11y requires).
  - Run `/models`, select **Auto** from the list, and press Enter.
  - Run `/agent` to confirm the agent is registered.
  - Smoke-test by asking the agent to review one Astro page and propose changes — review the diff but don't apply yet (we'll exercise this agent further in [Section 5][s05]).
- **How to verify**: `/agent` lists `accessibility-updater`; the smoke-test review names specific WCAG criteria and specific selectors.

## Tech overview: Agent skills and the `make-repo-contribution` pattern

Talking points:

- **What an agent skill is**: a packaged capability — a name, an instruction set, optional scripts and resources — that the agent can invoke when the task matches. Lives in `.copilot/skills/` (repo-scoped) or `~/.copilot/skills/` (user-scoped).
- **Discovering skills**: `/skills` lists what's available; `/env` shows what's loaded.
- **Importing community skills**: like any dependency, review the source before adopting. Prefer first-party / well-known publishers; check what tools the skill calls and what files it reads/writes.
- **The `make-repo-contribution` skill**: encodes the standard contribution flow — file an issue, create a branch from main, make changes, push, open a PR with the right template, link the issue. In this exercise you'll run it on a small backlog task so you can watch the full flow and inspect the generated issue, branch, and PR artifacts before approving anything.
- **Bootstrap your `.github` standards first**: issue templates and a PR template make the skill's output reviewable.

## Exercise: Author issue / PR templates and import `make-repo-contribution`

Talking points:

- **Goal**: standards files in `.github/` plus the imported skill so future contributions (agent or human) flow through issue → branch → templated PR.
- **Files/areas touched**:
  - `.github/ISSUE_TEMPLATE/bug_report.yml`, `feature_request.yml`, `chore.yml`
  - `.github/PULL_REQUEST_TEMPLATE.md`
  - `.copilot/skills/make-repo-contribution/` (imported)
- **Steps**:
  - Have Copilot draft the issue templates as YAML forms with required fields (title prefix, summary, acceptance criteria, environment, repro steps where appropriate).
  - Have Copilot draft `PULL_REQUEST_TEMPLATE.md` with: linked issue, summary, change list, screenshots / before-after for UI, test evidence, checklist.
  - Locate the `make-repo-contribution` skill and import it. Run `/skills` and confirm it's listed.
  - Pick a small backlog item (a leftover doc gap from the first exercise is ideal) and prompt Copilot to address it using the skill: "use `make-repo-contribution` to fix the README gap about X."
  - Watch the agent propose an issue, then a branch, then a PR using the templates from the previous step.
- **How to verify**:
  - Templates render correctly when filing a test issue / PR on the fork (delete after).
  - The end-to-end contribution produces an issue, a branch with a convention-matching name, and a PR linked to the issue using the template.

## Summary

You should now have:

- A repo-baseline `.github/copilot-instructions.md` seeded by `/init` and refined by hand.
- Scoped instructions for each of the four stacks.
- An `accessibility-updater` custom agent ready for use in later sections.
- Issue / PR templates plus the imported `make-repo-contribution` skill enforcing the contribution flow.
- A clear understanding of where Copilot looks for instructions, and how Memory layers on top.

Next, you'll close the loop on accessibility with **Playwright tests** and offload the broader test backfill via `/remote` and `/delegate` in [Section 3][next-lesson].

## Resources

- [Adding custom instructions for GitHub Copilot CLI][copilot-instructions]
- [`AGENTS.md` overview][agents-md]
- [About Copilot Memory][copilot-memory]
- [About custom agents][custom-agents]
- [About agent skills][copilot-skills]
- [Configuring issue templates for your repository][issue-templates]
- [Creating a pull request template for your repository][pr-template]

---

| [← Previous: Working with Copilot CLI][previous-lesson] | [Next: Enhancing the test suite with remote and delegation →][next-lesson] |
|:--|--:|

[previous-lesson]: ./01-working-with-copilot-cli.md
[next-lesson]: ./03-test-suite-remote-delegation.md
[s05]: ./05-add-feature-barcode.md
[copilot-instructions]: https://docs.github.com/copilot/how-tos/configure-custom-instructions/add-repository-instructions
[agents-md]: https://agents.md
[copilot-memory]: https://docs.github.com/copilot/concepts/agents/copilot-memory
[custom-agents]: https://docs.github.com/copilot/concepts/agents/about-custom-agents
[copilot-skills]: https://docs.github.com/copilot/concepts/agents/about-agent-skills
[issue-templates]: https://docs.github.com/communities/using-templates-to-encourage-useful-issues-and-pull-requests/configuring-issue-templates-for-your-repository
[pr-template]: https://docs.github.com/communities/using-templates-to-encourage-useful-issues-and-pull-requests/creating-a-pull-request-template-for-your-repository
