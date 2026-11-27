# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:calendar
Feature: Family calendar

  Every family has a family calendar from the moment it is created. Its
  members see it in their calendar list and can pick it when they create an
  event. A person who is not a member does not see it.

  Scenario: A new family gets one family calendar named after the family
    Given Anna creates the family "The Smiths"
    Then Anna sees exactly one calendar named "The Smiths" that belongs to the family

  Scenario: A family member sees the family calendar and a non-member does not
    Given Anna creates the family "The Smiths"
    And Ben belongs to his own family
    When Anna fetches her calendar list
    Then she sees the calendar "The Smiths"
    When Ben fetches his calendar list
    Then he does not see the calendar "The Smiths"

  @ui
  Scenario: I can pick the family calendar when creating an event
    Given I am a user with a family named "The Smiths"
    When I open the new event modal from the calendar sidebar on a desktop
    Then the calendar "The Smiths" is offered in the new event modal
    When I create a timed event named "Dinner" on the calendar "The Smiths" from the new event modal
    Then I see the saved event "Dinner" in the agenda without a reload

  @ui
  Scenario: The personal calendar stays preselected in the new event form
    Given I am a user with a family named "The Smiths"
    When I open the new event modal from the calendar sidebar on a desktop
    Then the calendar "Personal" is preselected in the new event modal

  Scenario: The family calendar cannot be deleted
    Given Anna creates the family "The Smiths"
    When Anna deletes the calendar "The Smiths"
    Then Anna still sees the calendar "The Smiths"
