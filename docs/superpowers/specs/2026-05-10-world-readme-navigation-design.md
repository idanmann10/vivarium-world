# World README Navigation Design

## Goal

Bring the world README in line with `goal.md` by making it an entry point with navigation, current featured picks, and current stats.

## Scope

- Add direct links to the main world directories and operating docs.
- Surface the current featured picks from `featured/current.md`.
- Surface the current seed snapshot and contributor concentration from `STATS.md`.
- Add regression coverage so the README cannot drift back to a generic placeholder.

## Non-Goals

- No generated README pipeline.
- No live GitHub badge integration.
- No renaming of the placeholder repository title.

## Testing

World operation tests verify that the README links the key directories and includes representative current featured and stats lines.
