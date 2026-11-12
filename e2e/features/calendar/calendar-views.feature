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
    And she has an event "Monday review" in "Work" on 2026-11-16
    And she has an event "Sunday call" in "Work" on 2026-11-22
    And she has an event "Last week" in "Work" on 2026-11-15
    When she opens her week view for 2026-11-18
    Then the week view starts on 2026-11-16 and ends on 2026-11-22
    And the week view lists "Monday review" and "Sunday call"
    And the week view does not list "Last week"

  @wip
  Scenario: Anna sees the agenda for the seven days starting on the given date
    Given Anna is signed in
    And she has a personal calendar named "Work"
    And she has an event "Today" in "Work" on 2026-11-18
    And she has an event "Six days later" in "Work" on 2026-11-24
    And she has an event "Seven days later" in "Work" on 2026-11-25
    When she opens her agenda for 2026-11-18
    Then the agenda starts on 2026-11-18 and ends on 2026-11-24
    And the agenda lists "Today" and "Six days later"
    And the agenda does not list "Seven days later"

  @wip
  Scenario: Anna sees only the days of her month, without the neighbouring days
    Given Anna is signed in
    And she has a personal calendar named "Work"
    And she has an event "Last of October" in "Work" on 2026-10-31
    And she has an event "First of November" in "Work" on 2026-11-01
    And she has an event "Last of November" in "Work" on 2026-11-30
    And she has an event "First of December" in "Work" on 2026-12-01
    When she opens her month view for 2026-11-12
    Then the month view starts on 2026-11-01 and ends on 2026-11-30
    And the month view lists "First of November" and "Last of November"
    And the month view does not list "Last of October" or "First of December"

  @wip
  Scenario: A multi-day event appears on every day it spans
    Given Anna is signed in
    And she has a personal calendar named "Work"
    And she has an event "Conference" in "Work" from 2026-11-17 09:00 to 2026-11-19 17:00 in UTC
    When she opens her agenda for 2026-11-16
    Then the agenda shows "Conference" on 2026-11-17, 2026-11-18 and 2026-11-19
    And the agenda does not show "Conference" on 2026-11-16 or 2026-11-20

  @wip
  Scenario: A family calendar event appears for a family member and not for an outsider
    Given Anna is signed in
    And Anna and Ben are both members of the family "Home"
    And the family "Home" has a calendar named "Kitchen"
    And Ben has an event "Dinner" in "Kitchen" on 2026-11-18
    And Chris is signed in
    And Chris is not a member of the family "Home"
    When Anna opens her agenda for 2026-11-18
    Then the agenda lists "Dinner"
    When Chris opens his agenda for 2026-11-18
    Then the agenda does not list "Dinner"

  @wip
  Scenario: A removed family member no longer sees the family calendar events in their views
    Given Anna is signed in
    And Anna and Ben are both members of the family "Home"
    And the family "Home" has a calendar named "Kitchen"
    And Ben has an event "Dinner" in "Kitchen" on 2026-11-18
    And Ben is removed from the family "Home"
    When Ben opens his agenda for 2026-11-18
    Then the agenda does not list "Dinner"

  @wip
  Scenario: An event that ends at local midnight at the start of the range is not listed
    Given Anna is signed in
    And her time zone is "Europe/Warsaw"
    And she has a personal calendar named "Work"
    And she has an event "Late night" in "Work" from 2026-11-17 22:00 to 2026-11-18 00:00 in Europe/Warsaw
    When she opens her day view for 2026-11-18
    Then the day view does not list "Late night"

  @wip
  Scenario: The week of the autumn time change in Europe/Warsaw lists each day once, with the 25-hour day
    Given Anna is signed in
    And her time zone is "Europe/Warsaw"
    And she has a personal calendar named "Work"
    And she has an event "Saturday run" in "Work" on 2026-10-24
    And she has an event "Sunday brunch" in "Work" on 2026-10-25
    When she opens her week view for 2026-10-25
    Then the week view starts on 2026-10-19 and ends on 2026-10-25
    And the week view lists each of its 7 days exactly once
    And the day 2026-10-25 is 25 hours long
    And the week view lists "Saturday run" and "Sunday brunch"
