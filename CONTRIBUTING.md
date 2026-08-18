# Contributing

Thanks for your interest in contributing to the **Advanced Copilot CLI course**! This repository hosts the course content — the Markdown modules in [`content/`][content-dir] that make up the hands-on lessons.

## Code of Conduct

This project is released with a [Contributor Code of Conduct][code-of-conduct]. By participating, you agree to abide by its terms.

Contributions are released under the [project's open source license][license].

## What to read first

If you want to author or edit content, start with the [Markdown conventions][markdown-instructions] — the house style every `.md` file in this repo follows (reference-style links, no hard-wrapped paragraphs, GitHub admonition syntax, sentence-case headings, and the module cross-linking pattern). For how the course maps onto the downstream Learning Hub, see [`PUBLISHING.md`][publishing].

Module files live in [`content/`][content-dir], numbered `NN-short-slug.md`. The H1 is the module title, and adjacent modules cross-link through reference definitions at the bottom of each file — follow an existing module for the pattern.

## Submitting a pull request

1. [Fork][fork] and clone the repository.
2. Create a topic branch (`git checkout -b my-change`).
3. Make your change. Keep PRs focused — one logical change per PR.
4. Push to your fork and [open a pull request][compare].
5. Wait for review.

## Before you push

- Confirm your Markdown follows the [conventions][markdown-instructions] — run through the validation checklist at the bottom of that file.
- Check that every internal link resolves and that any content you built or previewed renders as expected.

## Commit messages

Conventional commit prefixes preferred: `docs:`, `chore:`, `fix:`, `ci:`, `feat:`.

Include a `Co-authored-by` trailer when AI-assisted:

```text
Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
```

## A note on catch-up branches

The learner-facing catch-up branches (`start-of-module-N`) live in the companion [`legacy-app`][legacy-app] repository and are machine-generated from this course content. Author your changes to the modules here — never edit those branches directly.

## Resources

- [How to contribute to open source][how-to-contribute]
- [Using pull requests][about-pull-requests]

[code-of-conduct]: ./CODE_OF_CONDUCT.md
[license]: ./LICENSE
[markdown-instructions]: ./.github/instructions/markdown.instructions.md
[publishing]: ./PUBLISHING.md
[content-dir]: ./content/
[legacy-app]: https://github.com/geektrainer/legacy-app
[fork]: https://github.com/GeekTrainer/advanced-copilot-cli/fork
[compare]: https://github.com/GeekTrainer/advanced-copilot-cli/compare
[how-to-contribute]: https://opensource.guide/how-to-contribute/
[about-pull-requests]: https://docs.github.com/articles/about-pull-requests/
