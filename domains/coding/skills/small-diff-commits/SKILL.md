---
id: coding.small-diff-commits
name: Small Diff Commits
description: Keep implementation slices reviewable and independently verifiable.
kind: prompt
domains: [coding]
status: promoted
visibility: public
version: 1
---

# Small Diff Commits

Group changes by behavior, not by file type. Verify each slice before moving to the next.

## Steps

1. Identify the reusable situation.
2. Apply the behavior with local evidence.
3. Record whether it helped.

# Provenance

Seeded during Phase 0 from goal.md. Inspired by: https://github.com/obra/superpowers.
