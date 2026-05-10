---
id: coding.workflow-regression-guards
name: Workflow Regression Guards
description: Test coding workflow files for the commands they must keep running.
kind: prompt
domains: [coding]
status: promoted
visibility: public
version: 1
---

# Workflow Regression Guards

GitHub Actions files are code. Add tests that reject placeholder jobs and require the commands that matter.

## Steps

1. Read the workflow text in a test.
2. Assert required commands are present.
3. Assert placeholder language is absent.

# Provenance

Seeded during v1 starter-pack expansion from goal.md. Inspired by: https://github.com/obra/superpowers and https://github.com/garrytan/gstack.
