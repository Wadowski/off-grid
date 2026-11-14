# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:calendar @ui
Feature: Desktop calendar month view

  A signed-in person reads her month on a desktop screen as a grid of
  days. Each day lists its events, including multi-day events on every
  day they span. The view shows only the events of the calendars she can
  access, in her own time zone.

  Scenario: Anna opens the desktop month view and sees every day of the month with her events
    Given I am a user with a family named "The Smiths"
    And I have a personal calendar named "Work" with the color "blue"
    And the event "Standup" is in "Work" from 2026-11-18 09:00 to 09:30 in UTC
    When I open the month view for 2026-11-18 at a desktop width of 1280 pixels
    Then I see the days of November 2026 in the month grid
    And I see the event "Standup" on 2026-11-18 in the month grid

  Scenario: A multi-day event appears on each day it spans inside the month
    Given I am a user with a family named "The Smiths"
    And I have a personal calendar named "Work" with the color "blue"
    And the event "Retreat" is in "Work" from 2026-11-10 all day to 2026-11-12 all day in UTC
    When I open the month view for 2026-11-18 at a desktop width of 1280 pixels
    Then I see the event "Retreat" on 2026-11-10
    And I see the event "Retreat" on 2026-11-11
    And I see the event "Retreat" on 2026-11-12
    And I do not see the event "Retreat" on 2026-11-13

  Scenario: A multi-day event that started before the month appears only on the days of the month it covers
    Given I am a user with a family named "The Smiths"
    And I have a personal calendar named "Work" with the color "blue"
    And the event "Lodge" is in "Work" from 2026-10-30 all day to 2026-11-02 all day in UTC
    When I open the month view for 2026-11-18 at a desktop width of 1280 pixels
    Then I see the event "Lodge" on 2026-11-01
    And I see the event "Lodge" on 2026-11-02
    And I do not see the event "Lodge" on 2026-11-03

  Scenario: A day with more events than fit shows the number of further events and opens that day
    Given I am a user with a family named "The Smiths"
    And I have a personal calendar named "Work" with the color "blue"
    And the events "Call 1", "Call 2", "Call 3" and "Call 4" are in "Work" on 2026-11-18
    When I open the month view for 2026-11-18 at a desktop width of 1280 pixels
    Then I see the text "+2 more events" on 2026-11-18
    When I choose "+2 more events" on 2026-11-18
    Then I see the day view for 2026-11-18

  Scenario: Each event chip is named by its title and start time
    Given I am a user with a family named "The Smiths"
    And I have a personal calendar named "Work" with the color "blue"
    And the event "Standup" is in "Work" from 2026-11-18 09:00 to 09:30 in UTC
    When I open the month view for 2026-11-18 at a desktop width of 1280 pixels
    Then the event "Standup" in the month grid is named "Standup, 09:00 AM"

  Scenario: The desktop month view has no horizontal scroll at 1280 pixels
    Given I am a user with a family named "The Smiths"
    When I open the month view for 2026-11-18 at a desktop width of 1280 pixels
    Then the page does not scroll horizontally

  @a11y
  Scenario: The desktop month view has no serious accessibility violations in the light and dark theme
    Given I am a user with a family named "The Smiths"
    When I open the month view for 2026-11-18 at a desktop width of 1280 pixels in the light theme
    Then the page has no serious accessibility violations
    When I open the month view for 2026-11-18 at a desktop width of 1280 pixels in the dark theme
    Then the page has no serious accessibility violations

  Scenario: Anna reaches each day and each event with the keyboard and opens a day with Enter
    Given I am a user with a family named "The Smiths"
    And I have a personal calendar named "Work" with the color "blue"
    And the event "Standup" is in "Work" from 2026-11-18 09:00 to 09:30 in UTC
    When I open the month view for 2026-11-18 at a desktop width of 1280 pixels
    And I move the focus with the Tab key to the day 2026-11-18
    And I move the focus with the Tab key to the event "Standup" in the month grid
    Then the event "Standup" in the month grid has focus
    When I move the focus with the Tab key to the day 2026-11-18
    And I press Enter
    Then I see the day view for 2026-11-18
