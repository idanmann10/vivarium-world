---
id: coding.red-green-refactor
name: Red Green Refactor
description: Use a failing test before production code for behavior changes.
kind: prompt
domains: [coding]
status: promoted
visibility: public
version: 1
---

# Red Green Refactor

Write the smallest test that should fail, run it, implement the smallest change, run it again, then refactor only while green.

## Steps

1. Identify the reusable situation.
2. Apply the behavior with local evidence.
3. Record whether it helped.

# Provenance

Seeded during Phase 0 from goal.md. Inspired by: https://github.com/obra/superpowers.
