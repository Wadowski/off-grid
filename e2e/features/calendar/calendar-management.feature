# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:calendar
Feature: Managing calendars

  A person lists, creates, renames, recolors and deletes the calendars they
  can access. A personal calendar belongs to one person. A family calendar
  is managed by any member of its family.

  @wip
  Scenario: A person lists only their own calendars and the family calendars they belong to
    Given Anna belongs to the family "Home" and has a personal calendar named "Work"
    And the family "Home" has a calendar named "Kitchen"
    And Ben belongs to his own family and has a personal calendar named "Gym"
    When Anna lists her calendars
    Then she sees "Work" and "Kitchen"
    And she does not see "Gym"

  @wip
  Scenario: A person creates a personal calendar with a name and a color
    Given Anna is signed in
    When she creates a personal calendar named "Studio" with the color "teal"
    Then the calendar "Studio" exists with the color "teal" for Anna only

  @wip
  Scenario: Any family member creates a family calendar
    Given Anna and Ben are both members of the family "Home"
    When Ben creates a calendar named "Garden" in the family "Home" with the color "green"
    Then Anna sees the calendar "Garden"

  @wip
  Scenario: A family member renames and recolors a family calendar
    Given Anna and Ben are both members of the family "Home"
    And the family "Home" has a calendar named "Kitchen" with the color "amber"
    When Ben renames the calendar "Kitchen" to "Pantry" and recolors it "rose"
    Then the calendar "Pantry" has the color "rose"

  @wip
  Scenario: Deleting a family calendar removes its events and publishes each removed event
    Given Anna and Ben are both members of the family "Home"
    And the family "Home" has a calendar named "Kitchen" with two events
    When Ben deletes the calendar "Kitchen"
    Then the calendar "Kitchen" no longer exists
    And a "calendar-event-removed-v1" event is published for each of its two events

  @wip
  Scenario: The default calendar cannot be deleted
    Given Anna has her default calendar
    When Anna deletes her default calendar
    Then the default calendar still exists

  @wip
  Scenario: A person cannot see or change another person's personal calendar
    Given Anna has a personal calendar named "Work"
    And Ben belongs to his own family
    When Ben looks at the calendar "Work"
    Then Ben cannot see the calendar "Work"
    When Ben renames the calendar "Work" to "Hijacked"
    Then the calendar "Work" is still named "Work"
    When Ben deletes the calendar "Work"
    Then the calendar "Work" still exists

  @wip
  Scenario: A person outside a family cannot change its calendars
    Given the family "Home" has a calendar named "Kitchen"
    And Ben does not belong to the family "Home"
    When Ben renames the calendar "Kitchen" to "Hijacked"
    Then the calendar "Kitchen" is still named "Kitchen"
    When Ben creates a calendar named "Garden" in the family "Home"
    Then Ben cannot use the family "Home"

  @wip
  Scenario: A removed family member loses access to the family calendars
    Given Anna and Ben are both members of the family "Home"
    And the family "Home" has a calendar named "Kitchen"
    When Ben leaves the family "Home"
    Then Ben does not see "Kitchen"
    When Ben renames the calendar "Kitchen" to "Hijacked"
    Then the calendar "Kitchen" is still named "Kitchen"

  @wip
  Scenario: An invalid name or color is refused
    Given Anna is signed in
    When she creates a personal calendar named "" with the color "neon"
    Then the name is refused as invalid
