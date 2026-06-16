---
applyTo: "services/**/*.{py}"
---

# Python service instructions

AssetTrack's Python services live in `services/reporting-svc/` and `services/notifications-svc/`. They use FastAPI even though this instruction file keeps the Module 02 name `flask.instructions.md`.

## Rules

- Prefer `pathlib`, f-strings, and small pure helpers.
- Keep FastAPI route handlers thin and move reusable logic into helpers.
- Validate request inputs and handle malformed CSV rows explicitly.
- Do not make real network calls in unit tests. Use mocks or FastAPI test clients.
- Prefer temporary files, temporary directories, and isolated test data.
- Do not add production dependencies for test-only needs unless the user approves.

## Validation

- Run `cd services/reporting-svc && pytest` for reporting service test changes.
- Run service-specific pytest commands when changing other Python services.
