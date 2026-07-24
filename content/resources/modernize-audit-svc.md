# Migration plan: `audit-svc` from Spring Boot 2.7.18 / Java 11 to Spring Boot 3.5.3 / Java 21

## 1. Executive summary

`audit-svc` is a small, append-only audit-log microservice [pinned to Spring Boot 2.7.18 / Java 11][pom-audit-L8], while its sibling [`workforce-svc` already runs on Spring Boot 3.5.3 / Java 21][pom-wf]. It uses only `spring-boot-starter-web`, `spring-boot-starter-jdbc`, raw `JdbcTemplate`, and `sqlite-jdbc` — [no JPA, no Hibernate, and no `javax.*` application imports][pom-audit-L22] — so the dependency surface of this migration is unusually narrow. The mandatory changes are small: two edits in `pom.xml` and one in `package.json`, on top of a baseline test suite added first. The plan isolates the work into sequential phases — baseline safety net, toolchain alignment, framework bump, and stabilization — so each phase can be verified and rolled back independently.

## 2. Current state vs. target state

| Dimension | Current (`audit-svc`) | Target | Source |
|---|---|---|---|
| Spring Boot parent | `2.7.18` | `3.5.3` | [pom.xml L8][pom-audit-L8] → [workforce pom][pom-wf] |
| Java source/target | `11` | `21` | [pom.xml L19][pom-audit-L19] |
| Local launcher | `scripts/with-java11 mvn …` | plain `mvn …` | [package.json L11][pkg-L11] |
| Persistence | Raw `JdbcTemplate` + SQLite | unchanged | [AuditRepository.java][repo-audit] |
| `javax.*` imports | None | N/A — no changes needed | all four `.java` files |
| Tests | None | Baseline suite before migration | — |

## 3. Scope and key decisions

### In scope

- Bump the Spring Boot parent from `2.7.18` to `3.5.3` and Java from `11` to `21`.
- Align the toolchain references (`package.json` launcher, IDE metadata) with the new runtime.
- Add a baseline test suite *before* any framework change, so regressions are detectable.

### Explicitly out of scope

| Out-of-scope item | Rationale |
|---|---|
| Adding Spring Data JPA / Hibernate | `audit-svc` uses raw `JdbcTemplate`, which is fully supported under [Spring Framework 6.2 / Boot 3.5][jdbctemplate]. JPA would add an ORM layer, schema-management risk, and dialect pinning to a service that runs three simple SQL statements. See the optional follow-on. |
| Copying `workforce-svc` JPA dependencies | `workforce-svc` carries `spring-boot-starter-data-jpa`, `hibernate-community-dialects`, and `spring.jpa.*` properties. Those are workforce-specific and must not be introduced into `audit-svc`. |
| Fixing the intentional SQL injection | [`AuditRepository.search()`][repo-audit] carries a documented course-exercise comment. That is a separate educational concern, unrelated to the platform migration, and should be tracked as its own issue. |
| Mandating a Hikari `maximum-pool-size=1` | SQLite's single-writer model and connection-scoped `last_insert_rowid()` are pre-existing realities. Pool hardening reduces write throughput, so it belongs in Phase 4 as a separately validated option. |

### Why no `javax` → `jakarta` source changes are needed

[Jakarta EE 9 renamed the `javax.*` packages][jakarta-ee-9] (for example `javax.persistence` → `jakarta.persistence`, `javax.servlet` → `jakarta.servlet`), and [Spring Boot 3.0 pulls in those Jakarta EE 9+ artifacts][boot3-migration]. However, `javax.sql` is part of the **Java SE** standard library, not Jakarta EE, and has never been renamed — it remains `javax.sql` in Java 21. A scan of all four `audit-svc` source files confirms zero `javax.*` imports: they use only `org.springframework.*` and `java.util.*`. No application source file requires modification for the namespace change.

### Direct version jump is appropriate

The [Spring Boot migration guidance][boot-upgrading] is to start from the latest 2.7.x before upgrading to 3.x. `audit-svc` is already on `2.7.18`, the final 2.7.x maintenance release, so a direct jump to `3.5.3` — the version `workforce-svc` already runs — keeps both services on a single, supported baseline. The phases below still isolate the Java/toolchain change from the framework bump so each step is independently verifiable.

## 4. Phased migration plan

### Phase 0 — Baseline safety net (no functional changes)

**Goal:** establish tests and confirm the service compiles and runs on Java 11 / Boot 2.7.18 before anything touches the runtime. Without tests, any regression during the migration is invisible, and the service currently has none.

1. Add `spring-boot-starter-test` to `services/audit-svc/pom.xml` inside `<dependencies>`. It comes from the Boot parent BOM, needs no explicit version, and brings JUnit 5, AssertJ, Mockito, MockMvc, and `@SpringBootTest`:

    ```xml
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
    ```

2. Create `src/test/java/com/contoso/audit/` with tests covering these contracts (exact content is your choice):

    | Test class | What it verifies |
    |---|---|
    | `AuditApplicationTests` | `@SpringBootTest` context loads without errors |
    | `AuditControllerTest` | `GET /health` → 200, body `{"status":"ok","service":"audit-svc"}`; `POST /events` with a valid body → 200 with a numeric `id`; `GET /events` → 200 returning a JSON array |
    | `AuditRepositoryTest` | `insert(...)` persists a row and returns a positive `id`; `recent(n)` returns ≤ n rows; `search("assign")` returns matching rows |
    | `DataInitTest` | running schema init twice does not throw and does not duplicate seed rows (idempotency) |

    Point the tests at an isolated SQLite database (`jdbc:sqlite::memory:` or a temp-file URL) so they never touch production data.

3. Validate on the current stack, still Java 11 / Boot 2.7.18, and record the pass counts:

    ```bash
    cd services/audit-svc && mvn verify
    ```

**Exit criteria:** proceed only when `mvn verify` passes cleanly. Do not start Phase 1 with failing tests — pre-existing failures would mask migration regressions.

### Phase 1 — Java 21 and toolchain alignment (Boot stays 2.7.18)

**Goal:** switch the local JDK and every toolchain reference to Java 21 while keeping Spring Boot at 2.7.18, so the Java change is independently verifiable. Running Boot 2.7.18 on Java 21 is an intentionally *brief*, transitional step — validate quickly and move straight to Phase 2, where the framework bump puts the service on a combination Spring fully supports.

1. In [`services/audit-svc/pom.xml` L19][pom-audit-L19], change `<java.version>11</java.version>` to `<java.version>21</java.version>`. The `<parent>` block stays `2.7.18` for now.

2. In [`package.json` L11][pkg-L11], remove the `../../scripts/with-java11` wrapper from the `dev:audit` script so it runs `mvn` directly, matching `dev:workforce`. Leave `dev:auth` (L12) untouched — `auth-svc` still needs the Java 11 shim, and the devcontainer still installs both JDKs.

3. Optionally, update the IDE metadata the language server generates so it stops flagging false Java 21 errors. These files aren't committed — the language server creates them locally when it imports the project — so edit them only if you see stale errors: in `services/audit-svc/.settings/org.eclipse.jdt.core.prefs`, set the three compiler values to `21`, and in `services/audit-svc/.classpath`, change the JRE container from `JavaSE-11` to `JavaSE-21`:

    ```properties
    org.eclipse.jdt.core.compiler.codegen.targetPlatform=21
    org.eclipse.jdt.core.compiler.compliance=21
    org.eclipse.jdt.core.compiler.source=21
    ```

4. Confirm `java -version` reports a 21.x JDK, then validate:

    ```bash
    cd services/audit-svc && mvn verify
    ```

**Exit criteria:** proceed when the Phase 0 tests still pass under Java 21. If Boot 2.7.18 on Java 21 throws fatal startup errors, document them and move to Phase 2 immediately — the Boot 3 bump resolves them. The `package.json` change is safe regardless and need not be reverted.

### Phase 2 — Spring Boot parent bump to 3.5.3 (core phase)

**Goal:** bump the Spring Boot parent to `3.5.3`, confirm dependencies resolve, verify no `javax`→`jakarta` renames are needed, and run the full suite.

1. In [`services/audit-svc/pom.xml`][pom-audit-L8], change the parent `<version>` from `2.7.18` to `3.5.3`:

    ```xml
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.5.3</version>
        <relativePath/>
    </parent>
    ```

    That is the only required `pom.xml` change beyond the `java.version` already set in Phase 1. The three existing dependencies (`spring-boot-starter-web`, `spring-boot-starter-jdbc`, `sqlite-jdbc 3.45.3.0`) all work under Boot 3.5 — `workforce-svc` uses the same `sqlite-jdbc` version.

2. Optionally add `spring-boot-properties-migrator` (runtime scope) for this phase only, to catch any [renamed configuration keys][boot-upgrading], then remove it before committing. `audit-svc`'s `application.properties` has only three stable keys (`server.port`, `spring.datasource.url`, `spring.datasource.driver-class-name`), none renamed between Boot 2.7 and 3.5, so the migrator is a safety net rather than a necessity.

3. Confirm the Jakarta review needs no code changes: all four source files import only `org.springframework.*` and `java.util.*`, and the one JDBC-adjacent type (`javax.sql.DataSource`, injected by auto-configuration) is Java SE and unchanged in Java 21.

4. Do **not** copy `workforce-svc`'s JPA dependencies (`spring-boot-starter-data-jpa`, `hibernate-community-dialects`, `spring-boot-starter-validation`) or its `spring.jpa.*` properties — they are irrelevant to `audit-svc` and must stay absent.

5. Validate:

    ```bash
    cd services/audit-svc
    mvn dependency:tree   # confirm no resolution failures
    mvn verify            # compile + all baseline tests pass
    ```

**Exit criteria:** proceed only when `mvn verify` is fully green with the same test count as Phase 0/1. Any failure here is directly attributable to the Boot 2.7 → 3.5 delta. Rollback is a single revert of the parent version.

### Phase 3 — Stabilization

**Goal:** post-migration cleanup and optional hardening.

1. Remove `spring-boot-properties-migrator` if it was added in Phase 2 — it is not safe to ship.
2. Evaluate SQLite concurrency only if load testing shows it: `last_insert_rowid()` is connection-scoped, so under a multi-connection pool concurrent `POST /events` requests can read the wrong id. If confirmed, either set `spring.datasource.hikari.maximum-pool-size=1` (serializes writes, lowers throughput) or wrap the insert and id read in a single-connection block. This is not a required consequence of the Boot 3 upgrade.
3. Add a minimal CI workflow running `mvn verify` on Java 21 so the modern stack stays green:

    ```yaml
    name: audit-svc CI
    on: [push, pull_request]
    jobs:
      build:
        runs-on: ubuntu-latest
        steps:
          - uses: actions/checkout@v4
          - uses: actions/setup-java@v4
            with: { java-version: '21', distribution: 'temurin' }
          - run: mvn -B verify
            working-directory: services/audit-svc
    ```

### Optional follow-on: Spring Data JPA (not required)

If a future decision moves `audit-svc` from `JdbcTemplate` to Spring Data JPA for consistency with `workforce-svc`, treat it as a **separate project on its own branch**: add the JPA and dialect dependencies, model an `AuditEvent` `@Entity` and a `JpaRepository`, rewrite `AuditRepository`/`DataInit` and all tests, and add `spring.jpa.*` properties. It changes schema management and connection handling and risks data-type mapping issues, and the [Boot 3.0 guide][boot3-migration] specifically warns about Hibernate 6 behavioral changes. It does not belong in this framework bump.

## 5. Exact file change matrix

| File | Phase | Change | Before | After |
|---|---|---|---|---|
| [`audit-svc/pom.xml` L19][pom-audit-L19] | 1 | Edit | `<java.version>11</java.version>` | `<java.version>21</java.version>` |
| [`audit-svc/pom.xml` L8][pom-audit-L8] | 2 | Edit | `<version>2.7.18</version>` | `<version>3.5.3</version>` |
| [`audit-svc/pom.xml` L22–36][pom-audit-L22] | 0 | Add | *(no test dep)* | `spring-boot-starter-test` (`test` scope) |
| [`package.json` L11][pkg-L11] | 1 | Edit | `../../scripts/with-java11 mvn …` | `mvn …` (drop wrapper) |
| `services/auth-svc/*` | — | No change | `with-java11` still needed | left as-is |
| `audit-svc/src/**/*.java` | — | No change | zero `javax` imports | no changes needed |
| `audit-svc/.../application.properties` | — | No change | 3 stable keys | no changes needed |

## 6. Risk register

| ID | Risk | Likelihood | Impact | Phase | Mitigation |
|---|---|---|---|---|---|
| R1 | No existing tests — regressions invisible | High (confirmed) | High | Pre-0 | Add the baseline suite in Phase 0 before any change |
| R2 | Boot 2.7.18 on Java 21 is transitional | Medium | Medium | 1 | Keep Phase 1 brief; proceed to Phase 2 |
| R3 | IDE shows false Java 11 errors after the pom change | Medium | Low | 1 | Update the locally generated `.classpath`/`.settings` |
| R4 | `with-java11` still needed by `auth-svc` | Medium | High if broken | 1 | Do not touch `dev:auth` in `package.json` |
| R5 | Boot 3 / Jakarta dependency incompatibility | Low (small tree) | High | 2 | `mvn dependency:tree`; properties migrator; [migration guide][boot3-migration] |
| R6 | Transitive dependency pulls a `javax.*` artifact | Low | Medium | 2 | `mvn dependency:tree` and inspect |
| R7 | `last_insert_rowid()` wrong under concurrency | Medium (pre-existing) | Medium | 3 | Load test; pool-size=1 or single-connection wrapper |
| R8 | SQL injection in `search()` | High (intentional) | High | Out of scope | Track as a separate issue; keep it out of the migration |
| R9 | Scope creep into `workforce-svc` JPA | Medium | High | All | Scope boundary above explicitly excludes JPA |

## 7. Validation checklist

**Phase 0 — baseline**

- [ ] `spring-boot-starter-test` added to `pom.xml`
- [ ] Context-load, controller, repository, and idempotency tests written
- [ ] `mvn verify` passes on Java 11 / Boot 2.7.18

**Phase 1 — toolchain**

- [ ] `pom.xml` `java.version` set to `21`
- [ ] `package.json` `dev:audit` no longer invokes `with-java11`
- [ ] *(optional)* locally generated `.settings`/`.classpath` set to Java 21
- [ ] `mvn verify` passes on Java 21 / Boot 2.7.18

**Phase 2 — framework**

- [ ] `pom.xml` parent set to `3.5.3`
- [ ] `mvn dependency:tree` shows no resolution failures
- [ ] `mvn verify` — all baseline tests pass on Java 21 / Boot 3.5.3
- [ ] Endpoints respond: `GET /health`, `POST /events`, `GET /events`

**Phase 3 — stabilization**

- [ ] `spring-boot-properties-migrator` removed if it was added
- [ ] SQLite pool behavior evaluated and the decision documented
- [ ] CI workflow added and passing on Java 21

## Sources

[pom-audit-L8]: https://github.com/GeekTrainer/legacy-app/blob/3689288d1f5a9ed6871db94a09c2e651bc20af3e/services/audit-svc/pom.xml#L8
[pom-audit-L19]: https://github.com/GeekTrainer/legacy-app/blob/3689288d1f5a9ed6871db94a09c2e651bc20af3e/services/audit-svc/pom.xml#L19
[pom-audit-L22]: https://github.com/GeekTrainer/legacy-app/blob/3689288d1f5a9ed6871db94a09c2e651bc20af3e/services/audit-svc/pom.xml#L22-L36
[pom-wf]: https://github.com/GeekTrainer/legacy-app/blob/3689288d1f5a9ed6871db94a09c2e651bc20af3e/services/workforce-svc/pom.xml#L7-L21
[pkg-L11]: https://github.com/GeekTrainer/legacy-app/blob/3689288d1f5a9ed6871db94a09c2e651bc20af3e/package.json#L11
[repo-audit]: https://github.com/GeekTrainer/legacy-app/blob/3689288d1f5a9ed6871db94a09c2e651bc20af3e/services/audit-svc/src/main/java/com/contoso/audit/AuditRepository.java
[boot3-migration]: https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-3.0-Migration-Guide
[boot-upgrading]: https://docs.spring.io/spring-boot/upgrading.html
[jakarta-ee-9]: https://jakartaee.github.io/platform/jakartaee9/JakartaEE9ReleasePlan
[jdbctemplate]: https://docs.spring.io/spring-framework/reference/data-access/jdbc/core.html
