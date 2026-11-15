# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:calendar
Feature: Event reminders

  A person can ask to be reminded before an event starts. Each reminder is
  private to the person who set it. When it is due it arrives once in that
  person's inbox. Changing the event moves the reminder, and deleting the event
  removes it. A reminder whose time has already passed is skipped.

  Scenario: Anna gets one inbox item for each reminder of an event
    Given Anna is signed in
    And Anna has a personal event "Standup" at 09:00 UTC on 2026-11-20
    When Anna sets reminders 15 and 60 minutes before "Standup"
    And the clock reaches 08:00 UTC on 2026-11-20
    Then Anna has one inbox item of type "event-reminder" that names the event "Standup"
    When the clock reaches 08:45 UTC on 2026-11-20
    Then Anna has two inbox items of type "event-reminder" that name the event "Standup"

  Scenario: A reminder that already fired does not arrive again on a later tick
    Given Anna is signed in
    And Anna has a personal event "Standup" at 09:00 UTC on 2026-11-20
    And Anna has set a reminder 15 minutes before "Standup"
    When the clock reaches 08:45 UTC on 2026-11-20
    And the clock reaches 08:50 UTC on 2026-11-20
    Then Anna has one inbox item of type "event-reminder" that names the event "Standup"

  Scenario: Moving the event moves the reminder
    Given Anna is signed in
    And Anna has a personal event "Standup" at 09:00 UTC on 2026-11-20
    And Anna has set a reminder 15 minutes before "Standup"
    When Anna moves "Standup" to 10:00 UTC on 2026-11-20
    And the clock reaches 08:45 UTC on 2026-11-20
    Then Anna has no inbox item of type "event-reminder"
    When the clock reaches 09:45 UTC on 2026-11-20
    Then Anna has one inbox item of type "event-reminder" that names the event "Standup"

  Scenario: Deleting the event removes its reminders
    Given Anna is signed in
    And Anna has a personal event "Standup" at 09:00 UTC on 2026-11-20
    And Anna has set a reminder 15 minutes before "Standup"
    When Anna deletes the event "Standup"
    And the clock reaches 08:45 UTC on 2026-11-20
    Then Anna has no inbox item of type "event-reminder"

  Scenario: A reminder whose time has already passed is skipped
    Given Anna is signed in
    And Anna has a personal event "Standup" starting in 5 minutes
    When Anna sets a reminder 15 minutes before "Standup"
    And the clock reaches the start of "Standup"
    Then Anna has no inbox item of type "event-reminder"

  Scenario: A family member does not see Anna's reminders on a shared event
    Given Anna is signed in
    And Tom is a member of Anna's family
    And Anna has a family event "Dinner" at 18:00 UTC on 2026-11-20
    When Anna sets a reminder 30 minutes before "Dinner"
    And the clock reaches 17:30 UTC on 2026-11-20
    Then Tom has no reminder for the event "Dinner"
    And Tom has no inbox item of type "event-reminder"
