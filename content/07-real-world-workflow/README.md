# Section 7 — Real-world workflow: audit to PR

| [← Previous: Managing agents and MCP][previous-lesson] | [Next: Wrap-up →][next-lesson] |
|:--|--:|

Time to use everything together. In this section you'll take the worst
unenforced gap in AssetTrack — the assignment business rules — and drive
it from "issue on the backlog" to "merged PR" using your agents, skills,
and MCP tools. This is the capstone.

## What you will learn

- How to chain instructions, skills, custom agents, and MCP tools into a
  single end-to-end workflow.
- How to keep humans in the loop at the right checkpoints (plan review,
  diff review, test pass, PR review).
- How to use Copilot CLI to author and self-review a pull request.
- How to recognize when to push back on the agent.

## Scenario

> [!NOTE]
> **Starting state**: prior sections complete. The capstone exercise
> **modifies Java source and templates** and **opens a PR on the
> learner's fork**. Work on a branch (e.g., `feat/enforce-assignment-rules`).
> The optional/stretch exercise also modifies source.

The legacy app's plan calls out three intentionally unenforced
assignment rules. They are real bugs with real data-integrity
consequences. You'll fix them — and you'll do it the way a senior dev
on a real team would.

## Tech overview: End-to-end agent workflow

Talking points:

- The phases of a real workflow: audit → backlog → branch → plan →
  implement → test → PR → review → merge.
- Where each phase maps to the tools you've built:
  - Audit → `security-audit` skill, `spring-boot-3-migration-planner`
    agent.
  - Backlog → GitHub MCP draft + create issues.
  - Plan → plan-first prompting (Section 3).
  - Implement → `legacy-app`-aware Copilot CLI session with the
    project's instructions loaded.
  - Test → `test-author` agent.
  - PR → GitHub MCP create-PR tool.
  - Review → GitHub MCP review surface, `/diff`, `/review`.
- The role of git checkpoints throughout.

## Exercise (capstone): Enforce the unenforced assignment business rules

Talking points:

- **Goal**: implement, test, and merge fixes for the three unenforced
  rules listed in `legacy-app/plan.md`:
  1. Inactive employees cannot receive new assets.
  2. Lost or retired assets cannot be assigned.
  3. `returned_date` must be `>= assigned_date`.
- **Files/areas touched**:
  - `AssignmentService.java` — primary location for rule
    enforcement.
  - `AssignmentController.java` — surface validation errors to the
    user.
  - `assignments.html` — render error messages alongside the form.
  - `src/test/java/com/contoso/assettracker/` — new tests via the
    `test-author` agent.
- **Steps**:
  - Branch off `main`.
  - Confirm the corresponding issues from [Section 6][s06] exist on
    the fork (one per rule, or one umbrella issue with three
    acceptance criteria — your call).
  - Plan-first prompt: ask Copilot for a written plan covering all
    three rules, including where in the service / controller layer
    each check belongs and what error message the UI should show.
    Iterate the plan.
  - Implement the rules in `AssignmentService` (and surface them in
    the controller / template).
  - Invoke the `test-author` agent to add tests for each rule —
    happy path and rejection path.
  - Run `mvn test` until green.
  - Use `/diff` and `/review` to self-review the change set.
  - Use a GitHub MCP tool to open a PR on the fork with a
    Copilot-drafted body that links the issue(s).
- **How to verify**:
  - `mvn test` is green and includes new tests for all three rules.
  - In the running app, manually try each rule's failure case
    (assign to an inactive employee; assign a "lost" asset; set
    `returned_date` before `assigned_date`) and confirm the UI
    rejects with a clear error.
  - A PR exists on the learner's fork that closes the linked
    issues.
  - The diff is contained — only assignment-related files,
    templates, and tests are changed.

## Tech overview: Reviewing and trusting agent work

Talking points:

- What good diff hygiene looks like in CLI work — small commits,
  per-rule commits where possible, no drive-by reformatting.
- Human-in-the-loop checkpoints: plan review, diff review,
  test-pass review, PR review. Skipping any of them is how
  agentic work goes wrong.
- When to push back on the agent: tests passing isn't proof of
  correctness; "looks plausible" isn't proof of behavior.
- Self-review with the GitHub MCP: pulling up the PR diff inside
  the CLI and asking Copilot to challenge its own work.
- Knowing when to merge yourself vs. ask a teammate.

## Stretch / optional exercise: Add input validation to the asset create form

Talking points:

- **Goal**: a smaller, second pass through the same workflow — useful
  practice for a learner who wants more reps.
- **Files/areas touched**:
  - `AssetController.java` — server-side validation on the create
    handler.
  - `assets.html` — error display alongside the create form (the
    create form lives in `assets.html`, **not** `asset-detail.html`).
  - `src/test/java/com/contoso/assettracker/` — new controller-level
    tests.
- **Steps**: same end-to-end flow as the capstone, scaled down to a
  single feature.
- **How to verify**:
  - Submitting the create form with a missing `asset_tag`,
    `asset_type`, or `manufacturer` returns to the form with a
    visible error.
  - Submitting a `purchase_date` newer than `warranty_expiry` is
    rejected.
  - `mvn test` passes including new tests.

## Summary

You've now run a full real-world workflow on the AssetTrack codebase —
from existing backlog issues to a tested, reviewable PR — using the
agents, skills, instructions, and MCP setup you built across the
course.

Next, take stock of what you built and where to go next in
[Section 8][next-lesson].

## Resources

- [Copilot CLI documentation][copilot-cli-docs]
- [GitHub Pull Requests overview][github-prs]
- [GitHub MCP server][github-mcp-server]
- [Spring `@Valid` and bean validation][spring-validation]
- [Legacy app implementation plan (business invariants)][legacy-app-plan]

---

| [← Previous: Managing agents and MCP][previous-lesson] | [Next: Wrap-up →][next-lesson] |
|:--|--:|

[previous-lesson]: ../06-managing-agents-and-mcp/README.md
[next-lesson]: ../08-wrap-up/README.md
[s06]: ../06-managing-agents-and-mcp/README.md
[copilot-cli-docs]: https://docs.github.com/en/copilot/how-tos/use-copilot-agents/use-copilot-cli
[github-prs]: https://docs.github.com/en/pull-requests
[github-mcp-server]: https://github.com/github/github-mcp-server
[spring-validation]: https://docs.spring.io/spring-framework/reference/core/validation/beanvalidation.html
[legacy-app-plan]: https://github.com/geektrainer/legacy-app/blob/main/plan.md
