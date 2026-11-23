# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:files @ui
Feature: Desktop file list in the Files page

  On a desktop screen the contents of a drive or folder are listed as a table
  with the name, the last change, the size and the type of each entry. Folders
  come first, then files, each by name. Opening a folder row moves into that
  folder, and selecting a file row marks it without leaving the folder. The
  header names the drive on screen.

  @screen:files-desktop-list
  Scenario: The desktop table shows name, modified, size and type of each entry
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive folder "Photos"
    And Anna has a personal-drive file "Insurance policy.txt"
    When Anna opens the files page on a desktop screen
    Then the Files page heading reads "Personal"
    And the table has the columns "Name", "Modified", "Size" and "Type"
    And the table row "Insurance policy.txt" shows the type "Document"

  Scenario: The header shows the name of the family drive
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has the folder "Recipes" in the family drive "Home"
    When Anna opens the files page on a desktop screen
    And Anna chooses the drive "Home" in the sidebar
    Then the Files page heading reads "Home"
    And the table lists the folder "Recipes"

  Scenario: Folders come before files, each sorted by name
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Zulu.txt"
    And Anna has a personal-drive folder "Yankee"
    And Anna has a personal-drive file "Alpha.txt"
    And Anna has a personal-drive folder "Beta"
    When Anna opens the files page on a desktop screen
    Then the table rows read "Beta", "Yankee", "Alpha.txt" and "Zulu.txt" in that order

  Scenario: Clicking a folder row opens the folder
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive folder "Photos"
    And Anna has a personal-drive file "Holiday.txt" in the folder "Photos"
    When Anna opens the files page on a desktop screen
    And Anna opens the folder "Photos" from the table
    Then the folder path reads "Personal" and "Photos"
    And the table lists the file "Holiday.txt"

  Scenario: Pressing Enter on a folder row opens the folder
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive folder "Photos"
    When Anna opens the files page on a desktop screen
    And Anna reaches the table row "Photos" with the keyboard and presses Enter
    Then the folder path reads "Personal" and "Photos"

  @screen:files-desktop-list-selected
  Scenario: Clicking a file row selects it without leaving the folder
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Alpha.txt"
    And Anna has a personal-drive file "Zulu.txt"
    When Anna opens the files page on a desktop screen
    And Anna selects the table row "Alpha.txt"
    Then the table row "Alpha.txt" is selected
    And the folder path reads "Personal"

  Scenario: Selecting another file moves the selection
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Alpha.txt"
    And Anna has a personal-drive file "Zulu.txt"
    When Anna opens the files page on a desktop screen
    And Anna selects the table row "Alpha.txt"
    And Anna selects the table row "Zulu.txt"
    Then the table row "Zulu.txt" is selected
    And the table row "Alpha.txt" is not selected

  Scenario: A big folder is shown page by page on the desktop table
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive folder "Archive" holding 51 entries
    When Anna opens the files page on a desktop screen
    And Anna opens the folder "Archive" from the table
    Then the table shows 50 rows
    When Anna loads more entries
    Then the table shows 51 rows
    And the load more control is not shown

  @a11y
  Scenario: The desktop table has no serious accessibility violations
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive folder "Photos"
    And Anna has a personal-drive file "Insurance policy.txt"
    When Anna opens the files page on a desktop screen
    Then the page has no serious accessibility violations

  @a11y
  Scenario: A file row can be selected and a folder row opened with the keyboard
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive folder "Photos"
    And Anna has a personal-drive file "Insurance policy.txt"
    When Anna opens the files page on a desktop screen
    And Anna selects the table row "Insurance policy.txt" with the keyboard and presses Space
    Then the table row "Insurance policy.txt" is selected
    When Anna reaches the table row "Photos" with the keyboard and presses Enter
    Then the folder path reads "Personal" and "Photos"
