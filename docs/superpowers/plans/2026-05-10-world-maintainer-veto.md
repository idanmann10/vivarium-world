# World Maintainer Veto Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a local maintainer veto-window gate to world auto-merge.

**Architecture:** Keep veto logic in `scripts/check-veto-window.ts`. The script exports a pure evaluator for tests and runs as a CLI using GitHub Actions pull-request environment data; the auto-merge workflow calls it before final merge enforcement.

**Tech Stack:** Bun, TypeScript, `bun:test`, GitHub Actions YAML.

---

### Task 1: Failing Veto Tests

**Files:**
- Modify: `scripts/world-ops.test.ts`
- Modify: `.github/workflows/auto-merge.yml`

- [x] **Step 1: Add evaluator tests**

Assert that a PR created less than 48 hours ago is held, a PR older than 48 hours is allowed, and a `maintainer-veto` label is held.

- [x] **Step 2: Add workflow assertion**

Assert that `.github/workflows/auto-merge.yml` contains `bun run scripts/check-veto-window.ts`.

- [x] **Step 3: Verify red**

Run: `bun test scripts/world-ops.test.ts`

Expected: FAIL because the veto-window script and workflow step do not exist.

### Task 2: Implement Veto Gate

**Files:**
- Create: `scripts/check-veto-window.ts`
- Modify: `.github/workflows/auto-merge.yml`

- [x] **Step 1: Add result type and evaluator**

Add `MaintainerVetoInput`, `MaintainerVetoResult`, and `evaluateMaintainerVetoWindow`.

- [x] **Step 2: Implement CLI parsing**

Read `WORLD_PR_CREATED_AT`, `WORLD_PR_LABELS_JSON`, `WORLD_VETO_NOW`, and `WORLD_VETO_WINDOW_HOURS`. Skip cleanly when no PR timestamp is available.

- [x] **Step 3: Wire workflow**

Run the veto script before `scripts/enforce-auto-merge.ts`, passing PR creation time and labels from the pull-request event.

### Task 3: Verify and Commit

- [x] **Step 1: Verify focused tests**

Run: `bun test scripts/world-ops.test.ts`

Expected: PASS.

- [x] **Step 2: Run world gates**

Run lint, typecheck, test, build, and `git diff --check` in `the-world`.

- [x] **Step 3: Update audit**

Record maintainer veto-window coverage in the active completion audit.

- [x] **Step 4: Commit**

Commit with `git commit -m "feat(trust): add maintainer veto window"`.

## Self-Review

- Spec coverage: 48-hour window, veto label, workflow wiring, and tests are covered.
- Placeholder scan: no TBD/TODO language.
- Type consistency: exported evaluator names match the tests and CLI.
