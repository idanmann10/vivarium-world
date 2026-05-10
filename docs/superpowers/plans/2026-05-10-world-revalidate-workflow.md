# World Revalidate Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `revalidate.yml` run the concrete world health checks expected by the roadmap.

**Architecture:** Keep the workflow thin and script-driven. It will call existing validators and tests rather than adding a new TypeScript script.

**Tech Stack:** GitHub Actions YAML, Bun, TypeScript tests.

---

### Task 1: Failing Workflow Test

**Files:**
- Modify: `scripts/world-ops.test.ts`

- [x] **Step 1: Add revalidate workflow assertions**

Read `.github/workflows/revalidate.yml` inside the existing maintenance workflow test and assert it runs `bun run typecheck`, `bun run scripts/validate-skill.ts`, `bun run scripts/validate-trace.ts`, `bun run scripts/validate-run.ts`, `bun run scripts/rebuild-contributors.ts`, `bun run scripts/compute-stats.ts`, and `bun test scripts`.

- [x] **Step 2: Verify red**

Run: `bun test scripts/world-ops.test.ts`

Expected: FAIL because `revalidate.yml` currently only runs lint.

### Task 2: Update Revalidate Workflow

**Files:**
- Modify: `.github/workflows/revalidate.yml`

- [x] **Step 1: Add concrete checks**

After install and lint, add typecheck, skill validation, trace validation, run validation, contributor rebuild, stats rebuild, and script tests.

- [x] **Step 2: Verify focused tests**

Run: `bun test scripts/world-ops.test.ts`

Expected: PASS.

### Task 3: Verify and Commit

- [x] **Step 1: Run world gates**

Run lint, typecheck, test, build, and `git diff --check` in `the-world`.

- [x] **Step 2: Update audit**

Record concrete revalidation workflow coverage in the active completion audit.

- [x] **Step 3: Commit**

Commit world changes with `git commit -m "feat(workflows): revalidate world content"`.

## Self-Review

- Spec coverage: manual trigger, script-driven validation, stats consistency, and tests are covered.
- Placeholder scan: no TBD/TODO language.
- Type consistency: workflow command names match existing package scripts and validator files.
