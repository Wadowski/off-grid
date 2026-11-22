# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:notifications
Feature: Header notifications bell

  The bell in the header shows how many notices are unread across the whole inbox.
  The count stays current without a reload.

  Scenario: Bell shows the unread count
    Given Anna is signed in
    And Anna belongs to a family
    And she has 3 unread inbox items
    Then the bell shows 3 unread

  Scenario: Bell shows no count when nothing is unread
    Given Anna is signed in
    And Anna belongs to a family
    And she has no unread inbox items
    Then the bell shows no unread count

  Scenario: The unread count updates without a reload
    Given Anna is signed in
    And Anna belongs to a family
    And she has the app open
    When a recovery code notice is created for Anna
    Then the bell shows 1 unread without reloading the page
