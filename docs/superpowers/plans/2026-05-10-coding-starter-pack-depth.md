# Coding Starter Pack Depth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the coding starter pack to v1 depth: 20-30 skills and 3-5 traces.

**Architecture:** Keep the existing world content layout. Add validator coverage in `scripts/validate.test.ts`, add prompt-skill markdown under `domains/coding/skills/`, add one trace under `domains/coding/traces/`, and update `STATS.md`.

**Tech Stack:** Markdown world artifacts, Bun tests.

---

### Task 1: Failing Starter-Pack Test

**Files:**
- Modify: `scripts/validate.test.ts`

- [x] **Step 1: Add coding depth assertion**

Count `domains/coding/**/SKILL.md` and `domains/coding/**/TRACE.md`; assert coding has at least 20 and at most 30 skills, and at least 3 and at most 5 traces.

- [x] **Step 2: Verify red**

Run: `bun test scripts/validate.test.ts`

Expected: FAIL because coding currently has 10 skills and 2 traces.

### Task 2: Add Coding Skills

**Files:**
- Create 10 directories under `domains/coding/skills/`
- Add a `SKILL.md` and `lineage.json` file in each directory

- [x] **Step 1: Add focused prompt skills**

Add public prompt skills for patch review, command evidence, fixture design, error reproduction, dependency boundaries, migration discipline, CLI ergonomics, workflow hardening, audit updates, and release-gate batching.

- [x] **Step 2: Add lineage files**

Each lineage file cites `goal.md`, `https://github.com/obra/superpowers`, and `https://github.com/garrytan/gstack`.

### Task 3: Add Coding Trace

**Files:**
- Create: `domains/coding/traces/expand-starter-pack/TRACE.md`
- Create: `domains/coding/traces/expand-starter-pack/meta.yaml`
- Create: `domains/coding/traces/expand-starter-pack/steps.jsonl`

- [x] **Step 1: Add trace narrative**

Document a red-green content expansion workflow with validation and stats update.

- [x] **Step 2: Add trace metadata and steps**

Use the same metadata/steps structure as existing coding traces.

### Task 4: Update Stats, Verify, and Commit

- [x] **Step 1: Update `STATS.md`**

Set skills to 40 and traces to 7.

- [x] **Step 2: Verify world gates**

Run lint, typecheck, test, and build for `the-world`.

- [x] **Step 3: Update audits and memory copies**

Record the coding starter-pack slice and updated verification evidence.

- [x] **Step 4: Commit**

Commit with `git commit -m "feat: expand coding starter pack"`.

## Self-Review

- Spec coverage: count test, skill content, trace content, stats, and non-goals are covered.
- Placeholder scan: no TBD/TODO language.
- Type consistency: world content uses existing `SKILL.md`, `TRACE.md`, `meta.yaml`, and `steps.jsonl` naming.
