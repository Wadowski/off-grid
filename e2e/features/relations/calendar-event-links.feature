# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:relations
Feature: Links to calendar events

  A person who can see a calendar event can link another item to it, and see
  the event's current title wherever the link is listed. A link never reveals
  an event that the person cannot see.

  @wip
  Scenario: I link one of my events to another event and see its title
    Given Anna is signed in
    And Anna and Ben are both members of the family "Home"
    And Anna has an event "Dentist" in a family calendar of "Home"
    And Anna has an event "Plan week" in a family calendar of "Home"
    When Anna links the event "Plan week" to the event "Dentist"
    Then Anna sees the link to "Dentist" in the links of "Plan week"

  @wip
  Scenario: I unlink an event and the link is gone
    Given Anna is signed in
    And Anna and Ben are both members of the family "Home"
    And Anna has an event "Dentist" in a family calendar of "Home"
    And Anna has an event "Plan week" in a family calendar of "Home"
    And Anna has linked the event "Plan week" to the event "Dentist"
    When Anna removes the link between "Plan week" and "Dentist"
    Then Anna sees no links in the links of "Plan week"

  @wip
  Scenario: I rename an event and the link shows the new title
    Given Anna is signed in
    And Anna and Ben are both members of the family "Home"
    And Anna has an event "Dentist" in a family calendar of "Home"
    And Anna has an event "Plan week" in a family calendar of "Home"
    And Anna has linked the event "Plan week" to the event "Dentist"
    When Anna renames the event "Dentist" to "Orthodontist"
    Then Anna sees the link to "Orthodontist" in the links of "Plan week"

  @wip
  Scenario: I delete an event and the link disappears
    Given Anna is signed in
    And Anna and Ben are both members of the family "Home"
    And Anna has an event "Dentist" in a family calendar of "Home"
    And Anna has an event "Plan week" in a family calendar of "Home"
    And Anna has linked the event "Plan week" to the event "Dentist"
    When Anna deletes the event "Dentist"
    Then Anna sees no links in the links of "Plan week"

  @wip
  Scenario: Someone from another family cannot link to my event or see its links
    Given Anna is signed in
    And Anna and Ben are both members of the family "Home"
    And Cara belongs to a family of her own
    And Anna has an event "Dentist" in a family calendar of "Home"
    When Cara tries to link her own event to the event "Dentist"
    Then Cara is told the event cannot be found
    And Cara sees no links in the links of "Dentist"

  @wip
  Scenario: A family member cannot link to my private event
    Given Anna is signed in
    And Anna and Ben are both members of the family "Home"
    And Anna has a personal calendar named "Work"
    And Anna has an event "Private review" in "Work" from 2026-11-20 10:00 to 11:00 in UTC
    When Ben tries to link his own event to the event "Private review"
    Then Ben is told the event cannot be found

  @wip
  Scenario: A guest I invited can link to my event
    Given Anna is signed in
    And Anna and Ben are both members of the family "Home"
    And Anna has a personal calendar named "Work"
    And Anna has an event "Review" in "Work" from 2026-11-20 10:00 to 11:00 in UTC
    And Anna has invited Ben to the event "Review"
    When Ben links his own event "Notes" to the event "Review"
    Then Ben sees the link to "Review" in the links of "Notes"

  @wip
  Scenario: A former family member can no longer see links to an event they were invited to
    Given Anna is signed in
    And Anna and Ben are both members of the family "Home"
    And Anna has a personal calendar named "Work"
    And Anna has an event "Review" in "Work" from 2026-11-20 10:00 to 11:00 in UTC
    And Anna has invited Ben to the event "Review"
    And Ben has linked his own event "Notes" to the event "Review"
    When Ben leaves the family "Home"
    Then Ben cannot see the links in the links of "Notes"
