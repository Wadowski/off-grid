# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:notifications @wip
Feature: Notifications popover on a desktop

  On a wide screen the bell opens a popover under the bell with the latest notices.
  The popover filters, marks notices read and links to the full notifications page.

  @ui @screen:notifications-popover
  Scenario: Bell opens the notifications popover with the latest notices
    Given Anna is signed in
    And Anna belongs to a family of her own
    And she has 3 unread inbox items
    When Anna opens the notifications popover from the bell on a desktop screen
    Then the notifications popover lists her 3 latest notices

  Scenario: The notifications popover lists at most five notices
    Given Anna is signed in
    And Anna belongs to a family of her own
    And she has 7 unread inbox items
    When Anna opens the notifications popover from the bell on a desktop screen
    Then the notifications popover lists her 5 latest notices

  Scenario: The notifications popover offers the four filters
    Given Anna is signed in
    And Anna belongs to a family of her own
    And she has 3 unread inbox items
    When Anna opens the notifications popover from the bell on a desktop screen
    Then the notifications popover offers the filters "All", "Unread", "Calendar" and "Account & security"

  @ui @screen:notifications-popover-empty
  Scenario: The notifications popover says there is nothing to show when she has no notices
    Given Anna is signed in
    And Anna belongs to a family of her own
    When Anna opens the notifications popover from the bell on a desktop screen
    Then the notifications popover tells her she is all caught up

  Scenario: Filtering the notifications popover by calendar lists only calendar notices
    Given Anna is signed in
    And Tom and Anna share a family
    And she has 1 unread calendar invitations from Tom
    And she has a password change notice
    When Anna opens the notifications popover from the bell on a desktop screen
    And Anna selects the "Calendar" filter in the notifications popover
    Then only the calendar notice is listed in the notifications popover
    And the password change notice is not listed in the notifications popover

  Scenario: Marking all as read in the notifications popover clears the unread count
    Given Anna is signed in
    And Anna belongs to a family of her own
    And she has 2 unread inbox items
    When Anna opens the notifications popover from the bell on a desktop screen
    And Anna marks all notices as read in the notifications popover
    Then the notifications popover shows no unread notices
    And the bell shows no unread count

  Scenario: The notifications popover links to the full notifications page
    Given Anna is signed in
    And Anna belongs to a family of her own
    When Anna opens the notifications popover from the bell on a desktop screen
    And Anna chooses to view all notifications from the notifications popover
    Then the full notifications page is shown

  Scenario: The Escape key dismisses the notifications popover and returns focus to the bell
    Given Anna is signed in
    And Anna belongs to a family of her own
    When Anna opens the notifications popover from the bell on a desktop screen
    And Anna dismisses the notifications popover with the Escape key
    Then the notifications popover is closed
    And the bell has focus

  Scenario: A click outside dismisses the notifications popover
    Given Anna is signed in
    And Anna belongs to a family of her own
    When Anna opens the notifications popover from the bell on a desktop screen
    And Anna clicks outside the notifications popover
    Then the notifications popover is closed
