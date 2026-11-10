# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:notifications
Feature: Notification core with pluggable channels

  A caller sends one notification to a person. The notifications module delivers it
  through every channel that person has enabled. Callers never know which channels exist.

  @wip
  Scenario: One notification reaches the in-app inbox
    Given Anna is signed in
    When a notification about Anna's event is sent to Anna
    Then Anna has a new unread entry in her inbox
    And the entry names the event

  @wip
  Scenario: Inbox entries appear in the UI
    Given Anna is signed in
    And a notification about Anna's event was sent to her
    When Anna opens her inbox
    Then she sees the entry with its message

  @wip
  Scenario: Browser notification is shown only when permission is granted
    Given Anna is signed in
    And Anna has allowed browser notifications
    When a notification about Anna's event is sent to Anna
    Then a browser notification with its message is shown

  @wip
  Scenario: Browser notification is not shown without permission
    Given Anna is signed in
    And Anna has not allowed browser notifications
    When a notification about Anna's event is sent to Anna
    Then no browser notification is shown
    And the in-app inbox entry is still created

  @wip
  Scenario: A new channel needs no change to the caller
    Given Anna is signed in
    And a new delivery channel is registered
    When a notification about Anna's event is sent to Anna
    Then the new channel delivers it to Anna
    And the caller that sent it was not changed

  @wip
  Scenario: A failing channel does not block the others
    Given Anna is signed in
    And the browser channel is failing
    When a notification about Anna's event is sent to Anna
    Then the in-app inbox entry is still created
    And the browser channel's delivery state records the failure

  @wip
  Scenario: A channel delivery is retried and then dead-lettered
    Given Anna is signed in
    And the browser channel is failing
    When a notification about Anna's event is sent to Anna
    Then the browser channel is tried three times
    And the failed delivery is recorded in the dead-letter queue

  @wip
  Scenario: Nobody can read another person's inbox
    Given Anna is signed in
    And Tom has an unread notification
    Then Anna cannot see Tom's notification
