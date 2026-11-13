# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:calendar @ui
Feature: Calendar management screens

  A signed-in person sees the calendars they can access on the calendars
  page, and creates, edits and deletes them from the calendar screens. The
  calendar sidebar is kept apart from the main navigation.

  @smoke
  Scenario: The Calendar nav item opens the agenda view
    Given I am a user with a family named "The Smiths"
    When I open the calendar from the navigation
    Then I see the agenda view

  Scenario: The calendar sidebar is not part of the main navigation
    Given I am a user with a family named "The Smiths"
    And I have a personal calendar named "Studio" with the color "teal"
    When I open the home page
    Then the main navigation does not list "Studio"

  @smoke
  Scenario: I create a personal calendar with a name and a color from the create screen
    Given I am a user with a family named "The Smiths"
    When I create a personal calendar named "Studio" with the color "teal" from the calendar screen
    Then I see the calendars list with "Studio"

  Scenario: I create a family calendar for one of my families
    Given I am a user with a family named "The Smiths"
    When I create a calendar named "Kitchen" for the family "The Smiths" from the calendar screen
    Then I see the calendars list with "Kitchen"
    And the calendars list shows "Kitchen" owned by "The Smiths"

  Scenario: An empty calendar name is refused
    Given I am a user with a family named "The Smiths"
    When I try to create a calendar with an empty name
    Then I see the message "Enter a calendar name."

  Scenario: I rename a calendar and change its color on the edit screen
    Given I am a user with a family named "The Smiths"
    And I have a personal calendar named "Studio" with the color "teal"
    When I rename the calendar "Studio" to "Workshop" and change its color to "rose" on the edit screen
    Then I see the calendars list with "Workshop"

  Scenario: I delete a calendar after confirming
    Given I am a user with a family named "The Smiths"
    And I have a personal calendar named "Studio" with the color "teal"
    When I delete the calendar "Studio" after confirming
    Then I see the calendars list without "Studio"

  Scenario: Cancelling the delete confirmation keeps the calendar
    Given I am a user with a family named "The Smiths"
    And I have a personal calendar named "Studio" with the color "teal"
    When I open the delete confirmation for the calendar "Studio" and cancel it
    Then the calendar "Studio" is still listed

  Scenario: The default calendar has no delete button
    Given I am a user with a family named "The Smiths"
    When I open the edit screen for my default calendar
    Then I do not see a delete button

  Scenario: Opening another person's calendar shows that it is no longer available
    Given I am a user with a family named "The Smiths"
    And another person has a personal calendar that I cannot access
    When I open the edit screen for a calendar I cannot access
    Then I see the message "This calendar is no longer available."

  @ui
  Scenario: The calendar screens work at phone width without horizontal scroll
    Given I am a user with a family named "The Smiths"
    And I have a personal calendar named "Studio" with the color "teal"
    When I open the calendars list at a phone width of 375 pixels
    Then the page has no horizontal scroll

  @a11y @ui
  Scenario: The calendar screens have no serious accessibility violations in light and dark theme
    Given I am a user with a family named "The Smiths"
    And I have a personal calendar named "Studio" with the color "teal"
    When I check the calendars list, the create calendar screen and the edit calendar screen for accessibility in light and dark theme
    Then no serious accessibility violations are found
