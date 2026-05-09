# World Trust Gates Slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add local trust, auto-merge, and held-review helper logic for Phase 3 world maintenance.

**Architecture:** Keep helpers in scripts so GitHub Actions can call them later. Tests use filesystem fixtures and pure function inputs.

**Tech Stack:** Bun test, TypeScript ESM.

---

### Task 1: Tests

**Files:**
- Modify: `scripts/world-ops.test.ts`

- [ ] Add failing tests for trust scoring, K selection, auto-merge gates, and held review listing.
- [ ] Run tests and confirm missing exports.

### Task 2: Implementation

**Files:**
- Modify: `scripts/compute-trust.ts`
- Add: `scripts/list-held-reviews.ts`

- [ ] Implement pure trust/gate helpers.
- [ ] Implement filesystem held-review listing.
- [ ] Run world gates and commit.
