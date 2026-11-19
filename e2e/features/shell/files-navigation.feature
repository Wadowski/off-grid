# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:shell @a11y @ui
Feature: Files navigation

  Files is the place for drives and folders. It sits in the navigation next to
  Calendar, and a signed-in person can reach it on a desktop and on a phone.

  @wip
  Scenario: Files opens from the navigation on a desktop
    Given I am signed in as "Anna Kowalska", a regular member
    Given a 1280 px wide screen
    When I open Files from the navigation
    Then I see the Files page
    And the sidebar marks "Files" as the current page

  @wip
  Scenario: Files opens from the Apps list on a phone
    Given I am signed in as "Anna Kowalska", a regular member
    Given a 390 px wide screen
    When I tap "Apps" in the bottom navigation
    And I open "Files" from the Apps list
    Then I see the Files page

  @wip
  Scenario: Signed-out visit to Files asks me to sign in first
    Given I am not signed in
    When I open the Files page
    Then I am taken to the sign-in page
    And after signing in I land on the Files page
