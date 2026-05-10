# World Maintenance Workflows Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace placeholder world maintenance workflows with concrete validation, archive, and auto-merge actions.

**Architecture:** Keep workflow logic thin and script-driven. The workflows call existing scripts and GitHub CLI commands; tests assert workflow content so placeholders do not regress.

**Tech Stack:** GitHub Actions YAML, Bun, TypeScript tests.

---

### Task 1: Failing Workflow Tests

**Files:**
- Modify: `scripts/world-ops.test.ts`

- [x] **Step 1: Add workflow assertions**

Add tests that read `.github/workflows/archive-regression.yml` and `.github/workflows/auto-merge.yml`.

- [x] **Step 2: Reject placeholders**

Assert neither workflow contains `placeholder` or the current placeholder `echo` messages.

- [x] **Step 3: Assert concrete commands**

Assert archive workflow runs `bun run scripts/archive-regression.ts`; assert auto-merge workflow runs `bun run scripts/compute-signals.ts`, `bun run scripts/list-held-reviews.ts`, and `gh pr merge`.

- [x] **Step 4: Verify red**

Run: `bun test scripts/world-ops.test.ts`

Expected: FAIL because both workflows are placeholders.

### Task 2: Replace Workflows

**Files:**
- Modify: `.github/workflows/archive-regression.yml`
- Modify: `.github/workflows/auto-merge.yml`

- [x] **Step 1: Update archive workflow**

Checkout code, install Bun dependencies, run lint, run `bun run scripts/archive-regression.ts`, and create a pull request when the script changes files.

- [x] **Step 2: Update auto-merge workflow**

Checkout code, install Bun dependencies, run lint/tests, compute signals/trust context, list held reviews, and run `gh pr merge "$PR_NUMBER" --squash --auto` for pull-request events.

### Task 3: Verify and Commit

- [x] **Step 1: Verify focused tests**

Run: `bun test scripts/world-ops.test.ts`

Expected: PASS.

- [x] **Step 2: Run world gates**

Run lint, typecheck, test, and build for `the-world`.

- [x] **Step 3: Update audits and memory copies**

Record the workflow slice in the agent audit and memory files.

- [x] **Step 4: Commit**

Commit with `git commit -m "feat: add concrete world maintenance workflows"`.

## Self-Review

- Spec coverage: archive workflow, auto-merge workflow, placeholder regression tests, and non-goals are covered.
- Placeholder scan: no TBD/TODO language.
- Type consistency: workflow test file remains `scripts/world-ops.test.ts`.
