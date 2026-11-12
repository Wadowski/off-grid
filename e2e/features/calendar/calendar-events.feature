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
    Then the change is refused
    And no event "Backwards" is stored

  @wip
  Scenario: Anna cannot create an all-day event whose end date is before its start date
    Given Anna is signed in
    And she has a personal calendar named "Work"
    When she creates an all-day event "Trip" in "Work" from 2026-11-22 to 2026-11-20
    Then the change is refused
    And no event "Trip" is stored

  @wip
  Scenario: Anna creates an all-day event in her own time zone
    Given Anna is signed in
    And her time zone is "Europe/Warsaw"
    And she has a personal calendar named "Work"
    When she creates an all-day event "Conference" in "Work" on 2026-11-20
    Then the event "Conference" is stored with the start 2026-11-19T23:00:00Z and the end 2026-11-20T23:00:00Z

  @wip
  Scenario: Anna renames her own event
    Given Anna is signed in
    And she has a personal calendar named "Work"
    And she has an event "Errand" in "Work"
    When she renames the event "Errand" to "Errands"
    Then the event "Errands" is stored in "Work"
    And no event "Errand" is stored

  @wip
  Scenario: Anna cannot save a change that makes her event end before it starts
    Given Anna is signed in
    And she has a personal calendar named "Work"
    And she has an event "Errand" in "Work" from 2026-11-20 10:00 to 11:00 in UTC
    When she changes the end of the event "Errand" to 2026-11-20 09:00 in UTC
    Then the change is refused
    And the event "Errand" is still stored with the start 2026-11-20T10:00:00Z and the end 2026-11-20T11:00:00Z

  @wip
  Scenario: A family member updates an event in a family calendar
    Given Anna is signed in
    And Anna and Ben are both members of the family "Home"
    And the family "Home" has a calendar named "Kitchen"
    And Ben has an event "Dinner" in "Kitchen"
    When Anna renames the event "Dinner" to "Late dinner"
    Then Ben sees the event "Late dinner" in "Kitchen"

  @wip
  Scenario: A family member deletes an event in a family calendar
    Given Anna is signed in
    And Anna and Ben are both members of the family "Home"
    And the family "Home" has a calendar named "Kitchen"
    And Ben has an event "Dinner" in "Kitchen"
    When Anna deletes the event "Dinner"
    Then Ben no longer sees the event "Dinner" in "Kitchen"

  @wip
  Scenario: A family member creates an event in a family calendar and another member sees it
    Given Anna is signed in
    And Anna and Ben are both members of the family "Home"
    And the family "Home" has a calendar named "Kitchen"
    When Ben creates an event "Dinner" in "Kitchen" from 2026-11-21 18:00 to 19:00 in UTC
    Then Anna sees the event "Dinner" in "Kitchen"

  @wip
  Scenario: A person outside a family cannot read or create events in its calendar
    Given Carol is signed in
    And the family "Home" has a calendar named "Kitchen"
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
    Then the change is refused
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
  Scenario: Anna deletes an event from her calendar
    Given Anna is signed in
    And she has a personal calendar named "Work"
    And she has an event "Errand" in "Work"
    When she deletes the event "Errand"
    Then the event "Errand" is no longer listed in "Work"
