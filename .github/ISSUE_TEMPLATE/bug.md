---
name: Bug
about: Something that does not work as the documented behaviour says it should
title: ""
labels: "bug"
---

**Context:** Where the problem shows up, and who is affected.

## Goal

The behaviour that should happen instead.

## Steps to reproduce

1.
2.
3.

## Scope

- The smallest change that fixes the bug. Add a regression test for it.

## Gherkin scenarios

<!-- Scenario that reproduces the bug. Tag it `@wip` until the fix lands. -->

```gherkin
Feature: <business capability>

  Scenario: <the behaviour that is broken>
    Given <state>
    When <action>
    Then <the correct outcome>
```

## Acceptance criteria

- The reproduction scenario passes.
- A regression test covers the bug.

## Out of scope

- Related problems that are not part of this bug.
