# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:files @ui
Feature: File details panel on the desktop Files page

  On a desktop screen selecting a file row opens a details panel beside the
  table. The panel shows the name, type, size, modified and created dates and
  the location of the file. Selecting another file replaces the details, and
  closing the panel clears the selection.

  @screen:files-desktop-file-details
  Scenario: Selecting a file shows its details
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Insurance policy.txt"
    When Anna opens the files page on a desktop screen
    And Anna selects the table row "Insurance policy.txt"
    Then the file details panel shows the name "Insurance policy.txt"
    And the file details panel shows the type "Document"
    And the file details panel shows a size, a modified date and a created date
    And the file details panel shows the location "Personal"

  Scenario: Selecting another file replaces the details
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Alpha.txt"
    And Anna has a personal-drive file "Zulu.txt"
    When Anna opens the files page on a desktop screen
    And Anna selects the table row "Alpha.txt"
    And Anna selects the table row "Zulu.txt"
    Then the file details panel shows the name "Zulu.txt"
    And the table row "Zulu.txt" is selected

  Scenario: The location shows the folder path of a file in a nested folder
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive folder "Photos"
    And Anna has a personal-drive file "Holiday.txt" in the folder "Photos"
    When Anna opens the files page on a desktop screen
    And Anna opens the folder "Photos" from the table
    And Anna selects the table row "Holiday.txt"
    Then the file details panel shows the location "Personal › Photos"

  Scenario: The location of a file in a family drive starts with the family drive name
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a family "Home" with a file "Menu.txt" with the content "Weekly menu"
    When Anna opens the family drive "Home" on a desktop screen
    And Anna selects the table row "Menu.txt"
    Then the file details panel shows the location "Home"

  Scenario: Closing the panel clears the selection
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Insurance policy.txt"
    When Anna opens the files page on a desktop screen
    And Anna selects the table row "Insurance policy.txt"
    And Anna closes the file details panel
    Then the file details panel is not shown
    And the table row "Insurance policy.txt" is not selected
    And the table takes the full width

  Scenario: Opening a folder closes the panel
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive folder "Photos"
    And Anna has a personal-drive file "Insurance policy.txt"
    When Anna opens the files page on a desktop screen
    And Anna selects the table row "Insurance policy.txt"
    And Anna opens the folder "Photos" from the table
    Then the file details panel is not shown

  Scenario: The panel shows no version, download or link sections
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Insurance policy.txt"
    When Anna opens the files page on a desktop screen
    And Anna selects the table row "Insurance policy.txt"
    Then the file details panel shows no version, download or link sections

  @a11y
  Scenario: The details panel has no serious accessibility violations and Escape closes it
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Insurance policy.txt"
    When Anna opens the files page on a desktop screen
    And Anna selects the table row "Insurance policy.txt"
    Then the page has no serious accessibility violations
    When Anna presses Escape in the file details panel
    Then the file details panel is not shown
    And the table row "Insurance policy.txt" has the keyboard focus
