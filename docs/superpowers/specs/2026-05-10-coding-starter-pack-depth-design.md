# Coding Starter Pack Depth Design

## Goal

Close the local v1 starter-pack gap for the `coding` domain by providing 20-30 coding skills and 3-5 coding traces.

## Scope

- Add a validator test for v1 starter-pack depth in the `coding` domain.
- Add 10 focused coding skills, bringing coding from 10 to 20 skills.
- Add 1 focused coding trace, bringing coding from 2 to 3 traces.
- Keep all new content public and seeded from the same Superpowers/GStack lineage already used in the world.
- Update `STATS.md` to match the new world snapshot.

## Non-Goals

- No new domain.
- No changes to agent retrieval code.
- No generated code skills; all v1 skills remain prompt skills.
- No live usage metrics.

## Testing

`scripts/validate.test.ts` checks the coding starter-pack size. The full world validator, typecheck, tests, and build remain the release gates.
