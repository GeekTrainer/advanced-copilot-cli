# Section 5 — Custom agents: composing skills, instructions, and tools

| [← Previous: Agent skills][previous-lesson] | [Next: Managing agents and MCP →][next-lesson] |
|:--|--:|

A custom agent is a focused persona — a tighter system prompt, a curated
toolset, and (optionally) a bundle of skills — meant for a specific kind
of work. In this section you'll build two: one that **plans** a Spring
Boot 3 migration without performing it, and one that **authors tests**
for the AssetTrack service layer.

## What you will learn

- The difference between custom agents, skills, and instructions, and
  when each is the right tool.
- How to compose an agent with skills, instructions, and tool
  restrictions.
- How to keep an agent's scope small enough that it produces predictable
  results — and large enough to be useful.
- How to invoke, debug, and share custom agents.

## Scenario

> [!NOTE]
> **Starting state**: clean fork of `legacy-app` with the instructions
> files from [Section 2][s02] and the skills from [Section 4][s04]. The
> first exercise is **planning / report only** — the migration is
> **not** executed, and the app stays on Spring Boot 2.7 for the rest of
> the course. The second exercise generates **new test files only** —
> production code under `src/main/java` is untouched.

You'd love to one day move AssetTrack to Spring Boot 3, and you'd like
real tests around `AssetService` before you change anything else. Both
are repeatable jobs — perfect for custom agents.

## Tech overview: Custom agents vs. skills vs. instructions

Talking points:

- Instructions = passive context loaded by every session.
- Skills = invokable, narrow, well-scoped tasks.
- Custom agents = a persona with its own instructions, optionally a
  curated tool surface, optionally a bundle of skills it knows about.
- When to choose each — concrete examples drawn from AssetTrack
  (style enforcement → instructions; "modernize one Python file" →
  skill; "be a Spring Boot migration planner" → custom agent).
- How a custom agent is invoked in Copilot CLI (`/agent` or
  equivalent).
- Tradeoffs: a tighter agent is more predictable but less flexible.

## Exercise: Create a `spring-boot-3-migration-planner` agent

Talking points:

- **Goal**: a custom agent whose entire job is to **audit** the
  AssetTrack codebase and produce a migration plan from Spring Boot
  2.7 / Java 11 to Spring Boot 3.x / Java 17. **No code changes.**
- **Files/areas touched**: a new agent definition; the agent's runs
  produce a markdown report (commit it under `docs/` or print it). The
  agent must not edit `pom.xml`, Java sources, or `application.properties`.
- **Steps**:
  - Author the agent definition. Make "no edits, audit only" the
    primary guardrail.
  - Tell it exactly what to look for: `javax.*` → `jakarta.*` import
    sites, deprecated APIs, `pom.xml` parent and dependency versions,
    Java version bumps, `application.properties` keys that changed.
  - Invoke the agent and have it produce a report.
  - Iterate the agent definition until the report is consistent and
    complete.
- **How to verify**:
  - `git status` shows no source-code changes after running the
    agent.
  - The report enumerates concrete files: `pom.xml`, every
    controller and service that imports `javax.*`, any uses of
    deprecated APIs, `application.properties` if affected.
  - The report includes an estimated risk / scope summary.

## Tech overview: Composing agents with skills, instructions, and tools

Talking points:

- Layering: an agent inherits repo and user instructions, plus its own;
  it can also list "skills it knows about and prefers to use."
- Tool surface: restricting which tools an agent can call (e.g., a
  test-author agent that can edit only `src/test`).
- Delegation patterns: an agent that calls a skill internally vs. an
  agent that hands off to another agent.
- Sharing across a team: how to put an agent definition in the repo so
  every contributor gets the same persona.
- Debugging:
  - Agent picked the wrong tool → tighten the description.
  - Agent over-reached → tighten scope or tool surface.
  - Agent under-reached → relax tool restrictions, add examples.
  - Agent ignored a skill → check skill discovery and naming.

## Exercise: Create a `test-author` agent

Talking points:

- **Goal**: a custom agent that authors JUnit tests for `AssetService`
  given the project's instructions from [Section 2][s02].
- **Files/areas touched**: a new agent definition; the agent's runs
  produce new files under `src/test/java/com/contoso/assettracker/`.
  Production code under `src/main/java` is **not** modified.
- **Steps**:
  - Author the agent. Restrict its file edits to `src/test/**`.
  - Give it a brief: cover the happy path of asset assignment, the
    "asset already actively assigned" rejection, and at least one
    edge case from the unenforced business invariants list (so the
    test highlights gaps to be addressed in [Section 7][s07]).
  - Invoke the agent on `AssetService`. Review the diff.
- **How to verify**:
  - `mvn test` passes.
  - New tests live under `src/test/java/com/contoso/assettracker/`
    only.
  - At least one test exercises the active-assignment uniqueness
    guard. At least one test documents (e.g., via `@Disabled` or a
    failing-on-purpose assertion) an unenforced invariant — feeding
    section 7's capstone.

## Summary

You've built two custom agents — one that audits without changing
anything, one that authors tests under a tight scope. You've seen how
agents compose with the skills and instructions you built earlier.

Next you'll bring **MCP** into the picture — both the built-in GitHub
MCP tools and additional servers — in [Section 6][next-lesson].

## Resources

- [Copilot CLI documentation][copilot-cli-docs]
- [Building custom agents][copilot-custom-agents]
- [Spring Boot 3 migration guide][spring-boot-3-migration]
- [JUnit 5 user guide][junit-5]

---

| [← Previous: Agent skills][previous-lesson] | [Next: Managing agents and MCP →][next-lesson] |
|:--|--:|

[previous-lesson]: ../04-agent-skills/README.md
[next-lesson]: ../06-managing-agents-and-mcp/README.md
[s02]: ../02-instructions-files/README.md
[s04]: ../04-agent-skills/README.md
[s07]: ../07-real-world-workflow/README.md
[copilot-cli-docs]: https://docs.github.com/en/copilot/how-tos/use-copilot-agents/use-copilot-cli
[copilot-custom-agents]: https://docs.github.com/en/copilot
[spring-boot-3-migration]: https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-3.0-Migration-Guide
[junit-5]: https://junit.org/junit5/docs/current/user-guide/
