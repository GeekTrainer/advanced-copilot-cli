---
applyTo: "services/assets-svc/**/*.cs"
---

# .NET instructions

AssetTrack's asset service lives in `services/assets-svc/` and uses .NET 8 with ASP.NET Core minimal APIs and SQLite.

## Rules

- Keep endpoints small and delegate data access to the existing data layer.
- Preserve route shapes and JSON contracts unless the task requires a breaking change.
- Use nullable reference types correctly.
- Validate input at service boundaries.
- Prefer parameterized database access and existing Entity Framework or SQLite helpers.
- Use isolated test data and temporary databases in tests.
- Do not introduce new backend framework dependencies unless the existing test framework needs them.

## Validation

- Run `dotnet test services/assets-svc/Tests/AssetsService.Tests.csproj` for asset service changes.
