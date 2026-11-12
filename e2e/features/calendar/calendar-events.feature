# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:calendar
Feature: Managing events

  A person creates, reads, changes, moves and deletes the events of the
  calendars they can access. An event belongs to the owner of its calendar:
  a personal event belongs to one person, a family event to its family.
  Times are stored in UTC. An all-day event covers whole days in the
  person's own time zone.

  @wip
  Scenario: Anna creates a timed event in her personal calendar
    Given Anna is signed in
    And she has a personal calendar named "Work"
    When she creates an event "Standup" in "Work" from 2026-11-20 09:00 to 09:30 in UTC
    Then the event "Standup" is stored with the start 2026-11-20T09:00:00Z and the end 2026-11-20T09:30:00Z

  @wip
  Scenario: Anna cannot create an event that ends before it starts
    Given Anna is signed in
    And she has a personal calendar named "Work"
    When she creates an event "Backwards" in "Work" from 2026-11-20 10:00 to 09:00 in UTC
    Then the request is refused as invalid
    And no event "Backwards" is stored

  @wip
  Scenario: Anna creates an all-day event in her own time zone
    Given Anna is signed in
    And her time zone is "Europe/Warsaw"
    And she has a personal calendar named "Work"
    When she creates an all-day event "Conference" in "Work" on 2026-11-20
    Then the event "Conference" is stored with the start 2026-11-19T23:00:00Z and the end 2026-11-20T23:00:00Z

  @wip
  Scenario: A family member creates an event in a family calendar and another member sees it
    Given Anna and Ben are both members of the family "Home"
    And the family "Home" has a calendar named "Kitchen"
    When Ben creates an event "Dinner" in "Kitchen" from 2026-11-21 18:00 to 19:00 in UTC
    Then Anna sees the event "Dinner" in "Kitchen"

  @wip
  Scenario: A person outside a family cannot read or create events in its calendar
    Given the family "Home" has a calendar named "Kitchen"
    And Carol does not belong to the family "Home"
    When Carol lists the events of "Kitchen"
    Then the calendar "Kitchen" is not found for Carol
    When Carol creates an event "Intruder" in "Kitchen" from 2026-11-21 18:00 to 19:00 in UTC
    Then the calendar "Kitchen" is not found for Carol

  @wip
  Scenario: Anna moves her event to her other personal calendar
    Given Anna is signed in
    And she has a personal calendar named "Work"
    And she has a personal calendar named "Home"
    And she has an event "Errand" in "Work"
    When she moves the event "Errand" to "Home"
    Then the event "Errand" is in "Home"

  @wip
  Scenario: Anna cannot move her personal event into a family calendar
    Given Anna is signed in
    And she is a member of the family "Home"
    And she has a personal calendar named "Work"
    And the family "Home" has a calendar named "Kitchen"
    And she has an event "Errand" in "Work"
    When she moves the event "Errand" to "Kitchen"
    Then the move is refused
    And the event "Errand" is still in "Work"

  @wip
  Scenario: Anna cannot read or change Ben's personal event
    Given Ben is signed in
    And he has a personal calendar named "Gym"
    And he has an event "Training" in "Gym"
    When Anna reads the event "Training"
    Then the event is not found for Anna
    When Anna renames the event "Training" to "Hijacked"
    Then the event is not found for Anna

  @wip
  Scenario: Anna deletes an event and its removal is published
    Given Anna is signed in
    And she has a personal calendar named "Work"
    And she has an event "Errand" in "Work"
    When she deletes the event "Errand"
    Then the event "Errand" no longer exists
    And a "calendar-event-removed-v1" event is published for "Errand"
