# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:notifications
Feature: Notifications page on a desktop

  On a wide screen the full notifications page lists every notice with a header,
  a filter bar and a list footer.

  @ui @screen:notifications-page
  Scenario: Notifications page lists the latest notices on a desktop
    Given Anna is signed in
    And Tom and Anna share a family
    And she has 1 unread calendar invitation from Tom
    And she has a password change notice
    And she has a recovery code notice
    When Anna opens the notifications page on a desktop screen
    Then the notifications page lists her 3 notices
