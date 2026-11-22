# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:files @ui
Feature: Switching between the personal drive and family drives

  The Files sidebar lists the personal drive first and then one row for each
  family drive the person may use. The row of the drive on screen is marked as
  the active one, and choosing a row opens that drive's contents.

  Scenario: Anna sees her personal drive and her family drive in the sidebar
    Given I am signed in as "Anna Kowalska", a regular member
    When Anna opens the Files page in the browser
    Then the drive sidebar lists the drives "Personal" and "Home"

  Scenario: The personal drive is the active drive on the Files page
    Given I am signed in as "Anna Kowalska", a regular member
    When Anna opens the Files page in the browser
    Then the drive "Personal" is the active drive in the sidebar

  @screen:files-drive-switcher
  Scenario: Anna switches to the family drive and sees its folders
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has the folder "Plans" in the family drive "Home"
    When Anna opens the Files page in the browser
    And Anna chooses the drive "Home" in the sidebar
    Then the drive "Home" is the active drive in the sidebar
    And the folder list shows "Plans"

  Scenario: Anna switches back to her personal drive and sees its folders
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has the folder "Plans" in the family drive "Home"
    And Anna has the nested folders "Photos" and "Summer" in her personal drive
    When Anna opens the Files page in the browser
    And Anna chooses the drive "Home" in the sidebar
    And Anna chooses the drive "Personal" in the sidebar
    Then the drive "Personal" is the active drive in the sidebar
    And the folder list shows "Photos"

  Scenario: The drives can be chosen with the keyboard
    Given I am signed in as "Anna Kowalska", a regular member
    When Anna opens the Files page in the browser
    And Anna reaches the drive "Home" in the sidebar with the keyboard and presses Enter
    Then the drive "Home" is the active drive in the sidebar

  @screen:files-drives-phone
  Scenario: On a phone Anna sees her personal drive and her family drive on the drives page
    Given I am signed in as "Anna Kowalska", a regular member
    When Anna opens the drives page on a phone
    Then the drive sidebar lists the drives "Personal" and "Home"
    And the drive "Personal" is the active drive in the sidebar

  Scenario: On a phone Anna reaches the drives page from the Files page
    Given I am signed in as "Anna Kowalska", a regular member
    When Anna opens the Files page on a phone
    And Anna taps the active drive on the phone
    Then the drives page is open on the phone
    And the drive sidebar lists the drives "Personal" and "Home"

  Scenario: On a phone Anna switches to the family drive and sees its folders
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has the folder "Plans" in the family drive "Home"
    When Anna opens the drives page on a phone
    And Anna chooses the drive "Home" in the sidebar
    Then the folder list shows "Plans"

  @a11y
  Scenario: The phone drives page has no serious accessibility violations
    Given I am signed in as "Anna Kowalska", a regular member
    When Anna opens the drives page on a phone
    Then the page has no serious accessibility violations

  @a11y
  Scenario: The Files page with the drive sidebar has no serious accessibility violations
    Given I am signed in as "Anna Kowalska", a regular member
    When Anna opens the Files page in the browser
    Then the page has no serious accessibility violations
