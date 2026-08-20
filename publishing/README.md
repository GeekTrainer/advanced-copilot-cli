# `publishing/` — awesome-copilot Learning Hub distribution

This directory stages everything needed to publish this course into the [`github/awesome-copilot`][awesome-copilot] Learning Hub, mirroring the established [`github-samples/copilot-workshops`][workshops] precedent. Nothing here runs against `awesome-copilot` — it is staged in this repo for review and contributed upstream later.

## What's here

- `advanced-copilot-cli-sync.md` — the [GitHub Agentic Workflow][gh-aw] that keeps the Learning Hub mirror aligned with this course. It is written exactly as it will live at `.github/workflows/advanced-copilot-cli-sync.md` in `awesome-copilot`, a third sibling to `cli-for-beginners-sync.md` and `copilot-workshops-sync.md`. It runs read-only, pulls from the public sample `github-samples/advanced-copilot-cli`, and opens a **same-repo** PR via gh-aw `safe-outputs.create-pull-request` on the built-in `GITHUB_TOKEN` — no fork, no PAT, no cross-repo secret, human-reviewed.
- `preview/` — a dry-run render of the transformed course tree, produced by `../scripts/awesome-copilot-dry-run.mjs`. It shows precisely what the sync workflow would write into `awesome-copilot`, so the mapping can be reviewed before anything goes live.
- `preview/REGISTRATION.md` — the three navigation touch-points (`astro.config.mjs` sidebar, Learning Hub `index.md`, and the course/track landing pages) a reviewer applies upstream.

## Safety posture (staged / dry-run)

The workflow ships with `safe-outputs.staged: true`. In staged mode a real run executes normally but **opens no pull request** — the intended PR is emitted as a run artifact for preview only. This is deliberate while both `github-samples/advanced-copilot-cli` and the destination are still internal. `gh aw compile` bakes this into the lock as `GH_AW_SAFE_OUTPUTS_STAGED: "true"`, so there is no way for a run to reach `awesome-copilot` until the flag is removed.

## Regenerating the preview

```bash
node scripts/awesome-copilot-dry-run.mjs
```

The transform is deterministic and offline (no network). It reads `content/NN-*.md` and writes `publishing/preview/`. Re-run it whenever the course content changes to keep the preview honest.

## How this goes live (flip-to-live checklist)

1. `github-samples/advanced-copilot-cli` is public, and its `content/` matches this repo.
2. Fork `github/awesome-copilot` to `GeekTrainer/awesome-copilot` (already available).
3. On a branch of that fork, add `advanced-copilot-cli-sync.md` to `.github/workflows/`, **remove the `staged: true` line**, and run `gh aw compile` to (re)generate the committed `.lock.yml`.
4. Seed the initial mirror. The course is ~9 markdown files + 5 images, comfortably under the 100-file safe-output PR cap, so the first scheduled/dispatched run can create it; if the tree ever grows past the cap, seed it in one manual PR the way `copilot-workshops` was.
5. Run `npm run build` (regenerates `README.md`) and `bash eng/fix-line-endings.sh` in `awesome-copilot`, then open the PR to `github/awesome-copilot` **from the fork** for human review. Do not auto-merge.

Until step 3 removes `staged: true`, the workflow is inert with respect to `awesome-copilot`.

[awesome-copilot]: https://github.com/github/awesome-copilot
[workshops]: https://github.com/github/awesome-copilot/blob/main/.github/workflows/copilot-workshops-sync.md
[gh-aw]: https://github.github.com/gh-aw
