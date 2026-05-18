# Publishing this course to the Learning Hub

This document describes a potential plan for landing the **advanced-copilot-cli** course inside the [`awesome-copilot`](https://github.com/github/awesome-copilot) Learning Hub with a modular approach to allow for exercises to use different languages and scenarios. Authoring continues to live in this repo; the awesome-copilot side is downstream.

## Goal

Land the course at `/learning-hub/advanced-copilot-cli/` on the Learning Hub site as **three tracks** the learner picks once and stays in:

- **multi-stack** — the canonical AssetTrack content (Java + Astro/TypeScript + .NET + FastAPI) — this repo's nine modules
- **dotnet** — .NET-focused legacy modernization scenario (stub initially; content TBD)
- **nextjs** — Next.js greenfield scenario (stub initially; content TBD)

URL shape per lesson: `/learning-hub/advanced-copilot-cli/{track}/NN-slug/`.

**Next.js skip-list**: greenfield Next.js doesn't fit the brownfield-modernization framing of `06-modernize-apps`, and the custom-MCP-for-the-legacy-database exercise in `07-manage-infrastructure` is also out of scope. Skip `06-modernize-apps` and `07-manage-infrastructure`; keep `00, 01, 02, 03, 04, 05, 08`. The Next.js track overview will note the intentional omission.

## Approach

### URL & content shape

- **Per-track URLs** so each track has its own pagination chain and sidebar group.
- **Concept inline per track** — no shared concept partial. The Java track is the canonical body; the other two are independent files filled in over time.
- **Skip enforcement** — files simply don't exist in the `nextjs/` folder. No frontmatter mechanism needed.

### MDX

Starlight 0.38 already auto-injects `@astrojs/mdx`, so no install is required on the awesome-copilot side. The only `.mdx` file we create is the track-picker landing page, which uses `<CardGrid>` and `<LinkCard>`. All lesson files remain `.md`.

### Track picker

`advanced-copilot-cli/index.mdx` on the awesome-copilot side renders one `<CardGrid>` of three `<LinkCard>`s, one per track, each linking to that track's `00-prerequisites`. A "remember the learner's chosen track in localStorage" enhancement is deferred.

### Sync script — `scripts/sync-advanced-copilot-cli.mjs` (in awesome-copilot)

Pure-Node (uses only built-ins so it runs from the awesome-copilot repo root with no dependency-resolution issues). Behavior:

1. **Source path** resolved via `path.join(os.homedir(), 'repos', 'advanced-copilot-cli', 'content')`. Override with `--source` flag or `ADVANCED_CLI_SOURCE` env var.
2. **For each of the nine source `.md` files**:
   - Strip the leading H1 to derive `title`.
   - Derive `description` from the first paragraph after the H1 (truncated).
   - Derive `lastUpdated` from the **source file mtime** so re-running with no source changes produces no diff.
   - Inject Starlight frontmatter:
     ```yaml
     ---
     title: "<from H1>"
     description: "<from lead paragraph>"
     lastUpdated: <YYYY-MM-DD from source mtime>
     editUrl: false
     prev: { link: ..., label: ... }
     next: { link: ..., label: ... }
     ---
     ```
   - Inject a top-of-file HTML comment: `<!-- AUTO-GENERATED from advanced-copilot-cli source repo. Do not edit directly; edit upstream and re-run scripts/sync-advanced-copilot-cli.mjs. -->`
   - Convert GitHub-flavored admonitions to Starlight Asides:
     - `> [!NOTE]` → `:::note`
     - `> [!IMPORTANT]` / `[!TIP]` → `:::tip`
     - `> [!WARNING]` / `[!CAUTION]` → `:::caution`
     - Defensively handle the malformed `> ![NOTE]` variant (bang outside brackets) in case it reappears; canonical form is `> [!NOTE]`.
     - Consume the full blockquote body and emit a closing `:::`.
   - Rewrite **all** local Markdown links to track-internal slugs:
     - reference-style defs: `[next-lesson]: ./01-foo.md` → `[next-lesson]: /learning-hub/advanced-copilot-cli/multi-stack/01-foo/`
     - inline links: `[text](./01-foo.md#anchor)` → `[text](/learning-hub/advanced-copilot-cli/multi-stack/01-foo/#anchor)`
     - Both `./` and bare `01-foo.md` forms supported.
     - External links (`http`, `https`, `mailto:`, in-page `#`) preserved unchanged.
   - Compute `prev`/`next` from a manifest of the nine ordered slugs:
     - First lesson: `prev: false`.
     - Last lesson: `next: false`.
     - All others: `prev`/`next` to neighboring slugs with their titles as labels.
3. **Write** to `website/src/content/docs/learning-hub/advanced-copilot-cli/multi-stack/` in awesome-copilot. Idempotent.
4. **Fail loudly** if a local link target doesn't exist in the source set, an unrecognized `> [!XXX]` admonition appears, or a local image link is encountered (image asset handling is out of scope for the first iteration).
5. Do **not** touch `dotnet/` or `nextjs/` folders.

### Stubs (dotnet, nextjs)

Each stub `.md` on the awesome-copilot side:

```yaml
---
title: "<lesson title>"
description: "Coming soon."
sidebar:
  order: <NN>
pagefind: false       # keep stubs out of search until written
prev: false
next: false
---
```

Body: short "Coming soon" paragraph. Each track's `index.md` gets `sidebar: { order: 0 }` so the overview appears above the numbered lessons.

### Sidebar config (`website/astro.config.mjs`)

A new top-level group is inserted between "CLI for Beginners" and "Cookbook":

```js
{
  label: "Advanced Copilot CLI",
  items: [
    { label: "Overview", link: "/learning-hub/advanced-copilot-cli/" },
    {
      label: "Multi-stack (AssetTrack)",
      collapsed: true,
      autogenerate: { directory: "learning-hub/advanced-copilot-cli/multi-stack" },
    },
    {
      label: ".NET legacy",
      collapsed: true,
      autogenerate: { directory: "learning-hub/advanced-copilot-cli/dotnet" },
    },
    {
      label: "Next.js greenfield",
      collapsed: true,
      autogenerate: { directory: "learning-hub/advanced-copilot-cli/nextjs" },
    },
  ],
},
```

Pagination is governed by the explicit `prev`/`next` frontmatter on each multi-stack lesson, so a learner finishing the multi-stack track doesn't get chained into the .NET stubs.

### `learning-hub-updater.md` workflow

That workflow already excludes `cli-for-beginners` from automated edits. Its exclusion sentence will be extended to also exclude `advanced-copilot-cli`, since this course is upstream-sourced from this repo.

## Module → track applicability

| Module                              | multi-stack | dotnet | nextjs |
| ----------------------------------- | :---------: | :----: | :----: |
| 00-prerequisites                    |     ✅      |   ✅   |   ✅   |
| 01-working-with-copilot-cli         |     ✅      |   ✅   |   ✅   |
| 02-building-ai-infrastructure       |     ✅      |   ✅   |   ✅   |
| 03-test-suite-remote-delegation     |     ✅      |   ✅   |   ✅   |
| 04-lifecycle-hooks                  |     ✅      |   ✅   |   ✅   |
| 05-add-feature-barcode              |     ✅      |   ✅   |   ✅   |
| 06-modernize-apps                   |     ✅      |   ✅   |   ❌   |
| 07-manage-infrastructure            |     ✅      |   ✅   |   ❌   |
| 08-wrap-up                          |     ✅      |   ✅   |   ✅   |

> [!NOTE]
> The course's canonical scenario is now **AssetTrack** (Java + Astro/TypeScript + .NET + FastAPI), so the previous "java" track has been renamed to `multi-stack`. The upstream `legacy-app` repo may need a counterpart that matches this multi-stack shape — flagged separately from this publishing plan.

## Target folder layout (downstream, in awesome-copilot)

```
website/src/content/docs/learning-hub/advanced-copilot-cli/
  index.mdx                              ← track picker (CardGrid + 3 LinkCards)
  multi-stack/
    index.md                             ← track overview, sidebar.order: 0
    00-prerequisites.md                  ← all sync-generated, with explicit prev/next
    01-working-with-copilot-cli.md
    02-building-ai-infrastructure.md
    03-test-suite-remote-delegation.md
    04-lifecycle-hooks.md
    05-add-feature-barcode.md
    06-modernize-apps.md
    07-manage-infrastructure.md
    08-wrap-up.md
  dotnet/                                ← stubs
    index.md
    00-prerequisites.md … 08-wrap-up.md  (9 stubs, matching multi-stack slugs)
  nextjs/                                ← stubs, skip-list applied
    index.md
    00-prerequisites.md
    01-working-with-copilot-cli.md
    02-building-ai-infrastructure.md
    03-test-suite-remote-delegation.md
    04-lifecycle-hooks.md
    05-add-feature-barcode.md
    08-wrap-up.md
```

## Implementation steps (downstream)

1. Create the `advanced-copilot-cli/` skeleton + track-picker `index.mdx`.
2. Author `scripts/sync-advanced-copilot-cli.mjs` per the spec above.
3. Run the sync script to mirror the multi-stack track from this repo.
4. Stub the `dotnet/` track (nine lesson stubs + index, matching the multi-stack slugs).
5. Stub the `nextjs/` track (seven lesson stubs + index, skipping 06 and 07).
6. Update `website/astro.config.mjs` with the new sidebar group.
7. Extend `.github/workflows/learning-hub-updater.md` to exclude `advanced-copilot-cli`.
8. Run `npm run build` in `website/` and verify: no broken-link errors, all three tracks render, multi-stack track's prev/next chain is bounded within the track.

## Authoring guidance for this repo

To keep sync friction low, follow these conventions in `content/*.md`:

- **Single H1** at the top of each lesson; the script uses it as the page title.
- **Lead paragraph** immediately after the H1 — used as the page description.
- **GitHub-style admonitions** (`> [!NOTE]`, `> [!TIP]`, `> [!WARNING]`, `> [!CAUTION]`, `> [!IMPORTANT]`) are auto-converted to Starlight Asides. Always use this canonical form — bang inside the brackets, marker on its own `>` line.
- **Internal links** to other lessons use relative paths (`./01-foo.md` or `[next-lesson]: ./01-foo.md`); they're auto-rewritten to track-internal Starlight slugs.
- **No local images yet.** The sync script fails on local image references; add image handling before introducing them.
- **Lesson order** is set by the numeric filename prefix (`00-…` … `08-…`).

## Out of scope (deferred)

- localStorage "remember my chosen track" client behavior on the picker page.
- Promoting the sync script to an agentic workflow that runs in CI.
- Image / asset handling in the sync script.
- Filling in the .NET legacy and Next.js greenfield lesson bodies.
