# Migration plan: `audit-svc` from Spring Boot 3.5.16 / Java 17 to Spring Boot 4.1 / Java 21

<!-- reconcile exact version with delta_06 build: the precise Spring Boot 4.1 patch, the resolved Jackson 3 version, and the fate of the Jackson 2 / Log4j2 currency pins are finalized by the legacy-app delta_06 rewrite build; floors below are known-good, pin the exact values once that build lands -->

## 1. Executive summary

`audit-svc` is a small, append-only audit-log microservice [currently on Spring Boot 3.5.16 / Java 17][pom-audit-L8], a generation behind the current supported line, [Spring Boot 4.1 / Java 21 (Spring Framework 7)][spring-boot-4-migration]. Its sibling [`workforce-svc` already runs on Java 21][pom-wf], so the runtime jump is well-trodden; the Spring Boot 4 major is the new work. The service uses only `spring-boot-starter-web`, `spring-boot-starter-jdbc`, raw `JdbcTemplate`, and `sqlite-jdbc` — [no JPA, no Hibernate, no `javax.*` imports, and no direct Jackson or JJWT usage][pom-audit-L25] — so this is the mechanical, low-risk service to modernize first. The mandatory changes are small: two edits in `pom.xml` plus a review of the existing currency pins, on top of a baseline test suite added first. The one shift that isn't a version number is that Spring Boot 4 defaults to [Jackson 3][jackson-3] and no longer manages Jackson 2, so the service's JSON serialization moves onto the Jackson 3 line; because `audit-svc` never touches Jackson types directly, that change is transparent to its code but must be verified. A hard organizational constraint frames the whole upgrade: no phase may introduce a known-vulnerable dependency.

## 2. Current state vs. target state

| Dimension | Current (`audit-svc`) | Target | Source |
|---|---|---|---|
| Spring Boot parent | `3.5.16` | `4.1.x` (latest) | [pom.xml L8][pom-audit-L8] → [migration guide][spring-boot-4-migration] |
| Spring Framework | `6.2` | `7.0` | [Spring Framework 7 reference][spring-framework-7] |
| Java source/target | `17` | `21` | [pom.xml L19][pom-audit-L19] |
| JSON binding | Jackson 2 (BOM-pinned `2.22.2`) | Jackson 3 (Boot 4 default) | [pom.xml L21][pom-audit-L21] → [Jackson 3][jackson-3] |
| Currency pins | `jackson-bom 2.22.2`, `log4j2 2.25.5` | review under Boot 4 | [pom.xml L21–22][pom-audit-L21] |
| Persistence | Raw `JdbcTemplate` + SQLite | unchanged | [AuditRepository.java][repo-audit] |
| `javax.*` / Jackson / JJWT imports | None | N/A — no changes needed | all four `.java` files |
| Tests | None | Baseline suite before migration | — |

## 3. Scope and key decisions

### In scope

- Bump the Spring Boot parent from `3.5.16` to the latest `4.1.x` and Java from `17` to `21`.
- Reconcile the Jackson 2 → Jackson 3 default: confirm Boot 4 resolves a CVE-clean Jackson 3 (`≥ 3.1.5`) for the service's JSON, and review whether the `jackson-bom` and `log4j2` currency pins are still needed, need updating, or should be removed now that Boot 4 manages a different baseline.
- Align the toolchain references (IDE metadata) with the new runtime.
- Add a baseline test suite *before* any framework change, so regressions are detectable.

### Explicitly out of scope

| Out-of-scope item | Rationale |
|---|---|
| Adding Spring Data JPA / Hibernate | `audit-svc` uses raw `JdbcTemplate`, which is fully supported under [Spring Framework 7 / Boot 4][jdbctemplate]. JPA would add an ORM layer, schema-management risk, and dialect pinning to a service that runs three simple SQL statements. See the optional follow-on. |
| Copying `workforce-svc` JPA dependencies | `workforce-svc` carries `spring-boot-starter-data-jpa`, `hibernate-community-dialects`, and `spring.jpa.*` properties. Those are workforce-specific and must not be introduced into `audit-svc`. |
| Fixing the intentional SQL injection | [`AuditRepository.search()`][repo-audit] carries a documented course-exercise comment. That is a separate educational concern, unrelated to the platform migration, and should be tracked as its own issue. |
| Mandating a Hikari `maximum-pool-size=1` | SQLite's single-writer model and connection-scoped `last_insert_rowid()` are pre-existing realities. Pool hardening reduces write throughput, so it belongs in Phase 4 as a separately validated option. |

### Why this service is the mechanical one

`audit-svc` is the deliberate "easy first" service because its dependency surface barely reacts to the upgrade. A scan of all four source files (`AuditApplication`, `AuditController`, `AuditRepository`, `DataInit`) confirms they import only `org.springframework.*` and `java.util.*`: zero `javax.*` imports, no direct Jackson types, and no JJWT. There is no `javax` → `jakarta` rename to make — the whole baseline is already on Jakarta — and no third-party serializer dragging a transitive Jackson 2 into the tree. The one indirect exposure is JSON serialization through `spring-boot-starter-web`, which Boot 4 moves from Jackson 2 to Jackson 3 for you; since the controller returns plain records and maps, that transition needs verification, not code changes. The substantive dependency-security work — a `jjwt` serializer that pulls a vulnerable Jackson 2 under Boot 4 — lives in the sibling `auth-svc`, not here.

### Direct version jump is appropriate

The [Spring Boot migration guidance][spring-boot-4-migration] is to be on the latest 3.5.x before upgrading to 4.x. `audit-svc` is already on `3.5.16`, a current 3.5 maintenance release, so a direct jump to the latest `4.1.x` keeps the service on a single, supported baseline. The phases below still isolate the Java/toolchain change from the framework bump so each step is independently verifiable.

## 4. Phased migration plan

### Phase 0 — Baseline safety net (no functional changes)

**Goal:** establish tests and confirm the service compiles and runs on Java 17 / Boot 3.5.16 before anything touches the runtime. Without tests, any regression during the migration is invisible, and the service currently has none.

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

3. Validate on the current stack, still Java 17 / Boot 3.5.16, and record the pass counts:

    ```bash
    cd services/audit-svc && mvn verify
    ```

**Exit criteria:** proceed only when `mvn verify` passes cleanly. Do not start Phase 1 with failing tests — pre-existing failures would mask migration regressions.

### Phase 1 — Java 21 and toolchain alignment (Boot stays 3.5.16)

**Goal:** switch the local JDK and every toolchain reference to Java 21 while keeping Spring Boot at 3.5.16, so the Java change is independently verifiable. Running Boot 3.5.16 on Java 21 is fully supported, so this step can be validated at leisure before the framework bump.

1. In [`services/audit-svc/pom.xml` L19][pom-audit-L19], change `<java.version>17</java.version>` to `<java.version>21</java.version>`. The `<parent>` block stays `3.5.16` for now.

2. Optionally, update the IDE metadata the language server generates so it stops flagging false Java 21 errors. These files aren't committed — the language server creates them locally when it imports the project — so edit them only if you see stale errors: in `services/audit-svc/.settings/org.eclipse.jdt.core.prefs`, set the three compiler values to `21`, and in `services/audit-svc/.classpath`, change the JRE container from `JavaSE-17` to `JavaSE-21`:

    ```properties
    org.eclipse.jdt.core.compiler.codegen.targetPlatform=21
    org.eclipse.jdt.core.compiler.compliance=21
    org.eclipse.jdt.core.compiler.source=21
    ```

3. Confirm `java -version` reports a 21.x JDK, then validate:

    ```bash
    cd services/audit-svc && mvn verify
    ```

**Exit criteria:** proceed when the Phase 0 tests still pass under Java 21 on Boot 3.5.16. Boot 3.5 on Java 21 is a supported combination `workforce-svc` already runs, so this phase should be green with no code changes.

### Phase 2 — Spring Boot parent bump to 4.1.x (core phase)

**Goal:** bump the Spring Boot parent to the latest `4.1.x`, confirm dependencies resolve, reconcile the Jackson 3 default and the currency pins, and run the full suite.

1. In [`services/audit-svc/pom.xml`][pom-audit-L8], change the parent `<version>` from `3.5.16` to the latest `4.1.x`:

    ```xml
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>4.1.0</version>
        <relativePath/>
    </parent>
    ```

    <!-- reconcile exact version with delta_06 build: replace 4.1.0 with the exact 4.1.x patch the rewrite build validates -->

    That plus the `java.version` already set in Phase 1 are the core edits. The three application dependencies (`spring-boot-starter-web`, `spring-boot-starter-jdbc`, `sqlite-jdbc 3.45.3.0`) all work under Boot 4.

2. Reconcile the Jackson change. Spring Boot 4 defaults to [Jackson 3][jackson-3] (the `tools.jackson` namespace) and no longer manages Jackson 2, so the [`jackson-bom` pin at L21][pom-audit-L21] no longer governs the JSON path the way it did on Boot 3.5. Confirm Boot 4 resolves a CVE-clean Jackson 3 (`≥ 3.1.5`) via `mvn dependency:tree`, then decide the pin's fate: remove it if nothing in the tree still needs Jackson 2, or update it if a transitive still resolves a Jackson 2 that must stay clean. Apply the same review to the [`log4j2` pin at L22][pom-audit-L21] against Boot 4's managed Log4j2 version.

    <!-- reconcile exact version with delta_06 build: confirm the resolved Jackson 3 version and whether the jackson-bom / log4j2 pins are dropped or updated -->

3. Optionally add `spring-boot-properties-migrator` (runtime scope) for this phase only, to catch any [renamed configuration keys][spring-boot-4-migration], then remove it before committing. `audit-svc`'s `application.properties` has only three stable keys (`server.port`, `spring.datasource.url`, `spring.datasource.driver-class-name`), so the migrator is a safety net rather than a necessity.

4. Confirm no application code changes are needed: all four source files import only `org.springframework.*` and `java.util.*`, none reference a Jackson type directly, and the controller returns plain records and maps that Jackson 3 serializes the same way.

5. Do **not** copy `workforce-svc`'s JPA dependencies (`spring-boot-starter-data-jpa`, `hibernate-community-dialects`, `spring-boot-starter-validation`) or its `spring.jpa.*` properties — they are irrelevant to `audit-svc` and must stay absent.

6. Validate:

    ```bash
    cd services/audit-svc
    mvn dependency:tree   # confirm resolution + a CVE-clean Jackson 3
    mvn verify            # compile + all baseline tests pass
    ```

**Exit criteria:** proceed only when `mvn verify` is fully green with the same test count as Phase 0/1 and `mvn dependency:tree` shows no known-vulnerable package. Any failure here is directly attributable to the Boot 3.5 → 4.1 delta. Rollback is a single revert of the parent version.

### Phase 3 — Stabilization and optional Java 21 modernization

**Goal:** post-migration cleanup, optional hardening, and — because the framework work is so light here — an optional pass that puts Java 21 to use.

1. Remove `spring-boot-properties-migrator` if it was added in Phase 2 — it is not safe to ship.
2. Evaluate SQLite concurrency only if load testing shows it: `last_insert_rowid()` is connection-scoped, so under a multi-connection pool concurrent `POST /events` requests can read the wrong id. If confirmed, either set `spring.datasource.hikari.maximum-pool-size=1` (serializes writes, lowers throughput) or wrap the insert and id read in a single-connection block. This is not a required consequence of the Boot 4 upgrade.
3. *(Optional)* Exercise Java 21 now that the service targets it. Because the framework bump was mechanical, this is where `audit-svc` earns some substance: model the audit event as a `record` DTO, use pattern matching or sequenced collections where they simplify the repository code, or note that Spring MVC on virtual threads (`spring.threads.virtual.enabled=true`) is available under Java 21 for I/O-bound request handling. Keep each change behind the same green test suite.
4. Add a minimal CI workflow running `mvn verify` on Java 21 so the modern stack stays green:

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

If a future decision moves `audit-svc` from `JdbcTemplate` to Spring Data JPA for consistency with `workforce-svc`, treat it as a **separate project on its own branch**: add the JPA and dialect dependencies, model an `AuditEvent` `@Entity` and a `JpaRepository`, rewrite `AuditRepository`/`DataInit` and all tests, and add `spring.jpa.*` properties. It changes schema management and connection handling and risks data-type mapping issues, and the [Boot 4 migration guide][spring-boot-4-migration] documents Hibernate behavioral changes. It does not belong in this framework bump.

## 5. Exact file change matrix

| File | Phase | Change | Before | After |
|---|---|---|---|---|
| [`audit-svc/pom.xml` L19][pom-audit-L19] | 1 | Edit | `<java.version>17</java.version>` | `<java.version>21</java.version>` |
| [`audit-svc/pom.xml` L8][pom-audit-L8] | 2 | Edit | `<version>3.5.16</version>` | `<version>4.1.x</version>` |
| [`audit-svc/pom.xml` L21–22][pom-audit-L21] | 2 | Review | `jackson-bom 2.22.2`, `log4j2 2.25.5` | drop or update under Boot 4 / Jackson 3 |
| [`audit-svc/pom.xml` L25–39][pom-audit-L25] | 0 | Add | *(no test dep)* | `spring-boot-starter-test` (`test` scope) |
| `audit-svc/src/**/*.java` | — | No change | no `javax` / Jackson / JJWT imports | no changes needed |
| `audit-svc/.../application.properties` | — | No change | 3 stable keys | no changes needed |

## 6. Risk register

| ID | Risk | Likelihood | Impact | Phase | Mitigation |
|---|---|---|---|---|---|
| R1 | No existing tests — regressions invisible | High (confirmed) | High | Pre-0 | Add the baseline suite in Phase 0 before any change |
| R2 | Boot 4 major changes a default that alters runtime behavior | Medium | High | 2 | Baseline tests + read the [Boot 4 migration guide][spring-boot-4-migration]; add shifted defaults as explicit checks |
| R3 | Jackson 3 default serializes differently than Jackson 2 | Low (plain records/maps) | Medium | 2 | Assert JSON responses in Phase 0; compare before/after |
| R4 | A transitive still resolves a vulnerable Jackson 2 after the bump | Low (no direct Jackson use) | High | 2 | `mvn dependency:tree`; drop/keep the `jackson-bom` pin accordingly |
| R5 | Currency pins (`jackson-bom`, `log4j2`) conflict with Boot 4's managed versions | Medium | Medium | 2 | Review and reconcile both pins; re-run `dependency:tree` |
| R6 | IDE shows false Java 17 errors after the pom change | Medium | Low | 1 | Update the locally generated `.classpath`/`.settings` |
| R7 | `last_insert_rowid()` wrong under concurrency | Medium (pre-existing) | Medium | 3 | Load test; pool-size=1 or single-connection wrapper |
| R8 | SQL injection in `search()` | High (intentional) | High | Out of scope | Track as a separate issue; keep it out of the migration |
| R9 | Scope creep into `workforce-svc` JPA | Medium | High | All | Scope boundary above explicitly excludes JPA |

## 7. Validation checklist

**Phase 0 — baseline**

- [ ] `spring-boot-starter-test` added to `pom.xml`
- [ ] Context-load, controller, repository, and idempotency tests written
- [ ] `mvn verify` passes on Java 17 / Boot 3.5.16

**Phase 1 — toolchain**

- [ ] `pom.xml` `java.version` set to `21`
- [ ] *(optional)* locally generated `.settings`/`.classpath` set to Java 21
- [ ] `mvn verify` passes on Java 21 / Boot 3.5.16

**Phase 2 — framework**

- [ ] `pom.xml` parent set to the latest `4.1.x`
- [ ] `mvn dependency:tree` shows no resolution failures and a CVE-clean Jackson 3
- [ ] `jackson-bom` / `log4j2` currency pins reviewed and reconciled
- [ ] `mvn verify` — all baseline tests pass on Java 21 / Boot 4.1
- [ ] Endpoints respond: `GET /health`, `POST /events`, `GET /events`

**Phase 3 — stabilization**

- [ ] `spring-boot-properties-migrator` removed if it was added
- [ ] SQLite pool behavior evaluated and the decision documented
- [ ] *(optional)* Java 21 modernization applied behind the green suite
- [ ] CI workflow added and passing on Java 21

## Sources

[pom-audit-L8]: https://github.com/GeekTrainer/legacy-app/blob/f76115331340a3bed518a232f5b62b35f11c7740/services/audit-svc/pom.xml#L8
[pom-audit-L19]: https://github.com/GeekTrainer/legacy-app/blob/f76115331340a3bed518a232f5b62b35f11c7740/services/audit-svc/pom.xml#L19
[pom-audit-L21]: https://github.com/GeekTrainer/legacy-app/blob/f76115331340a3bed518a232f5b62b35f11c7740/services/audit-svc/pom.xml#L21-L22
[pom-audit-L25]: https://github.com/GeekTrainer/legacy-app/blob/f76115331340a3bed518a232f5b62b35f11c7740/services/audit-svc/pom.xml#L25-L39
[pom-wf]: https://github.com/GeekTrainer/legacy-app/blob/f76115331340a3bed518a232f5b62b35f11c7740/services/workforce-svc/pom.xml#L7-L21
[repo-audit]: https://github.com/GeekTrainer/legacy-app/blob/f76115331340a3bed518a232f5b62b35f11c7740/services/audit-svc/src/main/java/com/contoso/audit/AuditRepository.java
[spring-boot-4-migration]: https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-4.0-Migration-Guide
[spring-framework-7]: https://docs.spring.io/spring-framework/reference/7.0/index.html
[jackson-3]: https://github.com/FasterXML/jackson#jackson-30
[jdbctemplate]: https://docs.spring.io/spring-framework/reference/data-access/jdbc/core.html
