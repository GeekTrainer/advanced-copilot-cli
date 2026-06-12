---
applyTo: "services/**/*.{java,xml}"
---

# Java service instructions

AssetTrack has Java services in `services/workforce-svc/`, `services/audit-svc/`, and `services/auth-svc/`. `workforce-svc` uses Java 21 and Spring Boot 3. The legacy services use Java 11 and Spring Boot 2.7.

## Rules

- Preserve each service's Java version and Spring Boot major version unless the task is a modernization exercise.
- Keep controllers thin and move business logic into service classes.
- Never build SQL by concatenating untrusted input.
- Prefer constructor injection over field injection.
- Keep DTOs and domain models simple.
- Do not rename packages, Maven artifact IDs, routes, or ports unless the task requires it.

## Validation

- Run the service's Maven test command from that service directory.
- Use `scripts/with-java11` for legacy Java 11 services when the repository script requires it.
