---
id: coding.failing-fixture-design
name: Failing Fixture Design
description: Build a focused fixture that fails for the missing coding behavior.
kind: prompt
domains: [coding]
status: promoted
visibility: public
version: 1
---

# Failing Fixture Design

A good coding fixture demonstrates one missing behavior with names and values that make the expected contract obvious.

## Steps

1. Pick one behavior and one assertion.
2. Use realistic object names from the local domain.
3. Run the fixture before implementation and confirm it fails for the expected reason.

# Provenance

Seeded during v1 starter-pack expansion from goal.md. Inspired by: https://github.com/obra/superpowers and https://github.com/garrytan/gstack.
