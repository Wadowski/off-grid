# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:calendar @ui
Feature: Event guests in the calendar screens

  The host of a personal event chooses family members as guests in the new
  and edit event modals. A guest sees the event read-only in the details
  view, with the other guests listed, and cannot change them.

  Scenario: Anna invites Ben from the new event modal and Ben sees the event read-only
    Given I am a user with a family named "The Smiths"
    And Ben joins the family "The Smiths" as a guest
    And I have a personal calendar named "Studio" with the color "teal"
    When I create a timed event named "Studio review" on the calendar "Studio" inviting Ben from the new event modal
    And I sign in as Ben
    And I open the event "Studio review" from the agenda
    Then I see the details of the event "Studio review"
    And I see the guests section listing Ben
    And I see no edit or delete control for the event

  Scenario: Anna adds and removes a guest from the edit form
    Given I am a user with a family named "The Smiths"
    And Ben joins the family "The Smiths" as a guest
    And I have a personal calendar named "Studio" with the color "teal"
    And I have a timed event named "Studio review" on the calendar "Studio" with Ben as a guest
    When I open the event "Studio review" from the agenda
    And I open the edit form of the event
    Then I see Ben selected as a guest
    When I remove Ben from the guests and save the event
    Then I see the guests section without Ben

  Scenario: The guest field is unavailable for a family calendar
    Given I am a user with a family named "The Smiths"
    And the family has a calendar named "Family" with the color "teal"
    When I open the new event modal from the calendar sidebar on a desktop
    And I choose the calendar "Family" in the new event modal
    Then I see the guest field is unavailable with the hint "Guests can only be invited to personal events."

  Scenario: A guest sees the other guests but cannot change them
    Given I am a user with a family named "The Smiths"
    And Ben joins the family "The Smiths" as a guest
    And Cara joins the family "The Smiths" as a guest
    And I have a personal calendar named "Studio" with the color "teal"
    And I have a timed event named "Studio review" on the calendar "Studio" with Ben and Cara as guests
    And I sign in as Ben
    When I open the event "Studio review" from the agenda
    Then I see the guests section listing Cara
    And I see no edit or delete control for the event

  Scenario: Anna sees an error when a guest cannot be invited
    Given I am a user with a family named "The Smiths"
    And Ben joins the family "The Smiths" as a guest
    And I have a personal calendar named "Studio" with the color "teal"
    When I create a timed event named "Studio review" on the calendar "Studio" inviting Ben while the invite fails
    Then I see the message "Event saved, but some guests could not be invited. Try again."
    And the event "Studio review" is saved on the calendar "Studio"
