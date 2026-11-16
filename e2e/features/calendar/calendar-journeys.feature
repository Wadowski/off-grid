# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:calendar
Feature: Calendar journeys

  The main calendar journeys run from start to finish through the web app:
  a person creates and edits a calendar, adds an event and sees it in every
  view, invites a guest who sees the event read-only, and joins and leaves a
  family that owns a calendar. Each journey is checked from the point of view
  of the person it affects, and ends with an accessibility check.

  @ui @a11y
  Scenario: I create a calendar, rename it and change its color, and see it in the list and the sidebar
    Given I am a user with a family named "The Smiths"
    When I create a personal calendar named "Studio" with the color "teal" from the calendar screen
    And I rename the calendar "Studio" to "Workshop" and change its color to "rose" on the edit screen
    Then I see the calendars list with "Workshop"
    When I open the agenda at a desktop width of 1280 pixels
    Then the sidebar shows "Workshop" with the color "rose"
    And the page has no serious accessibility violations

  @ui @a11y
  Scenario: I create an event and see it in the agenda, day, week and month views on desktop
    Given I am a user with a family named "The Smiths"
    And I have a personal calendar named "Studio" with the color "teal"
    When I create a timed event named "Studio review" on the calendar "Studio" from the new event modal
    Then I see the saved event "Studio review" in the agenda without a reload
    When I look at the event "Studio review" in the day, week and month views at a desktop width of 1280 pixels
    Then the page has no serious accessibility violations

  @ui @a11y @wip
  Scenario: I see an event in the agenda, day, week and month views on a phone
    Given I am a user with a family named "The Smiths"
    And I have a personal calendar named "Studio" with the color "teal"
    And I have a timed event named "Studio review" on the calendar "Studio"
    When I look at the event "Studio review" in the agenda, day, week and month views at a phone width of 375 pixels
    Then the page has no serious accessibility violations

  @ui @a11y @wip
  Scenario: A guest I invited sees the event read-only
    Given I am a user with a family named "The Smiths"
    And Ben joins the family "The Smiths" as a guest
    And I have a personal calendar named "Studio" with the color "teal"
    When I create a timed event named "Studio review" on the calendar "Studio" inviting Ben from the new event modal
    And I sign in as Ben
    And I open the event "Studio review" from the agenda
    Then I see the details of the event "Studio review"
    And I see the guests section listing Ben
    And I see no edit or delete control for the event
    And the page has no serious accessibility violations

  @ui @a11y
  Scenario: Joining a family adds its calendar to the sidebar and leaving removes it
    Given I am a user with a family named "The Smiths"
    And the family has a calendar named "Kitchen" with the color "teal"
    And a family member named "Sam" with a family of their own joins "The Smiths"
    And the family member "Sam" eventually sees the calendar "Kitchen"
    When I sign in as the family member "Sam"
    And I open the calendar from the navigation
    Then I see "Kitchen" in the calendar sidebar with a checked show checkbox
    When the family member "Sam" leaves "The Smiths"
    And the family member "Sam" eventually stops seeing the calendar "Kitchen"
    And I open the agenda at a desktop width of 1280 pixels
    Then I do not see "Kitchen" in the calendar sidebar
    And the page has no serious accessibility violations
