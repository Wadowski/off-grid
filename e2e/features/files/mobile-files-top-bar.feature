# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:files @ui
Feature: The top row of the Files page on a phone

  On a phone the Files page starts with a top row. The row names the drive on
  screen and opens the list of drives, and it holds the folder actions. The
  folder actions are shown but not yet available.

  @screen:files-mobile-top-bar
  Scenario: The phone top row shows the active drive and the folder actions
    Given I am signed in as "Anna Kowalska", a regular member
    When Anna opens the Files page on a phone
    Then the top row shows the active drive "Personal"
    And the top row shows the actions "Upload" and "New folder"

  Scenario: The folder actions on the phone are disabled
    Given I am signed in as "Anna Kowalska", a regular member
    When Anna opens the Files page on a phone
    Then the action "Upload" is disabled
    And the action "New folder" is disabled

  Scenario: Anna taps the active drive on the phone and the drives page opens
    Given I am signed in as "Anna Kowalska", a regular member
    When Anna opens the Files page on a phone
    And Anna taps the active drive on the phone
    Then the drives page is open on the phone
    And the drive sidebar lists the drives "Personal" and "Home"

  Scenario: The top row shows the family drive after Anna switches to it on the phone
    Given I am signed in as "Anna Kowalska", a regular member
    When Anna opens the Files page on a phone
    And Anna taps the active drive on the phone
    And Anna chooses the drive "Home" in the sidebar
    Then the top row shows the active drive "Home"

  Scenario: The desktop Files page has no phone top row
    Given I am signed in as "Anna Kowalska", a regular member
    When Anna opens the Files page in the browser
    Then the top row is not shown

  Scenario: Anna reaches the active drive on the phone with the keyboard and opens the drives page
    Given I am signed in as "Anna Kowalska", a regular member
    When Anna opens the Files page on a phone
    And Anna reaches the active drive on the phone with the keyboard and presses Enter
    Then the drives page is open on the phone

  @a11y
  Scenario: The phone Files page with the top row has no serious accessibility violations
    Given I am signed in as "Anna Kowalska", a regular member
    When Anna opens the Files page on a phone
    Then the page has no serious accessibility violations
