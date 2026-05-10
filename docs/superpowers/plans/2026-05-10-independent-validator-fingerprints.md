# Independent Validator Fingerprints Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add independent-machine validator counting to world trust gates.

**Architecture:** Preserve aggregate trust-gate inputs for existing callers, and add optional validator vote details. When vote details are present, `canAutoMerge` uses distinct positive machine fingerprints instead of raw positive validator count.

**Tech Stack:** Bun, TypeScript, `bun:test`.

---

### Task 1: Failing Trust-Gate Test

**Files:**
- Modify: `scripts/world-ops.test.ts`

- [x] **Step 1: Write failing test**

Add a test with three positive validators where two share the same machine fingerprint. Assert independent positive count is two and auto-merge fails when three validators are required.

- [x] **Step 2: Verify red**

Run: `bun test scripts/world-ops.test.ts`

Expected: FAIL because `countIndependentPositiveValidators` does not exist.

### Task 2: Implement Independent Counting

**Files:**
- Modify: `scripts/compute-trust.ts`

- [x] **Step 1: Add vote type and counter**

Add `ValidatorVote` and `countIndependentPositiveValidators`.

- [x] **Step 2: Wire auto-merge gate**

Have `canAutoMerge` use independent positive machine count when `validatorVotes` are provided.

- [x] **Step 3: Verify targeted tests**

Run: `bun test scripts/world-ops.test.ts`

Expected: PASS.

### Task 3: Verify and Commit

- [x] **Step 1: Run full world gates**

Run lint, typecheck, test, and build in `the-world`.

- [x] **Step 2: Update audits and memory copies**

Record the independent validator fingerprint slice and updated verification evidence.

- [x] **Step 3: Commit**

Commit with `git commit -m "feat: add independent validator fingerprints"`.

## Self-Review

- Spec coverage: vote type, independent count, auto-merge gate, compatibility, and tests are covered.
- Placeholder scan: no TBD/TODO language.
- Type consistency: public counter is `countIndependentPositiveValidators`.
