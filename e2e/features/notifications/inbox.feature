# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:notifications
Feature: Notifications

  Every notice to a person lands in one inbox, owned by the notifications module.
  Nobody can read another person's notifications.

  Scenario: Password change notice
    Given Anna is signed in
    When Anna changes her password
    Then she has a new unread inbox item saying so

  Scenario: Marking as read
    Given Anna is signed in
    And she has an unread inbox item
    When Anna marks an item as read
    Then it no longer counts as unread

  Scenario: Privacy
    Given Anna is signed in
    And Tom has an unread inbox item
    Then Anna cannot see Tom's notifications
