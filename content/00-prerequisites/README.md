# Section 0 — Prerequisites and environment setup

|  | [Next: Getting started with Copilot CLI →][next-lesson] |
|:--|--:|

Before you can use Copilot CLI on the AssetTrack legacy app, you need a few
pieces in place: a working CLI install, a fork of the legacy app, and a
runnable dev environment. This section gets you there with as little
ceremony as possible.

## What you will learn

- How to install and authenticate Copilot CLI.
- How to fork [`geektrainer/legacy-app`][legacy-app] and open it in a
  Codespace (or run it locally).
- How to verify your CLI version and confirm the slash commands this
  course relies on are available.
- How to confirm the AssetTrack app actually runs before you start
  exercising Copilot against it.

## Scenario

> [!NOTE]
> **Starting state**: a clean machine (or a fresh Codespace). No prior
> sections required. This section is **setup only** — no code changes.

You're about to spend the rest of the course working in AssetTrack. Before
the first agent prompt, you'll get the CLI installed and verify the app
boots. Boring but essential — skipping it costs you time later.

## Setup steps

Talking points for the human author to flesh out:

- **Install Copilot CLI** — point at the official install instructions;
  cover macOS, Linux, and Windows (WSL).
- **Authenticate** — `copilot` first run, GitHub login flow, org policy
  considerations (Copilot CLI access may need to be enabled by an admin).
- **Fork the legacy app** — fork [`geektrainer/legacy-app`][legacy-app]
  to the learner's account so later MCP write exercises target the fork.
- **Open in Codespaces (recommended)** — the legacy app ships with a
  devcontainer that includes Java 11, Java 17, Python 3, and Maven. Or
  clone locally if the learner prefers.
- **Run the app** — `mvn spring-boot:run`, open `http://localhost:8080`,
  click through the dashboard, asset list, and employee list to confirm
  the app loads.

## Verifying your CLI is ready

Talking points:

- Run `/version` (or equivalent) and note the version. Reference docs in
  [Resources](#resources) for the minimum version this course assumes.
- Run `/update` to make sure you're on the latest.
- Check that the slash commands this course leans on are available:
  `/agent`, `/skills`, `/mcp`, `/env`, `/diff`, `/review`,
  `/add-dir` / `/list-dirs`, `/context`, `/session`.
- Confirm Copilot CLI access for your account — note quota / premium
  request consumption considerations and where to check them.
- (Optional) note any organization policies that gate access to Copilot
  CLI features.

## Verifying AssetTrack is ready

Talking points:

- App responds on `:8080` with the dashboard rendering summary counts.
- `/assets` lists assets and `/employees` lists employees.
- Python scripts in `scripts/` execute (`python scripts/import_assets.py`
  against `scripts/data/sample_import.csv`).

## Summary

You should now have:

- Copilot CLI installed, authenticated, and on a recent version.
- A fork of `legacy-app` running locally or in a Codespace.
- Confidence that the CLI's command surface is what this course expects.

Next, [start a real conversation with the codebase][next-lesson].

## Resources

- [Copilot CLI documentation][copilot-cli-docs]
- [GitHub Copilot CLI repository][copilot-cli-repo]
- [Legacy app: `geektrainer/legacy-app`][legacy-app]
- [GitHub Codespaces overview][codespaces-docs]
- [Spring Boot 2.7 reference][spring-boot-2-7]

---

|  | [Next: Getting started with Copilot CLI →][next-lesson] |
|:--|--:|

[next-lesson]: ../01-getting-started-with-copilot-cli/README.md
[legacy-app]: https://github.com/geektrainer/legacy-app
[copilot-cli-docs]: https://docs.github.com/en/copilot/how-tos/use-copilot-agents/use-copilot-cli
[copilot-cli-repo]: https://github.com/github/copilot-cli
[codespaces-docs]: https://docs.github.com/en/codespaces/overview
[spring-boot-2-7]: https://docs.spring.io/spring-boot/docs/2.7.x/reference/html/
