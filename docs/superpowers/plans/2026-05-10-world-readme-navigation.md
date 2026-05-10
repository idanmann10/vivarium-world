# World README Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `README.md` provide roadmap-required navigation, featured picks, and current stats.

**Architecture:** Keep the README hand-authored, using current checked-in world content. Tests assert representative links and values from `featured/current.md` and `STATS.md`.

**Tech Stack:** Markdown, Bun, `bun:test`.

---

### Task 1: Failing README Test

**Files:**
- Modify: `scripts/world-ops.test.ts`

- [x] **Step 1: Add README assertions**

Assert that `README.md` links domains, featured, stats, contributors, proposals, retired, and workflows, and contains `coding.inspect-before-edit`, `Top 5 skill share: 100.0%`, and `Skills: 40`.

- [x] **Step 2: Verify red**

Run: `bun test scripts/world-ops.test.ts`

Expected: FAIL because the current README does not surface featured picks or stats.

### Task 2: Update README

**Files:**
- Modify: `README.md`

- [x] **Step 1: Add navigation**

Add concise links to domains, featured, stats, contributors, proposals, retired, and workflows.

- [x] **Step 2: Add current featured and stats sections**

Add current featured picks and current stats summary from checked-in `featured/current.md` and `STATS.md`.

- [x] **Step 3: Verify focused tests**

Run: `bun test scripts/world-ops.test.ts`

Expected: PASS.

### Task 3: Verify and Commit

- [x] **Step 1: Run world gates**

Run lint, typecheck, test, build, and `git diff --check` in `the-world`.

- [x] **Step 2: Update audit**

Record README navigation coverage in the active completion audit.

- [x] **Step 3: Commit**

Commit world changes with `git commit -m "docs: surface world featured stats"`.

## Self-Review

- Spec coverage: navigation, featured picks, stats, and tests are covered.
- Placeholder scan: no TBD/TODO language.
- Type consistency: test assertions use checked-in artifact names and stats values.
