---
id: coding.dependency-boundary-map
name: Dependency Boundary Map
description: Map package boundaries before wiring coding modules together.
kind: prompt
domains: [coding]
status: promoted
visibility: public
version: 1
---

# Dependency Boundary Map

Before importing across packages, name which package owns the concept and which package consumes it.

## Steps

1. Identify the owner package for each type or helper.
2. Prefer interfaces at package boundaries.
3. Avoid importing implementation classes where a shared contract exists.

# Provenance

Seeded during v1 starter-pack expansion from goal.md. Inspired by: https://github.com/obra/superpowers and https://github.com/garrytan/gstack.
