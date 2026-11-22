# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:files @ui @wip
Feature: Switching between the personal drive and family drives

  The Files sidebar lists the personal drive first and then one row for each
  family drive the person may use. The row of the drive on screen is marked as
  the active one, and choosing a row opens that drive's contents.

  @screen:files-drive-switcher
  Scenario: Anna sees her personal drive and her family drive in the sidebar
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna is a member of the family "The Smiths"
    When Anna opens the Files page in the browser
    Then the drive sidebar lists the drives "Personal" and "The Smiths"

  Scenario: The personal drive is the active drive on the Files page
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna is a member of the family "The Smiths"
    When Anna opens the Files page in the browser
    Then the drive "Personal" is the active drive in the sidebar

  Scenario: Anna switches to the family drive and sees its folders
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna is a member of the family "The Smiths"
    And Anna has the folder "Plans" in the family drive of "The Smiths"
    When Anna opens the Files page in the browser
    And Anna chooses the drive "The Smiths" in the sidebar
    Then the drive "The Smiths" is the active drive in the sidebar
    And the folder list shows "Plans"

  Scenario: Anna switches back to her personal drive and sees its folders
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna is a member of the family "The Smiths"
    And Anna has the folder "Plans" in the family drive of "The Smiths"
    And Anna has the nested folders "Photos" and "Summer" in her personal drive
    When Anna opens the Files page in the browser
    And Anna chooses the drive "The Smiths" in the sidebar
    And Anna chooses the drive "Personal" in the sidebar
    Then the drive "Personal" is the active drive in the sidebar
    And the folder list shows "Photos"

  @a11y
  Scenario: The drives can be chosen with the keyboard and the active drive is marked
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna is a member of the family "The Smiths"
    When Anna opens the Files page in the browser
    And Anna reaches the drive "The Smiths" in the sidebar with the keyboard and presses Enter
    Then the drive "The Smiths" is the active drive in the sidebar
    And the page has no serious accessibility violations

  Scenario: Anna without a family sees only her personal drive
    Given I am signed in as "Anna Kowalska", a regular member
    When Anna opens the Files page in the browser
    Then the drive sidebar lists the drives "Personal"
    And the drive sidebar says there are no family drives yet
