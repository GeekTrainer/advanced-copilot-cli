#!/usr/bin/env bash
# Do NOT use set -e; test failures must still emit JSON for the harness.

INPUT=$(cat)
ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)

changed_files() {
  { git diff --name-only HEAD 2>/dev/null; git ls-files --others --exclude-standard 2>/dev/null; } | sort -u
}

normalize_path() {
  local FILE="$1"
  FILE="${FILE#"$ROOT"/}"
  FILE="${FILE#"$PWD"/}"
  FILE="${FILE#./}"
  printf '%s\n' "$FILE"
}

stack_for_file() {
  case "$1" in
    services/assets-svc/*.cs) echo dotnet ;;
    services/workforce-svc/*.java|services/workforce-svc/pom.xml) echo java ;;
    services/reporting-svc/*.py|services/reporting-svc/pyproject.toml) echo python ;;
    services/web/*.astro|services/web/*.ts|services/web/*.tsx|tests/playwright/*.ts|playwright.config.ts|package.json|package-lock.json) echo playwright ;;
  esac
}

run_stack() {
  case "$1" in
    dotnet) NAME=".NET"; COMMAND="dotnet test services/assets-svc/Tests/AssetsService.Tests.csproj" ;;
    java) NAME="Java"; COMMAND="cd services/workforce-svc && mvn test --no-transfer-progress" ;;
    python) NAME="Python"; COMMAND="cd services/reporting-svc && pytest" ;;
    playwright) NAME="Web / Playwright"; COMMAND="npm run test:e2e" ;;
    *) return 0 ;;
  esac

  OUTPUT=$(bash -c "$COMMAND" 2>&1)
  STATUS=$?
  TAIL=$(printf '%s\n' "$OUTPUT" | tail -40)
  printf -v RUN_RESULT 'Stack: %s\nCommand: %s\nExit code: %s\n%s' "$NAME" "$COMMAND" "$STATUS" "$TAIL"
  return "$STATUS"
}

post_tool_use() {
  FILE=$(printf '%s\n' "$INPUT" | jq -r '.toolArgs.path // .toolArgs.filePath // empty')
  FILE=$(normalize_path "$FILE")
  STACK=$(stack_for_file "$FILE")
  [[ -z "$FILE" || -z "$STACK" ]] && echo '{}' && exit 0

  if run_stack "$STACK"; then
    STATUS_TEXT="passed"
  else
    STATUS_TEXT="failed"
  fi

  printf -v CTX 'Hook check for %s %s.\n%s' "$FILE" "$STATUS_TEXT" "$RUN_RESULT"
  jq -n --arg ctx "$CTX" '{"additionalContext": $ctx}'
}

agent_stop() {
  STACKS=""
  while IFS= read -r FILE; do
    STACK=$(stack_for_file "$FILE")
    [[ -n "$STACK" && " $STACKS " != *" $STACK "* ]] && STACKS="$STACKS $STACK"
  done < <(changed_files)

  [[ -z "$STACKS" ]] && echo '{"decision":"allow"}' && exit 0

  FAILURES=""
  for STACK in $STACKS; do
    if ! run_stack "$STACK"; then
      FAILURES="$FAILURES"$'\n\n'"$RUN_RESULT"
    fi
  done

  if [[ -n "$FAILURES" ]]; then
    jq -n --arg reason "Tests are failing. Fix the failure before finishing this turn:$FAILURES" '{"decision":"block","reason":$reason}'
  else
    echo '{"decision":"allow"}'
  fi
}

if printf '%s\n' "$INPUT" | jq -e 'has("toolArgs")' >/dev/null 2>&1; then
  post_tool_use
else
  agent_stop
fi
