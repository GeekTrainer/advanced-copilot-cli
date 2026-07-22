---
description: 'Structure and authoring pattern for the Advanced Copilot CLI course modules in content/.'
applyTo: 'content/*.md'
---

# Course module authoring pattern

Rules for authoring and revising the numbered course modules in `content/`. These cover module structure and exercise style; for markdown house style (links, admonitions, headings, line wrapping) follow `.github/instructions/markdown.instructions.md`. When in doubt, match the finished modules `content/01`–`content/04` and `content/07` — they are the reference implementations. Follow existing patterns; don't invent new ones.

## Module structure

Every module file follows this section order:

1. `# Module N — <Title>` — H1 with an em dash (`—`), sentence case, canonical product casing.
2. A navigation table linking the previous and next modules:

   ```markdown
   | [← Previous: <previous title>][previous-lesson] | [Next: <next title> →][next-lesson] |
   |:--|--:|
   ```

3. One or two short intro paragraphs that frame the module against the running AssetTrack / Contoso narrative and what earlier modules established. Don't open with filler ("In this module we will…").
4. `## What you will learn` — opens with the line `By the end of this module you will be able to:` followed by verb-first outcome bullets. (Module 0 is the only module without this section.)
5. `## Scenario` — prose that grounds the module's problem in AssetTrack / Contoso. End it (not start it) with a `> [!NOTE]` that states the starting state and that exercises target the learner's fork. Add a workflow image only when it earns its place.
6. Alternating concept and exercise sections for the body:
   - Concept section: `## <plain noun phrase>` (for example `## Custom agents in Copilot CLI`), with optional `###` subsections. Explain what the feature is and when to use it before the exercise that applies it.
   - Exercise section: `## Exercise N: <imperative title>`, numbered sequentially within the module. Open with a short intro (one or two sentences) that states what the learner is about to do, then the steps, then a closing paragraph that states what they just accomplished and the end state they should see — often phrased `When you're done, …`. Every exercise gets both an intro and a close; see `content/03` for the clearest example.
7. `## Summary` — one framing sentence, a short recap list (`In this module, you…` or `You've now:`), and a closing sentence that points to the next module via `[Module N+1][next-lesson]`.
8. `## Resources` — a bulleted list of reference-style links to the official docs used in the module.
9. A `---` rule, then the navigation table from step 2 repeated.
10. All reference link definitions grouped at the bottom in order of first appearance: `previous-lesson`, `next-lesson`, the `mNN` module labels, then doc links.

If a module depends on assets from earlier modules a learner may have skipped, add a catch-up block after the intro: a `> [!NOTE]` starting state plus a `node scripts/catchup.mjs` fenced command (see `content/03`).

## Exercise and step conventions

- Use numbered steps. When a step sequence gets long, group it under `###` subsections and restart numbering at 1 in each subsection (see `content/02` and `content/07`). Keep step lists tight — no blank lines between consecutive steps, only around a step's own child block (see the list rule in `markdown.instructions.md`).
- The first exercise that needs a session opens with the canonical setup steps: reopen the codespace, start a Copilot CLI session, trust the folder, then run `/models` and select **Auto**. There are two accepted ways to start the session — pick one per module and reuse its exact wording rather than paraphrasing:
  - Terminal flow: open a terminal and run `copilot` from the repository root (used in `content/03`, `content/04`, and `content/07`).
  - Side-panel flow: open the Command Palette and select **Chat: New Copilot CLI Session to the side** (used in `content/02`).
- Whenever a step opens a terminal, tell the learner how to open it rather than assuming one is ready. Include the keyboard shortcut: <kbd>Ctrl</kbd> + <kbd>`</kbd> to open a terminal, and <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>`</kbd> to open an additional terminal alongside one that's already running (for example, when a `npm run dev` process must keep running in the first). This applies every time an additional terminal is needed, not just the first.
- Weave verification into the steps themselves (run `/mcp`, watch the tool calls, open `/instructions`). Do not add a separate end-of-exercise checklist — no finished module uses one.
- Prefer non-destructive command forms in prose.
- Keep the AssetTrack / Contoso narrative continuous across modules, and cross-link with `[Module N][mNN]`.

## Prompts sent to Copilot

Exercises show prompts the learner types to Copilot. Write each one the way a developer would actually type it:

- Put the prompt in a ` ```text ` fenced block.
- Use natural, first-person phrasing with a specific request — name the files, folders, tools, and constraints that matter.
- Don't restate rules that already live in a loaded instruction file, and don't cite instruction-file paths inside the prompt; instruction files load automatically, so a human wouldn't repeat them.
- Keep it to what a human would send in one message — specific enough to act on, not a formal spec.

## Verifying facts

Course content teaches a real product, so every capability, command, file path, and setting must match the current official documentation. Verify claims against the docs before writing them, prefer linking the exact reference page, and confirm links resolve.
