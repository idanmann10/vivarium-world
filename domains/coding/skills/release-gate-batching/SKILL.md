---
id: coding.release-gate-batching
name: Release Gate Batching
description: Batch focused and full coding gates in a repeatable order before commit.
kind: prompt
domains: [coding]
status: promoted
visibility: public
version: 1
---

# Release Gate Batching

Use focused tests to prove the slice, then full gates to prove the repository.

## Steps

1. Run the smallest focused command after implementation.
2. Run lint, typecheck, tests, and build.
3. Commit only after the full gate output is read.

# Provenance

Seeded during v1 starter-pack expansion from goal.md. Inspired by: https://github.com/obra/superpowers and https://github.com/garrytan/gstack.
