# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:system
Feature: Version reporting

  The running server tells which version it is, so that an admin can compare it
  with the latest release.

  @ui
  Scenario: The running version is shown in settings
    Given I am signed in as a regular member
    When I open my settings
    Then I see the version the server is running

  Scenario: The server reports its version without signing in
    When the running version of the server is checked without signing in
    Then the server reports a version and no personal data
