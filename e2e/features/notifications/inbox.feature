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

  Scenario: Notices carry their category
    Given Anna is signed in
    And she has a password change notice
    And she has a recovery code notice
    When Anna opens her inbox
    Then each notice shows the category account-security

  Scenario Outline: Filtering the inbox by category and unread state
    Given Anna is signed in
    And she has a password change notice
    And she has a recovery code notice
    And she has marked her password change notice as read
    When Anna filters her inbox by <filter>
    Then she sees <shown> notices
    And the total is <shown>

    Examples:
      | filter                            | shown |
      | the account-security category     | 2     |
      | the calendar category             | 0     |
      | unread notices only               | 1     |
      | the calendar category and unread  | 0     |

  Scenario: Counts reflect the filter
    Given Anna is signed in
    And she has a password change notice
    And she has a recovery code notice
    And she has marked her password change notice as read
    When Anna filters her inbox by unread notices only
    Then the total is 1
    And her unread count for the bell is still 1
