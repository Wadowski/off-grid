# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:calendar
Feature: Family calendar

  Every family has a family calendar from the moment it is created. Its
  members see it in their calendar list and can pick it when they create an
  event. A person who is not a member does not see it.

  @wip
  Scenario: A new family gets one family calendar named after the family
    Given Anna creates the family "The Smiths"
    Then Anna sees exactly one calendar named "The Smiths" that belongs to the family

  @wip
  Scenario: A family member sees the family calendar and a non-member does not
    Given Anna belongs to the family "The Smiths"
    And Ben belongs to his own family
    When Anna lists her calendars
    Then she sees the calendar "The Smiths"
    When Ben lists his calendars
    Then he does not see the calendar "The Smiths"

  @wip @ui
  Scenario: I can pick the family calendar when creating an event
    Given Anna belongs to the family "The Smiths"
    And Ben belongs to the family "The Smiths"
    When Anna opens the new event modal
    And she chooses the calendar "The Smiths"
    And she saves an event named "Dinner"
    Then "Dinner" is in the calendar "The Smiths"
    And Ben sees the event "Dinner" in the family calendar

  @wip @ui
  Scenario: The personal calendar stays preselected in the new event form
    Given Anna belongs to the family "The Smiths"
    And I have a personal calendar named "Studio" with the color "teal"
    When Anna opens the new event modal
    Then the calendar "Studio" is preselected

  @wip
  Scenario: The family calendar cannot be deleted
    Given Anna belongs to the family "The Smiths"
    When Anna deletes the calendar "The Smiths"
    Then the calendar "The Smiths" still exists
