---
name: Task
about: A piece of planned work with scenarios and acceptance criteria
title: ""
labels: ""
---

**Context:** Why this work matters, and what it depends on.

## Goal

One or two sentences on the outcome.

## Scope

- What is included, as a list of concrete deliverables.

## Gherkin scenarios

<!-- Copied into an `e2e/features/<module>/*.feature` file as the first commit. Tag them `@wip` until they pass. -->

```gherkin
Feature: <business capability>

  Scenario: <one behaviour>
    Given <state>
    When <action>
    Then <observable outcome>
```

## Acceptance criteria

- Each criterion is observable and can be checked.

## Out of scope

- What this issue deliberately does not cover.
