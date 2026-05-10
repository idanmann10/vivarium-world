# World Maintainer Veto Design

## Goal

Close the local anti-gaming gap from `goal.md` by making world auto-merge respect a 48-hour maintainer veto window.

## Scope

- Add a deterministic veto-window evaluator for pull-request metadata.
- Hold auto-merge when a pull request is less than 48 hours old.
- Hold auto-merge whenever a `maintainer-veto` label is present.
- Add the check to the auto-merge workflow before merge enforcement.

## Non-Goals

- No live GitHub polling service.
- No scheduled PR enumerator.
- No replacement for repository branch protection.
- No maintainer identity authorization model beyond GitHub labels and workflow metadata.

## Testing

World operation tests verify that a fresh PR is held, an older PR passes, a veto label holds, and the auto-merge workflow runs the veto-window script before merge enforcement.
