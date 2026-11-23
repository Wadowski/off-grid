# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:notifications
Feature: Notifications page on a phone

  On a phone the full notifications page has a back header and the same list of notices.

  @ui @screen:notifications-page-mobile
  Scenario: Notifications page lists the latest notices on a phone
    Given Anna is signed in
    And Tom and Anna share a family
    And she has 1 unread calendar invitation from Tom
    And she has a password change notice
    And she has a recovery code notice
    When Anna opens the notifications page on a phone
    Then the notifications page lists her 3 notices
