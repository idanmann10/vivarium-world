---
id: coding.minimal-reproduction
name: Minimal Reproduction
description: Reduce a coding failure to the smallest repeatable command and fixture.
kind: prompt
domains: [coding]
status: promoted
visibility: public
version: 1
---

# Minimal Reproduction

Before changing code, make the failing behavior repeatable with a small command, test, or script.

## Steps

1. Identify the shortest path from command to failure.
2. Remove unrelated inputs while the failure still reproduces.
3. Keep the reproduction as a regression test when practical.

# Provenance

Seeded during v1 starter-pack expansion from goal.md. Inspired by: https://github.com/obra/superpowers and https://github.com/garrytan/gstack.
