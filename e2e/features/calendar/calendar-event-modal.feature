# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:calendar @ui
Feature: New event modal

  A signed-in person creates a calendar event in a modal. The modal opens
  over the calendar, from the desktop sidebar or the phone footer, and it
  can also be opened directly from its own page. Closing the modal
  without saving discards what was entered.

  Scenario: I open the new event modal from the desktop sidebar
    Given I am a user with a family named "The Smiths"
    And I have a personal calendar named "Studio" with the color "teal"
    When I open the new event modal from the calendar sidebar on a desktop
    Then I see the new event modal over the calendar

  Scenario: I open the new event modal from the phone footer
    Given I am a user with a family named "The Smiths"
    When I open the new event modal from the calendar footer on a phone
    Then I see the new event modal at phone width

  Scenario: I close the new event modal without saving and no event is stored
    Given I am a user with a family named "The Smiths"
    And I have a personal calendar named "Studio" with the color "teal"
    And I open the new event modal from the calendar sidebar on a desktop
    When I type "Team lunch" as the event title
    And I close the new event modal without saving
    Then I see the agenda view
    And no event named "Team lunch" is listed

  Scenario: I save an event and see it in the agenda
    Given I am a user with a family named "The Smiths"
    And I have a personal calendar named "Studio" with the color "teal"
    When I create a timed event named "Studio review" on the calendar "Studio" from the new event modal
    Then I see the saved event "Studio review" in the agenda without a reload

  Scenario: I open the new event page directly and see the modal over the agenda
    Given I am a user with a family named "The Smiths"
    When I open the new event page directly
    Then I see the new event modal over the agenda view

  Scenario: I cannot save an event that ends before it starts
    Given I am a user with a family named "The Smiths"
    And I have a personal calendar named "Studio" with the color "teal"
    When I try to save an event named "Studio review" that ends before it starts
    Then I see the message "The event must not end before it starts"
    And no event named "Studio review" is listed
