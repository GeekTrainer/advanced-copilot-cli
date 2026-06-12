---
name: make-repo-contribution
description: Use when making a reviewable repository contribution that should follow issue, branch, commit, push, and pull request hygiene.
---

# Make repo contribution

Use this skill when the user asks you to make a change that should be tracked as a normal repository contribution.

## Workflow

1. Inspect the current branch and working tree.
2. Create or identify the issue that describes the work.
3. Create a branch from the expected base branch.
4. Make the smallest change that satisfies the issue.
5. Run the relevant validation commands.
6. Commit with a concise conventional message.
7. Push the branch.
8. Open a pull request using `.github/PULL_REQUEST_TEMPLATE.md`.
9. Link the issue and include exact test evidence.

## Rules

- Do not commit or push without user approval.
- Do not include unrelated changes.
- Do not hide failing checks. Record them in the pull request with the command and output.
- Keep generated artifacts out of the pull request unless they are source-controlled by convention.
- If a prerequisite is missing, stop and ask instead of improvising external state.
