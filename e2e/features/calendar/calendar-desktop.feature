# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:calendar @ui
Feature: Desktop calendar sidebar and agenda

  On a desktop screen a signed-in person sees her calendars in a sidebar
  beside the agenda. She shows or hides a calendar with its checkbox, and
  the agenda follows at once. The sidebar never changes the view or the
  selected date.

  @smoke
  Scenario: Anna sees each of her calendars in the sidebar with a show checkbox
    Given I am a user with a family named "The Smiths"
    And I have a personal calendar named "Work" with the color "blue"
    And I have a personal calendar named "Home" with the color "green"
    When I open the agenda view for 2026-11-18 at a desktop width of 1280 pixels
    Then I see "Work" in the calendar sidebar with a checked show checkbox
    And I see "Home" in the calendar sidebar with a checked show checkbox

  Scenario: Anna hides a calendar from the sidebar and its events leave the agenda without a page change
    Given I am a user with a family named "The Smiths"
    And I have a personal calendar named "Work" with the color "blue"
    And I have a personal calendar named "Home" with the color "green"
    And the event "Standup" is in "Work" from 2026-11-18 09:00 to 09:30 in UTC
    And the event "Dinner" is in "Home" from 2026-11-18 18:00 to 19:00 in UTC
    When I open the agenda view for 2026-11-18 at a desktop width of 1280 pixels
    And I hide the calendar "Work" in the calendar sidebar
    Then I do not see the event "Standup" in the agenda
    And I see the event "Dinner" in the agenda
    And the agenda still shows the day 2026-11-18

  Scenario: Anna shows a hidden calendar again and its events return
    Given I am a user with a family named "The Smiths"
    And I have a personal calendar named "Work" with the color "blue"
    And the event "Standup" is in "Work" from 2026-11-18 09:00 to 09:30 in UTC
    When I open the agenda view for 2026-11-18 at a desktop width of 1280 pixels
    And I hide the calendar "Work" in the calendar sidebar
    And I show the calendar "Work" in the calendar sidebar
    Then I see the event "Standup" in the agenda
    And the calendar "Work" is checked in the calendar sidebar

  Scenario: A hidden calendar stays hidden when Anna switches to the week view
    Given I am a user with a family named "The Smiths"
    And I have a personal calendar named "Work" with the color "blue"
    And the event "Standup" is in "Work" from 2026-11-18 09:00 to 09:30 in UTC
    When I open the agenda view for 2026-11-18 at a desktop width of 1280 pixels
    And I hide the calendar "Work" in the calendar sidebar
    And I choose the week view in the view selector
    Then the calendar "Work" is unchecked in the calendar sidebar
    And I do not see the event "Standup" in the week grid

  Scenario: A hidden calendar stays hidden after Anna reloads the page
    Given I am a user with a family named "The Smiths"
    And I have a personal calendar named "Work" with the color "blue"
    And the event "Standup" is in "Work" from 2026-11-18 09:00 to 09:30 in UTC
    When I open the agenda view for 2026-11-18 at a desktop width of 1280 pixels
    And I hide the calendar "Work" in the calendar sidebar
    And I reload the page
    Then the calendar "Work" is unchecked in the calendar sidebar
    And I do not see the event "Standup" in the agenda

  Scenario: Moving to the next and previous week keeps the agenda view and the hidden calendars
    Given I am a user with a family named "The Smiths"
    And I have a personal calendar named "Work" with the color "blue"
    And I have a personal calendar named "Home" with the color "green"
    And the event "Standup" is in "Work" from 2026-11-25 09:00 to 09:30 in UTC
    And the event "Dinner" is in "Home" from 2026-11-25 18:00 to 19:00 in UTC
    When I open the agenda view for 2026-11-18 at a desktop width of 1280 pixels
    And I hide the calendar "Work" in the calendar sidebar
    And I move to the next week in the agenda
    Then the agenda shows the day 2026-11-25
    And I see the event "Dinner" in the agenda
    And I do not see the event "Standup" in the agenda
    When I move to the previous week in the agenda
    Then the agenda shows the day 2026-11-18
    And the calendar "Work" is unchecked in the calendar sidebar

  Scenario: Showing or hiding a calendar does not change the selected date or the view
    Given I am a user with a family named "The Smiths"
    And I have a personal calendar named "Work" with the color "blue"
    When I open the agenda view for 2026-11-18 at a desktop width of 1280 pixels
    And I hide the calendar "Work" in the calendar sidebar
    And I show the calendar "Work" in the calendar sidebar
    Then the agenda still shows the day 2026-11-18
    And I see the agenda view

  Scenario: Anna opens the calendar management page from the sidebar
    Given I am a user with a family named "The Smiths"
    And I have a personal calendar named "Work" with the color "blue"
    When I open the agenda view for 2026-11-18 at a desktop width of 1280 pixels
    And I choose "Manage" in the calendar sidebar
    Then I see the calendars list with "Work"

  Scenario: Anna selects a day in the mini month and the agenda moves to that day
    Given I am a user with a family named "The Smiths"
    And I have a personal calendar named "Work" with the color "blue"
    And the event "Board review" is in "Work" from 2026-11-20 10:00 to 11:00 in UTC
    When I open the agenda view for 2026-11-18 at a desktop width of 1280 pixels
    And I select 2026-11-20 in the mini month
    Then the agenda shows the day 2026-11-20
    And I see the event "Board review" in the agenda

  @ui
  Scenario: The desktop calendar layout has no horizontal scroll at 1280 pixels and at 375 pixels
    Given I am a user with a family named "The Smiths"
    And I have a personal calendar named "Work" with the color "blue"
    When I open the agenda view for 2026-11-18 at a desktop width of 1280 pixels
    Then the page has no horizontal scroll
    When I open the agenda view for 2026-11-18 at a phone width of 375 pixels
    Then the page has no horizontal scroll

  @a11y @ui
  Scenario: The desktop calendar sidebar and agenda have no serious accessibility violations in light and dark theme
    Given I am a user with a family named "The Smiths"
    And I have a personal calendar named "Work" with the color "blue"
    And the event "Standup" is in "Work" from 2026-11-18 09:00 to 09:30 in UTC
    When I open the agenda view for 2026-11-18 at a desktop width of 1280 pixels
    Then the page has no serious accessibility violations in the light theme
    And the page has no serious accessibility violations in the dark theme

  Scenario: Anna still sees every calendar when the browser blocks saved preferences
    Given I am a user with a family named "The Smiths"
    And I have a personal calendar named "Work" with the color "blue"
    And I have a personal calendar named "Home" with the color "green"
    And the event "Standup" is in "Work" from 2026-11-18 09:00 to 09:30 in UTC
    And the browser blocks saved preferences
    When I open the agenda view for 2026-11-18 at a desktop width of 1280 pixels
    Then the calendar "Work" is checked in the calendar sidebar
    And the calendar "Home" is checked in the calendar sidebar
    And I see the event "Standup" in the agenda
