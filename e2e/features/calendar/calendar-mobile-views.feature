# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:calendar @ui
Feature: Mobile calendar views: agenda, day, week and month

  A signed-in person reads her events on a phone as an agenda, a day
  timeline, a week or a month. Each view shows only the events of the
  calendars she can access, in her own time zone.

  @smoke
  Scenario: Anna sees her agenda for the seven days from the Monday of the week
    Given I am a user with a family named "The Smiths"
    And I have a personal calendar named "Work" with the color "blue"
    And the event "Standup" is in "Work" from 2026-11-18 09:00 to 09:30 in UTC
    When I open the agenda view for 2026-11-18 at a phone width of 375 pixels
    Then I see the week strip from 2026-11-16 to 2026-11-22
    And I see the event "Standup" in the agenda for 2026-11-18

  Scenario: Anna opens the calendar and sees the agenda by default
    Given I am a user with a family named "The Smiths"
    When I open the calendar from the navigation at a phone width of 375 pixels
    Then I see the agenda view

  Scenario: Anna switches from the agenda to the day timeline and sees the events placed by time
    Given I am a user with a family named "The Smiths"
    And I have a personal calendar named "Work" with the color "blue"
    And the event "Standup" is in "Work" from 2026-11-18 09:00 to 09:30 in UTC
    When I open the agenda view for 2026-11-18 at a phone width of 375 pixels
    And I switch to the day timeline
    Then I see the event "Standup" placed between 09:00 and 09:30 on the timeline

  Scenario: Anna sees the empty-day text on a day with no events
    Given I am a user with a family named "The Smiths"
    When I open the agenda view for 2026-11-18 at a phone width of 375 pixels
    Then I see the text "Nothing scheduled for this day."

  Scenario: A view that fails to load shows the error text and a retry action
    Given I am a user with a family named "The Smiths"
    And the calendar views service fails for the next request
    When I open the agenda view for 2026-11-18 at a phone width of 375 pixels
    Then I see the text "We could not load this view."
    And I see a retry action

  @a11y @ui
  Scenario: The mobile views have no serious accessibility violations in light and dark theme
    Given I am a user with a family named "The Smiths"
    And I have a personal calendar named "Work" with the color "blue"
    When I check the agenda view and the day timeline for accessibility in light and dark theme
    Then no serious accessibility violations are found

  @ui
  Scenario: The mobile views work at a phone width of 375 pixels without horizontal scroll
    Given I am a user with a family named "The Smiths"
    And I have a personal calendar named "Work" with the color "blue"
    When I open the agenda view for 2026-11-18 at a phone width of 375 pixels
    Then the page has no horizontal scroll

  @wip
  Scenario: Anna sees the Monday to Sunday week with her events in their columns at phone width
    Given I am a user with a family named "The Smiths"
    And I have a personal calendar named "Work" with the color "blue"
    And the event "Monday review" is in "Work" from 2026-11-16 09:00 to 09:30 in UTC
    And the event "Sunday call" is in "Work" from 2026-11-22 18:00 to 18:30 in UTC
    When I open the week view for 2026-11-18 at a phone width of 375 pixels
    Then I see seven day columns from Monday 2026-11-16 to Sunday 2026-11-22
    And I see the event "Monday review" in the Monday column
    And I see the event "Sunday call" in the Sunday column
    And the page has no horizontal scroll

  @wip
  Scenario: Anna sees the days of the month and taps a day to see its events in the sheet
    Given I am a user with a family named "The Smiths"
    And I have a personal calendar named "Work" with the color "blue"
    And the event "Standup" is in "Work" from 2026-11-18 09:00 to 09:30 in UTC
    When I open the month view for 2026-11-12 at a phone width of 375 pixels
    And I tap the day 2026-11-18
    Then I see the event "Standup" in the day sheet
