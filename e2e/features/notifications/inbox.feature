# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:notifications
Feature: Notifications

  Every notice to a person shows up in that person's inbox.
  Nobody can read another person's notifications.

  Scenario: Password change notice
    Given Anna is signed in
    When Anna changes her password
    Then she has a new unread inbox item about the password change

  Scenario: Marking as read
    Given Anna is signed in
    And she has an unread inbox item
    When Anna marks an item as read
    Then it no longer counts as unread

  Scenario: Privacy
    Given Anna is signed in
    And Tom has an unread inbox item
    Then Anna cannot see Tom's notifications

  @wip
  Scenario: Bell shows the unread count
    Given Anna is signed in
    And she has 3 unread inbox items
    Then the bell shows 3 unread

  @wip
  Scenario: Bell caps the unread count at 99+
    Given Anna is signed in
    And she has 120 unread inbox items
    Then the bell shows 99+

  @wip
  Scenario: Bell shows no count when nothing is unread
    Given Anna is signed in
    And she has no unread inbox items
    Then the bell shows no unread count

  @wip
  Scenario: Popover lists the latest notices
    Given Anna is signed in
    And she has several inbox items
    When Anna opens the notifications popover from the bell
    Then the popover lists her latest notices, newest first

  @wip
  Scenario: Popover links to the full notifications page
    Given Anna is signed in
    When Anna opens the notifications popover from the bell
    And Anna chooses to see all notifications
    Then the full notifications page is shown

  @wip
  Scenario: Popover filters notices by source
    Given Anna is signed in
    And she has an unread calendar notice
    And she has an unread account and security notice
    When Anna opens the notifications popover from the bell
    And Anna selects the "Calendar" filter
    Then only the calendar notice is listed

  @wip
  Scenario Outline: Each surface shows her unread notices and marks them all as read
    Given Anna is signed in
    And she has an unread password change notice
    And she has an unread calendar invitation
    When Anna opens her inbox as the <surface>
    Then she sees both unread notices
    When Anna marks all notices as read
    Then she has no unread inbox items

    Examples:
      | surface               |
      | desktop popover       |
      | desktop page          |
      | mobile page           |
      | mobile modal          |

  @wip
  Scenario: Desktop page groups notices into Today and Yesterday
    Given Anna is signed in
    And she has a calendar reminder from today
    And she has a password change notice from yesterday
    When Anna opens the notifications page
    Then the calendar reminder is listed under "Today"
    And the password change notice is listed under "Yesterday"

  @wip
  Scenario: Desktop page loads older notices on request
    Given Anna is signed in
    And she has more notices than fit on the first page
    When Anna opens the notifications page
    And Anna loads older notices
    Then the older notices are added below the ones she already sees

  @wip
  Scenario: Marking one notice as read keeps its first read time
    Given Anna is signed in
    And she marked a notice as read at 09:00
    When Anna marks the same notice as read again at 10:00
    Then the notice still shows that she read it at 09:00

  @wip
  Scenario: Marking one notice as read leaves other notices unread
    Given Anna is signed in
    And she has two unread inbox items
    When Anna marks one of them as read
    Then the other item is still unread

  @wip
  Scenario Outline: Filter the inbox by source or read state
    Given Anna is signed in
    And she has an unread calendar reminder
    And she has a read password change notice
    When Anna selects the "<filter>" filter on the notifications page
    Then the inbox lists <listed>

    Examples:
      | filter              | listed                                |
      | All                 | the calendar reminder and the password change notice |
      | Unread              | only the calendar reminder            |
      | Calendar            | only the calendar reminder            |
      | Account & security  | only the password change notice       |

  @wip
  Scenario: Mobile page and modal offer the same filters
    Given Anna is signed in
    When Anna opens her inbox on a phone
    Then she can filter by "All", "Unread", "Calendar" and "Account & security"

  @wip
  Scenario: A new notice appears without a reload
    Given Anna is signed in
    And she has the notifications page open
    When a password change notice is created for Anna
    Then the notice appears in her inbox without reloading the page

  @wip
  Scenario: The unread count updates without a reload
    Given Anna is signed in
    And she has the notifications page open
    When a calendar invitation is created for Anna
    Then the bell shows 1 unread without reloading the page

  @wip
  Scenario: Notices missed during a dropped connection appear after reconnecting
    Given Anna is signed in
    And she has the notifications page open
    And her live connection drops
    And a calendar reminder is created for Anna while she is disconnected
    When her connection is restored
    Then the calendar reminder appears in her inbox

  @wip
  Scenario: Inbox shows an inline error when live updates are unavailable
    Given Anna is signed in
    And live updates are unavailable
    When Anna opens the notifications page
    Then she sees an inline error that live updates are unavailable

  @wip
  Scenario: Inbox shows an empty state when there are no notices
    Given Anna is signed in
    And she has no inbox items
    When Anna opens the notifications page
    Then she sees an empty state

  @wip
  Scenario: Anna cannot mark another person's notice as read
    Given Anna is signed in
    And Tom has an unread inbox item
    When Anna tries to mark Tom's item as read
    Then the request is refused
    And Tom's item is still unread
