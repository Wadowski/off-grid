# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:calendar @ui
Feature: Desktop calendar day view

  On a desktop screen the day view opens with the full date above the
  timeline, beside the controls to move between days and the view
  selector. The calendar sidebar stays beside it, and New Event stays
  in the bar at the bottom of the screen.

  @smoke
  Scenario: Anna sees the full date, the previous, Today and next controls and the view selector at desktop width
    Given I am a user with a family named "The Smiths"
    And I have a personal calendar named "Work" with the color "blue"
    When I open the day view for 2026-11-18 at a desktop width of 1280 pixels
    Then I see the day heading "Wednesday, November 18"
    And I see the controls "Previous", "Today" and "Next" in the day command row
    And I see the view selector in the day command row

  Scenario: Anna moves to the next and previous day and the heading follows
    Given I am a user with a family named "The Smiths"
    And I have a personal calendar named "Work" with the color "blue"
    When I open the day view for 2026-11-18 at a desktop width of 1280 pixels
    And I choose the next period in the day command row
    Then I see the day heading "Thursday, November 19"
    When I choose the previous period in the day command row
    And I choose the previous period in the day command row
    Then I see the day heading "Tuesday, November 17"

  Scenario: The desktop day view has no horizontal scroll at desktop and phone width
    Given I am a user with a family named "The Smiths"
    And I have a personal calendar named "Work" with the color "blue"
    When I open the day view for 2026-11-18 at a desktop width of 1280 pixels
    Then the day timeline is shown
    And the page has no horizontal scroll
    When I open the day view for 2026-11-18 at a phone width of 375 pixels
    Then the day timeline is shown
    And the page has no horizontal scroll

  Scenario: Anna sees the event "Standup" as a block with its calendar colour, its time range and its location
    Given I am a user with a family named "The Smiths"
    And I have a personal calendar named "Work" with the color "blue"
    And the event "Standup" is in "Work" at "Kitchen" from 2026-11-18 09:00 to 09:30 in UTC
    When I open the day view for 2026-11-18 at a desktop width of 1280 pixels
    Then I see the event "Standup" as a block with the calendar colour "blue"
    And I see the time range "09:00 AM - 09:30 AM" and the location "Kitchen" on the event "Standup"

  @a11y
  Scenario: The desktop day view has no serious accessibility violations in light and dark theme
    Given I am a user with a family named "The Smiths"
    And I have a personal calendar named "Work" with the color "blue"
    When I check the desktop day view for accessibility in light and dark theme
    Then no serious accessibility violations are found

  Scenario: New Event stays in the fixed bar at the bottom of the desktop day view
    Given I am a user with a family named "The Smiths"
    When I open the day view for 2026-11-18 at a desktop width of 1280 pixels
    Then the "New Event" action is fixed at the bottom of the screen
