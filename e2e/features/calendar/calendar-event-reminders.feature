# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:calendar @ui
Feature: Event reminders

  A person sets their own reminders for an event in the event form. Each
  reminder is a number and a unit, up to five per event, and counts back from
  the start of the event. Nobody sees another person's reminders. A guest, who
  cannot edit the event, sets their own reminders from the event details.

  Scenario Outline: I add a reminder when I create an event
    Given I am a user with a family named "The Smiths"
    And I have a personal calendar named "Studio" with the color "teal"
    When I create an event named "Studio review" with a reminder of <amount> <unit>
    And I open the event "Studio review" for editing from the agenda
    Then I see the reminder "<amount> <unit>" in the event form

    @smoke
    Examples:
      | amount | unit    |
      | 15     | minutes |

    Examples:
      | amount | unit  |
      | 2      | hours |
      | 1      | day   |

  Scenario: I change a reminder of an existing event
    Given I am a user with a family named "The Smiths"
    And I have a personal calendar named "Studio" with the color "teal"
    And I have a timed event named "Studio review" on the calendar "Studio" with a reminder of 15 minutes
    When I open the event "Studio review" from the agenda
    And I change the reminder of the event to 1 day
    And I open the event "Studio review" for editing from the agenda
    Then I see the reminder "1 day" in the event form

  Scenario: I remove a reminder from an existing event
    Given I am a user with a family named "The Smiths"
    And I have a personal calendar named "Studio" with the color "teal"
    And I have a timed event named "Studio review" on the calendar "Studio" with a reminder of 15 minutes
    When I open the event "Studio review" from the agenda
    And I remove the reminder of the event
    And I open the event "Studio review" for editing from the agenda
    Then I see no reminders in the event form

  Scenario: I cannot add a sixth reminder
    Given I am a user with a family named "The Smiths"
    And I have a personal calendar named "Studio" with the color "teal"
    When I open the new event modal and add 5 reminders
    Then I cannot add another reminder

  Scenario: I cannot save two reminders at the same time
    Given I am a user with a family named "The Smiths"
    And I have a personal calendar named "Studio" with the color "teal"
    When I try to save an event named "Studio review" with reminders of 1 hour and 60 minutes
    Then I see the message "You already have a reminder at this time."
    And no event named "Studio review" is listed

  Scenario: I cannot save a reminder longer than 4 weeks before the event
    Given I am a user with a family named "The Smiths"
    And I have a personal calendar named "Studio" with the color "teal"
    When I try to save an event named "Studio review" with a reminder of 5 weeks
    Then I see the message "Use at most 4 weeks (40320 minutes)."
    And no event named "Studio review" is listed

  Scenario: I do not see a reminder that another person set on the same event
    Given I am a user with a family named "The Smiths"
    And Ben joins the family "The Smiths" as a guest
    And I have a personal calendar named "Studio" with the color "teal"
    And Ben is invited as a guest to a timed event named "Picnic" on the calendar "Studio"
    And I have a reminder of 15 minutes on the event "Picnic"
    And Ben has a reminder of 30 minutes on the event "Picnic"
    When I open the event "Picnic" for editing from the agenda
    Then I see the reminder "15 minutes" in the event form
    And I do not see the reminder "30 minutes" in the event form

  Scenario: As a read-only guest I set my own reminder from the event details
    Given I am a user with a family named "The Smiths"
    And Ben joins the family "The Smiths" as a guest
    And I have a personal calendar named "Studio" with the color "teal"
    And Ben is invited as a guest to a timed event named "Picnic" on the calendar "Studio"
    And I sign in as Ben
    When I open the event "Picnic" from the agenda
    And I save a reminder of 30 minutes from the event details
    And I open the event "Picnic" from the agenda
    Then I see the reminder "30 minutes" in the event details

  Scenario: The reminder controls fit at phone width
    Given I am a user with a family named "The Smiths"
    And I have a personal calendar named "Studio" with the color "teal"
    When I open the new event modal on a phone and add a reminder
    Then I see the reminder controls at phone width without horizontal scroll

  Scenario: I see the reminder controls in the new event modal on a desktop
    Given I am a user with a family named "The Smiths"
    And I have a personal calendar named "Studio" with the color "teal"
    When I open the new event modal on a desktop and add a reminder
    Then I see the reminder controls in the new event modal

  @a11y
  Scenario: I add and remove a reminder with the keyboard only
    Given I am a user with a family named "The Smiths"
    And I have a personal calendar named "Studio" with the color "teal"
    When I add a reminder and then remove it using only the keyboard
    Then I see no reminders in the event form
    And the focus is on the add reminder control
