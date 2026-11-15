# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:calendar @ui
Feature: Event details

  A signed-in person opens an event from any calendar view to see its
  details. An owner or a family editor can change or delete the event
  after confirming. A guest sees the event read-only.

  Scenario: Anna opens her personal event from the agenda and sees its details
    Given I am a user with a family named "The Smiths"
    And I have a personal calendar named "Studio" with the color "teal"
    And I have a timed event named "Studio review" on the calendar "Studio"
    When I open the event "Studio review" from the agenda
    Then I see the details of the event "Studio review"

  Scenario: Anna opens an event from the day, week and month views and sees its details
    Given I am a user with a family named "The Smiths"
    And I have a personal calendar named "Studio" with the color "teal"
    And I have a timed event named "Studio review" on the calendar "Studio"
    When I open the event "Studio review" from the day view
    Then I see the details of the event "Studio review"
    When I open the event "Studio review" from the week view
    Then I see the details of the event "Studio review"
    When I open the event "Studio review" from the month view
    Then I see the details of the event "Studio review"

  Scenario: Anna edits the title of her event and sees the new title in the agenda
    Given I am a user with a family named "The Smiths"
    And I have a personal calendar named "Studio" with the color "teal"
    And I have a timed event named "Studio review" on the calendar "Studio"
    When I open the event "Studio review" from the agenda
    And I change the title of the event to "Studio retro"
    Then I see the details of the event "Studio retro"
    When I close the event details
    Then I see the event "Studio retro" in the agenda

  Scenario: Anna deletes her event after confirming and the event is gone from the agenda
    Given I am a user with a family named "The Smiths"
    And I have a personal calendar named "Studio" with the color "teal"
    And I have a timed event named "Studio review" on the calendar "Studio"
    When I open the event "Studio review" from the agenda
    And I delete the event after confirming
    Then I do not see the event "Studio review" in the agenda

  Scenario: Anna cancels the delete confirmation and the event stays
    Given I am a user with a family named "The Smiths"
    And I have a personal calendar named "Studio" with the color "teal"
    And I have a timed event named "Studio review" on the calendar "Studio"
    When I open the event "Studio review" from the agenda
    And I cancel the delete confirmation
    Then I see the details of the event "Studio review"
    When I close the event details
    Then I see the event "Studio review" in the agenda

  Scenario: A family editor edits an event in a family calendar from its details
    Given I am a user with a family named "The Smiths"
    And the family has a calendar named "Family" with the color "teal"
    And the family has a timed event named "Dinner" on the calendar "Family"
    When I open the event "Dinner" from the agenda
    And I change the title of the event to "Family dinner"
    Then I see the details of the event "Family dinner"

  Scenario: A family editor deletes an event in a family calendar after confirming
    Given I am a user with a family named "The Smiths"
    And the family has a calendar named "Family" with the color "teal"
    And the family has a timed event named "Dinner" on the calendar "Family"
    When I open the event "Dinner" from the agenda
    And I delete the event after confirming
    Then I do not see the event "Dinner" in the agenda

  Scenario: Ben, a guest, sees an event he was invited to read-only
    Given I am a user with a family named "The Smiths"
    And Ben joins the family "The Smiths" as a guest
    And I have a personal calendar named "Studio" with the color "teal"
    And Ben is invited as a guest to a timed event named "Picnic" on the calendar "Studio"
    And I sign in as Ben
    When I open the event "Picnic" from the agenda
    Then I see the details of the event "Picnic"
    And I see the read-only line for the event
    And I see no edit or delete control for the event

  Scenario: Anna cannot save an event that ends before it starts from the edit form
    Given I am a user with a family named "The Smiths"
    And I have a personal calendar named "Studio" with the color "teal"
    And I have a timed event named "Studio review" on the calendar "Studio"
    When I open the event "Studio review" from the agenda
    And I set the end time before the start time
    Then I see the message "The event must not end before it starts"

  Scenario: Opening an event that no longer exists shows the not-found text
    Given I am a user with a family named "The Smiths"
    When I open an event that no longer exists
    Then I see the message "This event is no longer available."

  Scenario: The details show as a dialog at desktop width and as a full page at phone width
    Given I am a user with a family named "The Smiths"
    And I have a personal calendar named "Studio" with the color "teal"
    And I have a timed event named "Studio review" on the calendar "Studio"
    When I open the event "Studio review" from the agenda on a desktop
    Then I see the event details as a dialog over the calendar
    When I open the event "Studio review" from the agenda on a phone
    Then I see the event details at phone width without horizontal scroll

  Scenario: Anna sees her events in every calendar view
    Given I am a user with a family named "The Smiths"
    And I have a personal calendar named "Studio" with the color "teal"
    And I have a timed event named "Studio review" on the calendar "Studio"
    And I have a 30-minute timed event named "Quick sync" on the calendar "Studio"
    When I look at the calendar in every view
    Then I see the event "Studio review" in the agenda
