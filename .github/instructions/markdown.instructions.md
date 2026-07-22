---
description: 'Markdown conventions for this course repo (GitHub Flavored Markdown).'
applyTo: '**/*.md'
---

# Markdown conventions

These rules apply to every `.md` file in this repo. The course content renders on docs.github.com and GitHub.com, so target [GitHub Flavored Markdown][gfm-spec]. The rules below are house style layered on top of GFM — if a rule below conflicts with GFM, flag it; otherwise treat the house rule as authoritative.

## Formatting

- Use backticks for file names, directory names, commands, env vars, code identifiers, and literal CLI flags. Do not use **bold** or *italics* to denote a file. See the [GitHub Docs style guide on file names and directory names][gh-style-filenames].
  - Use: `` `README.md` ``, `` `.github/instructions/` ``, `` `npm install` ``
  - Avoid: **README.md**, *README.md*, README.md
- Reserve **bold** for genuine emphasis on a word or short phrase inside a sentence (≤5 words). Do not bold whole sentences, headings, or list-item labels by default.
- Use sentence case for headings ("Building the test suite", not "Building The Test Suite"). Match the casing of product names exactly (`GitHub`, `Copilot CLI`, `.NET`, `FastAPI`).
- Use ATX headings (`#`, `##`, `###`) with a single space after the `#`. Do not skip heading levels.
- Code fences must declare a language (` ```bash `, ` ```ts `, ` ```json `, ` ```text ` for plain output). Use ` ```text ` rather than an unfenced indented block for shell output.
- Use `-` for unordered list bullets. Be consistent within a file.
- Keep list items tight: never put a blank line between consecutive list items. A blank line between items makes the whole list "loose" and the renderer adds vertical space between every item. This applies to ordered and unordered lists alike, and ordered-list numbering still increments correctly without the blank lines.
  - When one item needs a child block (a code fence, a nested list, or a second paragraph), indent that block to align with the item's text and give it the blank line the block requires — but do not blank-separate the plain sibling items around it. See the stepped exercises in `content/03` and `content/07` for the pattern.
- Images need descriptive alt text. Avoid screenshots of terminal output — paste the text in a fenced block instead.

## Links

- Always use reference-style links. Define the URL once at the bottom of the file and reference it inline by label.

  ```markdown
  See the [GitHub Docs style guide][gh-style-guide] for the canonical rule.

  [gh-style-guide]: https://docs.github.com/contributing/style-guide-and-content-model/style-guide
  ```

- Never use "click here", "here", "this link", "read more", "learn more", or similar placeholder phrases as link text. Screen readers announce links out of context, so the link text alone must describe the destination.
- Never wrap the link in an extra sentence whose only job is to point at it ("For more information, see [X]."). Weave the link into a sentence that already exists.
  - Avoid: `Copilot CLI supports custom agents. For more details, see [the agents documentation][agents].`
  - Use: `Copilot CLI supports [custom agents][agents] for repeatable workflows.`
- Never introduce a link with a lead-in phrase whose only job is to hand off to it ("walked through in [X]", "described in [X]", "documented in [X]", "covered in [X]", "as explained in [X]"). The link must flow as part of a sentence that would stand on its own, anchored on the words that describe the destination.
  - Avoid: `Agents get their own path, walked through in [Preparing to use custom agents][enterprise-custom-agents].`
  - Use: `Agents get their own path. [Custom agents have a first-class enterprise tier][enterprise-custom-agents] that needs no plugin at all.`
- Link text should be a meaningful phrase from the surrounding sentence — the page title, a feature name, or a descriptive noun phrase — not a URL or filename.
- Use descriptive labels for reference definitions in lowercase kebab-case (`[gh-alerts]`, not `[1]`, `[link]`, or `[GH-Alerts]`). GFM case-folds labels, but keeping them lowercase-kebab makes them easy to grep and visually consistent. Group all definitions at the bottom of the file in the order they first appear.
- Strip language/locale codes from URLs so readers land in their own locale. Remove `/en/`, `/en-us/`, `/es/`, etc., from the path.
  - Avoid: `https://docs.github.com/en/contributing/style-guide-and-content-model/style-guide`
  - Use: `https://docs.github.com/contributing/style-guide-and-content-model/style-guide`

## Line wrapping

- Do not hard-wrap paragraphs, list items, blockquotes, or table cells. Keep each one on a single line and let the renderer (and the editor) soft-wrap. Reserve newlines for actual structural breaks — between paragraphs, before/after headings and code fences, between list items, etc.

## GitHub admonitions

Use GitHub's alert syntax for callouts. The marker goes on its own `>`-prefixed line; the body follows on subsequent `>`-prefixed lines. The `!` is **inside** the brackets.

```markdown
> [!NOTE]
> Supplemental context the reader can usually skip.

> [!TIP]
> A best practice or recommended path.

> [!IMPORTANT]
> Information the reader must not miss.

> [!WARNING]
> Risk worth flagging before the reader proceeds.

> [!CAUTION]
> Destructive or irreversible action.
```

Valid markers: `[!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]`, `[!CAUTION]`. Anything else (including `![NOTE]` with the bang outside the brackets) renders as a plain blockquote on GitHub.

Use admonitions sparingly — at most one per section, and never two in a row. If the content needs more than a short paragraph, promote it to its own heading instead. See the [GitHub Docs style guide on alerts][gh-style-alerts].

Keep admonitions at the root (left) margin — never indent them inside a list item. The renderer doesn't handle indented `> [!TIP]` blocks reliably. When a callout belongs mid-list, break the ordered list around it: end the list, place the admonition at root, then resume the list and set the next item's number explicitly so the sequence continues (e.g. `2.`).

## Course-content specifics

- The repo's narrative voice is concise and direct. Avoid filler ("In this module, we will…", "In this exercise you'll…", "Let's go ahead and…"). Cut sentences that don't add information.
- For UI and keyboard instructions, use **select** rather than "press", "click", "hit", or "tap". "Select" is input-agnostic — it covers mouse, keyboard, touch, and assistive technology — so it's both more inclusive and more accurate across the environments learners use. For example: "select **Code** > **Codespaces**", "select <kbd>Ctrl</kbd>+<kbd>S</kbd> to save". This applies to instructions aimed at the reader; it doesn't constrain prose describing what a tool does internally.
- Don't anthropomorphize Copilot CLI ("Copilot is excited to help", "Copilot understands"). Describe what the tool does, not what it "thinks" or "feels".
- In example commands shown in prose, prefer non-destructive forms. Use `rm -r` rather than `rm -rf` so a reader who copy-pastes still has a chance to abort.
- Module files live in `content/` and are numbered `NN-short-slug.md`. The H1 is the module title. Cross-link adjacent modules via link reference definitions at the bottom of the file (see existing modules for the pattern).
- Call the numbered course units "Module" — never "Section". This applies to H1 titles (`# Module 3 — ...`), cross-references in prose ("from Module 2", "in Modules 2–3"), and link text (`[Module 4][m04]`). Reserve the word "section" for an actual sub-part of a document, such as a heading within a module or a section of a generated report.
- Name module link reference labels `mNN` to match the file number (`[m04]: ./04-lifecycle-hooks.md`), not `sNN` or other prefixes.

## Validation checklist

When writing or reviewing a markdown change, confirm:

- [ ] No bold or italic formatting on file names, directory names, or commands — only backticks.
- [ ] Admonition markers use `[!NOTE]` (bang inside brackets), one per section, marker on its own `>` line.
- [ ] Admonitions sit at the root margin, never indented inside a list item; mid-list callouts break the list and resume numbering explicitly.
- [ ] Each paragraph, list item, and blockquote is a single unbroken line.
- [ ] List items are tight — no blank lines between consecutive items (blank lines appear only to attach a child block to an item).
- [ ] Every code fence has a language identifier.
- [ ] Links use reference style with descriptive labels (no inline URLs, no `[click here]` / `[learn more]` / `[here]`).
- [ ] No "For more information, see X" sentences and no lead-in phrases ("walked through in X", "described in X") — links are woven into existing prose and anchored on descriptive words.
- [ ] URLs have no `/en/` or other locale codes in the path.
- [ ] Headings use ATX style with a space after `#` and sentence case.
- [ ] Product names match canonical casing (`GitHub`, `Copilot CLI`, `.NET`, `FastAPI`, `AssetTrack`).
- [ ] Numbered course units are called "Module" (not "Section") in titles, prose, and link text, and use `mNN` reference labels.
- [ ] UI and keyboard instructions use "select", not "press", "click", "hit", or "tap".

[gfm-spec]: https://github.github.com/gfm/
[gh-style-filenames]: https://docs.github.com/contributing/style-guide-and-content-model/style-guide#file-names-and-directory-names
[gh-style-alerts]: https://docs.github.com/contributing/style-guide-and-content-model/style-guide#alerts
