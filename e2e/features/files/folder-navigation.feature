# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:files @ui
Feature: Folder navigation in the Files page

  The address of the Files page names the folder on screen, so a reload, Back,
  Forward and a pasted link all show the same folder. The folder path above the
  contents runs from the drive down to the folder on screen, and each step of it
  can be used to go up to that level. A folder that does not exist, or that
  belongs to a family the person is not in, shows a not-found view.

  Scenario: The folder path shows the way down from the drive
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has the nested folders "Photos" and "Summer" in her personal drive
    When Anna opens the folder "Summer" in the browser
    Then the folder path reads "Personal", "Photos" and "Summer"
    And "Summer" is the current folder in the folder path

  Scenario: Using a folder in the path goes up to that level
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has the nested folders "Photos" and "Summer" in her personal drive
    When Anna opens the folder "Summer" in the browser
    And Anna uses the folder path item "Photos"
    Then the folder path reads "Personal" and "Photos"
    And "Photos" is the current folder in the folder path

  Scenario: Using the drive in the path returns to the drive root
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has the nested folders "Photos" and "Summer" in her personal drive
    When Anna opens the folder "Summer" in the browser
    And Anna uses the folder path item "Personal"
    Then the folder path reads "Personal"
    And "Personal" is the current folder in the folder path

  Scenario: Reloading a deep folder keeps the same folder
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has the nested folders "Photos" and "Summer" in her personal drive
    When Anna opens the folder "Summer" in the browser
    And Anna reloads the page
    Then the folder path reads "Personal", "Photos" and "Summer"

  Scenario: Back returns to the previous folder after a path item was used
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has the nested folders "Photos" and "Summer" in her personal drive
    When Anna opens the folder "Summer" in the browser
    And Anna uses the folder path item "Photos"
    And Anna goes back in the browser
    Then "Summer" is the current folder in the folder path

  Scenario: Forward returns to the deeper folder after going back
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has the nested folders "Photos" and "Summer" in her personal drive
    When Anna opens the folder "Summer" in the browser
    And Anna uses the folder path item "Photos"
    And Anna goes back in the browser
    And Anna goes forward in the browser
    Then the folder path reads "Personal" and "Photos"
    And "Photos" is the current folder in the folder path

  @screen:folder-not-found
  Scenario: A folder that does not exist shows the not-found view
    Given I am signed in as "Anna Kowalska", a regular member
    When Anna opens a folder link that does not exist in the browser
    Then Anna sees the folder not found view

  Scenario: A folder from another family shows the not-found view
    Given I am signed in as "Anna Kowalska", a regular member
    And another family named "Garden Club" has a folder "Plans" in its family drive
    When Anna opens the folder "Plans" of "Garden Club" in the browser
    Then Anna sees the folder not found view

  @a11y
  Scenario: The folder path can be used with the keyboard
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has the nested folders "Photos" and "Summer" in her personal drive
    When Anna opens the folder "Summer" in the browser
    And Anna reaches the folder path item "Photos" with the keyboard and presses Enter
    Then "Photos" is the current folder in the folder path
    And the page has no serious accessibility violations
