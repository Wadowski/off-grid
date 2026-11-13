# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:calendar
Feature: Event guests

  The host of a personal event invites a family member as a guest. A guest
  sees that one event, read-only, in their own calendar views. A guest cannot
  change, delete or invite others to the event, and sees nothing else from the
  host's calendar. Each invite tells the guest through their inbox.

  Scenario: A guest reads the invited event read-only
    Given Anna is signed in
    And Anna and Ben are both members of the family "Home"
    And Anna has a personal calendar named "Work"
    And Anna has an event "Review" in "Work" from 2026-11-20 10:00 to 11:00 in UTC at "Room 4"
    When Anna invites Ben to the event "Review"
    Then Ben can read the event "Review" from 10:00 to 11:00 UTC on 2026-11-20
    And the event "Review" is read-only for Ben
    And the event "Review" shows the location "Room 4" and the calendar name "Work" to Ben

  Scenario: An uninvited family member cannot read the event
    Given Anna is signed in
    And Anna and Ben are both members of the family "Home"
    And Anna has a personal calendar named "Work"
    And Anna has an event "Review" in "Work" from 2026-11-20 10:00 to 11:00 in UTC
    When Ben reads the event "Review"
    Then Ben cannot see the event "Review"

  Scenario: A guest cannot edit the invited event
    Given Anna is signed in
    And Anna and Ben are both members of the family "Home"
    And Anna has a personal calendar named "Work"
    And Anna has an event "Review" in "Work" from 2026-11-20 10:00 to 11:00 in UTC
    And Anna has invited Ben to the event "Review"
    When Ben renames the event "Review" to "Changed"
    Then Ben is told the change is not allowed
    And the event "Review" is still stored with the title "Review"

  Scenario: A guest cannot delete the invited event
    Given Anna is signed in
    And Anna and Ben are both members of the family "Home"
    And Anna has a personal calendar named "Work"
    And Anna has an event "Review" in "Work" from 2026-11-20 10:00 to 11:00 in UTC
    And Anna has invited Ben to the event "Review"
    When Ben deletes the event "Review"
    Then Ben is told the change is not allowed
    And the event "Review" is still stored with the title "Review"

  Scenario: A guest cannot invite another guest to the event
    Given Anna is signed in
    And Anna and Ben are both members of the family "Home"
    And Anna and Cara are both members of the family "Home"
    And Anna has a personal calendar named "Work"
    And Anna has an event "Review" in "Work" from 2026-11-20 10:00 to 11:00 in UTC
    And Anna has invited Ben to the event "Review"
    When Ben invites Cara to the event "Review"
    Then Ben is told the change is not allowed

  Scenario: A guest sees only the invited event from the host's calendar
    Given Anna is signed in
    And Anna and Ben are both members of the family "Home"
    And Anna has a personal calendar named "Work"
    And Anna has an event "Review" in "Work" from 2026-11-20 10:00 to 11:00 in UTC
    And Anna has an event "Private call" in "Work" from 2026-11-20 12:00 to 13:00 in UTC
    And Anna has invited Ben to the event "Review"
    When Ben lists the events of the calendar "Work"
    Then the list contains the event "Review"
    And the list does not contain the event "Private call"

  Scenario: An invite creates one inbox item for the guest
    Given Anna is signed in
    And Anna and Ben are both members of the family "Home"
    And Anna has a personal calendar named "Work"
    And Anna has an event "Review" in "Work" from 2026-11-20 10:00 to 11:00 in UTC
    When Anna invites Ben to the event "Review"
    Then Ben has one inbox item of type "event-invited" that names the event "Review"

  Scenario: A repeated invite creates no second inbox item
    Given Anna is signed in
    And Anna and Ben are both members of the family "Home"
    And Anna has a personal calendar named "Work"
    And Anna has an event "Review" in "Work" from 2026-11-20 10:00 to 11:00 in UTC
    And Anna has invited Ben to the event "Review"
    When Anna invites Ben to the event "Review" again
    Then Ben has one inbox item of type "event-invited" that names the event "Review"

  Scenario: Anna cannot invite a user who shares no family with her
    Given Anna is signed in
    And Anna has a personal calendar named "Work"
    And Anna has an event "Review" in "Work" from 2026-11-20 10:00 to 11:00 in UTC
    And Dana has an account in no family shared with Anna
    When Anna invites Dana to the event "Review"
    Then the invite is refused
    And Dana has no inbox item of type "event-invited"

  Scenario: Anna cannot invite a family member to a family event
    Given Anna is signed in
    And Anna and Ben are both members of the family "Home"
    And the family "Home" has a calendar named "Kitchen"
    And the family "Home" has an event "Dinner" in "Kitchen" from 2026-11-20 18:00 to 19:00 in UTC
    When Anna invites Ben to the event "Dinner"
    Then the invite is refused

  Scenario: Anna cannot invite a guest to an event she cannot see
    Given Anna is signed in
    And Anna and Ben are both members of the family "Home"
    And Ben has a personal calendar named "Personal"
    And Ben has an event "Private call" in "Personal" from 2026-11-20 12:00 to 13:00 in UTC
    When Anna invites Ben to the event "Private call"
    Then Anna is told the event is not found
