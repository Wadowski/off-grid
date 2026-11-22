# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:notifications
Feature: Notifications modal on a phone

  On a phone the bell opens a sheet with the latest notices instead of a popover.
  The sheet filters, marks notices read and links to the full notifications page.

  @ui @screen:notifications-modal
  Scenario: Bell opens the notifications modal on a phone
    Given Anna is signed in
    And Anna belongs to a family of her own
    And she has 3 unread inbox items
    When Anna opens the notifications modal from the bell on a phone
    Then the modal lists her latest notices
    And the modal offers the filters "All", "Unread", "Calendar" and "Account & security"

  @ui @screen:notifications-modal-empty
  Scenario: The notifications modal says there is nothing to show when she has no notices
    Given Anna is signed in
    And Anna belongs to a family of her own
    When Anna opens the notifications modal from the bell on a phone
    Then the modal tells her she is all caught up

  Scenario: Filtering the modal by calendar lists only calendar notices
    Given Anna is signed in
    And Tom and Anna share a family
    And she has 1 unread calendar invitations from Tom
    And she has a password change notice
    When Anna opens the notifications modal from the bell on a phone
    And Anna selects the "Calendar" filter in the modal
    Then only the calendar notice is listed in the modal

  Scenario: Marking all as read in the modal clears the unread count
    Given Anna is signed in
    And Anna belongs to a family of her own
    And she has 2 unread inbox items
    When Anna opens the notifications modal from the bell on a phone
    And Anna marks all notices as read in the modal
    Then the modal shows no unread notices
    And the bell shows no unread count

  Scenario: The modal links to the full notifications page
    Given Anna is signed in
    And Anna belongs to a family of her own
    When Anna opens the notifications modal from the bell on a phone
    And Anna chooses to view all notifications from the modal
    Then the full notifications page is shown

  Scenario: The close button closes the modal
    Given Anna is signed in
    And Anna belongs to a family of her own
    When Anna opens the notifications modal from the bell on a phone
    And Anna closes the modal with its close button
    Then the notifications modal is closed

  Scenario: Escape closes the modal
    Given Anna is signed in
    And Anna belongs to a family of her own
    When Anna opens the notifications modal from the bell on a phone
    And Anna presses Escape
    Then the notifications modal is closed
