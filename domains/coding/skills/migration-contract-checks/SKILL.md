---
id: coding.migration-contract-checks
name: Migration Contract Checks
description: Verify coding migrations create durable schema and update visible version lists.
kind: prompt
domains: [coding]
status: promoted
visibility: public
version: 1
---

# Migration Contract Checks

Schema changes need tests at both the storage layer and any command that reports migration state.

## Steps

1. Add a migration test that checks the new table or column.
2. Add a repository test that proves the data survives reopening.
3. Update CLI or audit expectations that list migration versions.

# Provenance

Seeded during v1 starter-pack expansion from goal.md. Inspired by: https://github.com/obra/superpowers and https://github.com/garrytan/gstack.
