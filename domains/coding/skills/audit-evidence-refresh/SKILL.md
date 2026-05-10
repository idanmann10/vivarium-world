---
id: coding.audit-evidence-refresh
name: Audit Evidence Refresh
description: Keep coding audits aligned with the latest committed evidence.
kind: prompt
domains: [coding]
status: promoted
visibility: public
version: 1
---

# Audit Evidence Refresh

When a coding slice changes verification counts or status, update the audit while the evidence is still fresh.

## Steps

1. Record the exact focused and full commands that passed.
2. Update status rows only for evidence you inspected.
3. Mirror durable audit copies after the repository file changes.

# Provenance

Seeded during v1 starter-pack expansion from goal.md. Inspired by: https://github.com/obra/superpowers and https://github.com/garrytan/gstack.
