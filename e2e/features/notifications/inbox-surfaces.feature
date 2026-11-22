# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@wip @module:notifications
Feature: Notifications inbox surfaces

  The bell, popover, page and mobile modal show the same notices.
  People mark notices read, filter them and see new ones live.

  Scenario: Popover lists the latest notices
    Given Anna is signed in
    And she has several inbox items
    When Anna opens the notifications popover from the bell
    Then the popover lists her latest notices, newest first

  Scenario: Popover links to the full notifications page
    Given Anna is signed in
    When Anna opens the notifications popover from the bell
    And Anna chooses to see all notifications
    Then the full notifications page is shown

  Scenario: Popover filters notices by source
    Given Anna is signed in
    And she has an unread calendar notice
    And she has an unread account and security notice
    When Anna opens the notifications popover from the bell
    And Anna selects the "Calendar" filter
    Then only the calendar notice is listed

  Scenario Outline: Each surface shows her unread notices and marks them all as read
    Given Anna is signed in
    And she has an unread password change notice
    And she has an unread calendar invitation
    When Anna opens her inbox as the <surface>
    Then she sees both unread notices
    When Anna marks all notices as read
    Then she has no unread inbox items

    Examples:
      | surface         |
      | desktop popover |
      | desktop page    |
      | mobile page     |
      | mobile modal    |

  Scenario: Desktop page groups notices into Today and Yesterday
    Given Anna is signed in
    And she has a calendar reminder from today
    And she has a password change notice from yesterday
    When Anna opens the notifications page
    Then the calendar reminder is listed under "Today"
    And the password change notice is listed under "Yesterday"

  Scenario: Desktop page loads older notices on request
    Given Anna is signed in
    And she has more notices than fit on the first page
    When Anna opens the notifications page
    And Anna loads older notices
    Then the older notices are added below the ones she already sees

  Scenario: Marking one notice as read keeps its first read time
    Given Anna is signed in
    And she marked a notice as read at 09:00
    When Anna marks the same notice as read again at 10:00
    Then the notice still shows that she read it at 09:00

  Scenario: Marking one notice as read leaves other notices unread
    Given Anna is signed in
    And she has two unread inbox items
    When Anna marks one of them as read
    Then the other item is still unread

  Scenario Outline: Filter the inbox by source or read state
    Given Anna is signed in
    And she has an unread calendar reminder
    And she has a read password change notice
    When Anna selects the "<filter>" filter on the notifications page
    Then the inbox lists <listed>

    Examples:
      | filter             | listed                                               |
      | All                | the calendar reminder and the password change notice |
      | Unread             | only the calendar reminder                           |
      | Calendar           | only the calendar reminder                           |
      | Account & security | only the password change notice                      |

  Scenario: Mobile page and modal offer the same filters
    Given Anna is signed in
    When Anna opens her inbox on a phone
    Then she can filter by "All", "Unread", "Calendar" and "Account & security"

  Scenario: A new notice appears without a reload
    Given Anna is signed in
    And she has the notifications page open
    When a password change notice is created for Anna
    Then the notice appears in her inbox without reloading the page

  Scenario: Notices missed during a dropped connection appear after reconnecting
    Given Anna is signed in
    And she has the notifications page open
    And her live connection drops
    And a calendar reminder is created for Anna while she is disconnected
    When her connection is restored
    Then the calendar reminder appears in her inbox

  Scenario: Inbox shows an inline error when live updates are unavailable
    Given Anna is signed in
    And live updates are unavailable
    When Anna opens the notifications page
    Then she sees an inline error that live updates are unavailable

  Scenario: Inbox shows an empty state when there are no notices
    Given Anna is signed in
    And she has no inbox items
    When Anna opens the notifications page
    Then she sees an empty state

  Scenario: Anna cannot mark another person's notice as read
    Given Anna is signed in
    And Tom has an unread inbox item
    When Anna tries to mark Tom's item as read
    Then the request is refused
    And Tom's item is still unread

  Scenario: Mobile page goes back to the previous screen
    Given Anna is signed in
    When Anna opens her inbox on a phone
    And Anna goes back
    Then she is back on the screen she came from

  Scenario: Mobile page tells Anna when she has reached the end
    Given Anna is signed in
    And she has a calendar reminder from today
    When Anna opens her inbox on a phone
    Then she sees she is caught up
