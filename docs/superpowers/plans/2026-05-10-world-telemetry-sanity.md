# World Telemetry Sanity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a local telemetry sanity gate to world auto-merge.

**Architecture:** Keep telemetry logic in a focused script, `scripts/check-telemetry.ts`. The script exports a pure detector for tests and runs as a CLI that reads optional JSONL telemetry from `telemetry/events.jsonl`; the auto-merge workflow calls it before enforcing merge gates.

**Tech Stack:** Bun, TypeScript, `bun:test`, GitHub Actions YAML.

---

### Task 1: Failing Telemetry Tests

**Files:**
- Modify: `scripts/world-ops.test.ts`
- Modify: `.github/workflows/auto-merge.yml`

- [x] **Step 1: Write anomaly detector test**

Add a test that imports `detectTelemetryAnomalies`, creates 500 pull events for `domains/coding/skills/hot/SKILL.md` from five `ipHash` values inside one hour, and expects one `implausible-telemetry` anomaly.

- [x] **Step 2: Write workflow assertion**

Extend the maintenance workflow test to assert that `.github/workflows/auto-merge.yml` contains `bun run scripts/check-telemetry.ts`.

- [x] **Step 3: Verify red**

Run: `bun test scripts/world-ops.test.ts`

Expected: FAIL because `scripts/check-telemetry.ts` does not exist and the workflow does not run it.

### Task 2: Implement Telemetry Gate

**Files:**
- Create: `scripts/check-telemetry.ts`
- Modify: `.github/workflows/auto-merge.yml`

- [x] **Step 1: Add detector types and defaults**

Create `TelemetryEvent`, `TelemetryAnomaly`, `TelemetrySanityOptions`, and defaults for `windowMinutes: 60`, `minEvents: 500`, and `maxDistinctSources: 5`.

- [x] **Step 2: Implement `detectTelemetryAnomalies`**

Group valid `pull` and `use` events by artifact, slide a one-hour window across sorted timestamps, and return an anomaly when the window contains at least 500 events from at most 5 distinct source keys.

- [x] **Step 3: Implement CLI**

When run directly, read `telemetry/events.jsonl` if it exists. Print `No telemetry events to check.` and exit 0 when absent. Print JSON anomalies and exit 1 when anomalies are detected.

- [x] **Step 4: Wire workflow**

Add `bun run scripts/check-telemetry.ts` before `bun run scripts/enforce-auto-merge.ts` in `.github/workflows/auto-merge.yml`.

### Task 3: Verify and Commit

- [x] **Step 1: Verify focused tests**

Run: `bun test scripts/world-ops.test.ts`

Expected: PASS.

- [x] **Step 2: Run world gates**

Run lint, typecheck, test, build, and `git diff --check` in `the-world`.

- [x] **Step 3: Update audit**

Record telemetry sanity coverage in the active completion audit.

- [x] **Step 4: Commit**

Commit world changes with `git commit -m "feat(trust): flag telemetry anomalies"`.

## Self-Review

- Spec coverage: telemetry threshold, source-key privacy, CLI behavior, workflow wiring, and tests are covered.
- Placeholder scan: no TBD/TODO language.
- Type consistency: detector exports are named from the plan and can be imported by `scripts/world-ops.test.ts`.
