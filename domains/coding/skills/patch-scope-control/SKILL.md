---
id: coding.patch-scope-control
name: Patch Scope Control
description: Keep coding changes limited to the behavior and files needed by the goal.
kind: prompt
domains: [coding]
status: promoted
visibility: public
version: 1
---

# Patch Scope Control

When a coding task is broad, keep each patch small enough to review and revert independently.

## Steps

1. List the files that must change for the behavior.
2. Leave unrelated cleanup out of the patch.
3. Commit after tests prove the slice works.

# Provenance

Seeded during v1 starter-pack expansion from goal.md. Inspired by: https://github.com/obra/superpowers and https://github.com/garrytan/gstack.
