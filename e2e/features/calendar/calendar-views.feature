# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:calendar
Feature: Viewing events by agenda, day, week and month

  A person asks for the events of a view: the agenda, a day, a week or a
  month. A view covers local days in the person's own time zone. An event
  that spans several days appears on every day it overlaps. A person only
  sees events of the calendars they can access.

  @wip
  Scenario: Anna sees the events of one week in her week view, Monday to Sunday
    Given Anna is signed in
    And she has a personal calendar named "Work"
    And she has an event "Monday review" in "Work" from 2026-11-16 09:00 to 09:30 in UTC
    And she has an event "Sunday call" in "Work" from 2026-11-22 18:00 to 18:30 in UTC
    And she has an event "Last week" in "Work" from 2026-11-15 09:00 to 09:30 in UTC
    When Anna opens her week view for 2026-11-18
    Then the week view starts on 2026-11-16 and ends on 2026-11-22
    And the week view lists "Monday review"
    And the week view lists "Sunday call"
    And the week view does not list "Last week"

  @wip
  Scenario: Anna sees the agenda for the seven days starting on the given date
    Given Anna is signed in
    And she has a personal calendar named "Work"
    And she has an event "Today" in "Work" from 2026-11-18 09:00 to 09:30 in UTC
    And she has an event "Six days later" in "Work" from 2026-11-24 09:00 to 09:30 in UTC
    And she has an event "Seven days later" in "Work" from 2026-11-25 09:00 to 09:30 in UTC
    When Anna opens her agenda view for 2026-11-18
    Then the agenda view starts on 2026-11-18 and ends on 2026-11-24
    And the agenda view lists "Today"
    And the agenda view lists "Six days later"
    And the agenda view does not list "Seven days later"

  @wip
  Scenario: Anna sees only the days of her month, without the neighbouring days
    Given Anna is signed in
    And she has a personal calendar named "Work"
    And she has an event "Last of October" in "Work" from 2026-10-31 09:00 to 09:30 in UTC
    And she has an event "First of November" in "Work" from 2026-11-01 09:00 to 09:30 in UTC
    And she has an event "Last of November" in "Work" from 2026-11-30 09:00 to 09:30 in UTC
    And she has an event "First of December" in "Work" from 2026-12-01 09:00 to 09:30 in UTC
    When Anna opens her month view for 2026-11-12
    Then the month view starts on 2026-11-01 and ends on 2026-11-30
    And the month view lists "First of November"
    And the month view lists "Last of November"
    And the month view does not list "Last of October"
    And the month view does not list "First of December"

  @wip
  Scenario: A multi-day event appears on every day it spans
    Given Anna is signed in
    And she has a personal calendar named "Work"
    And she has an event "Conference" in "Work" from 2026-11-17 09:00 to 2026-11-19 17:00 in UTC
    When Anna opens her agenda view for 2026-11-16
    Then the agenda view shows "Conference" on 2026-11-17
    And the agenda view shows "Conference" on 2026-11-18
    And the agenda view shows "Conference" on 2026-11-19
    And the agenda view does not show "Conference" on 2026-11-16
    And the agenda view does not show "Conference" on 2026-11-20

  @wip
  Scenario: A family calendar event appears for a family member and not for an outsider
    Given Anna is signed in
    And Anna and Ben are both members of the family "Home"
    And the family "Home" has a calendar named "Kitchen"
    And Ben has an event "Dinner" in "Kitchen" from 2026-11-18 18:00 to 19:00 in UTC
    And Carol is signed in
    And Carol does not belong to the family "Home"
    When Anna opens her agenda view for 2026-11-18
    Then the agenda view lists "Dinner"
    When Carol opens her agenda view for 2026-11-18
    Then the agenda view does not list "Dinner"

  @wip
  Scenario: A person who leaves a family no longer sees its calendar events in their views
    Given Anna is signed in
    And Anna and Ben are both members of the family "Home"
    And the family "Home" has a calendar named "Kitchen"
    And Ben has an event "Dinner" in "Kitchen" from 2026-11-18 18:00 to 19:00 in UTC
    When Ben opens his agenda view for 2026-11-18
    Then the agenda view lists "Dinner"
    When Ben steps out of the family "Home"
    And Ben opens his agenda view for 2026-11-18
    Then the agenda view does not list "Dinner"

  @wip
  Scenario: An event that ends at local midnight at the start of the range is not listed
    Given Anna is signed in
    And her time zone is "Europe/Warsaw"
    And she has a personal calendar named "Work"
    And she has an event "Late night" in "Work" from 2026-11-17 21:00 to 23:00 in UTC
    When Anna opens her day view for 2026-11-17
    Then the day view lists "Late night"
    When Anna opens her day view for 2026-11-18
    Then the day view does not list "Late night"

  @wip
  Scenario: The week of the autumn time change in Europe/Warsaw lists each day once
    Given Anna is signed in
    And her time zone is "Europe/Warsaw"
    And she has a personal calendar named "Work"
    And she has an event "Saturday run" in "Work" from 2026-10-24 07:00 to 08:00 in UTC
    And she has an event "Sunday brunch" in "Work" from 2026-10-25 09:00 to 10:00 in UTC
    When Anna opens her week view for 2026-10-25
    Then the week view starts on 2026-10-19 and ends on 2026-10-25
    And the week view covers each of its 7 days exactly once
    And the week view lists "Saturday run"
    And the week view lists "Sunday brunch"
