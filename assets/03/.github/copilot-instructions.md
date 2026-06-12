# AssetTrack Copilot instructions

AssetTrack is a polyglot microservices application used by Contoso Industries to track hardware assets and employee assignments. Treat this repository as a teaching codebase: make small, reviewable changes, keep the current architecture intact, and explain tradeoffs when a fix crosses service boundaries.

## Project layout

- `services/web/` contains the Astro SSR frontend with React islands and Bootstrap styles.
- `services/assets-svc/` contains the .NET 8 asset service.
- `services/workforce-svc/` contains the Java 21 Spring Boot workforce service.
- `services/reporting-svc/` and `services/notifications-svc/` contain Python FastAPI services.
- `services/audit-svc/` and `services/auth-svc/` contain legacy Java 11 Spring Boot services.
- `tests/playwright/` contains browser tests when Section 03 adds the Playwright foundation.

## Commands

- Install root dependencies with `npm install`.
- Install service dependencies with `npm run install:all`.
- Start the full app with `npm run dev`.
- Run browser tests with `npm run test:e2e` after the Playwright foundation exists.
- Run asset service tests with `dotnet test services/assets-svc/Tests/AssetsService.Tests.csproj`.
- Run reporting service tests with `cd services/reporting-svc && pytest`.
- Build the web app with `npm --prefix services/web run build`.

## Contribution rules

- Inspect the relevant service and tests before editing.
- Keep changes scoped to the user's request.
- Do not upgrade framework major versions unless the user asks.
- Do not rename packages, projects, services, public routes, or ports unless the task requires it.
- Prefer adding or updating tests with behavior changes.
- For accessibility work, use semantic HTML, connected labels, keyboard support, and accessible names before adding custom ARIA.
- For data access code, use parameterized queries and framework query APIs instead of string concatenation.
- Before committing or delegating, show the current git status and summarize the files changed.
