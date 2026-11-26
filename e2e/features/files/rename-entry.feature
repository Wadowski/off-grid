# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:files @ui @wip
Feature: Renaming a file or folder from its menu

  Each file and folder can be renamed from its actions menu. The dialog holds
  the full current name, extension included, with the base name selected. A
  valid new name replaces the old one in place. Invalid and duplicate names are
  refused in the dialog, and cancelling changes nothing.

  @screen:files-rename-dialog
  Scenario: Opening Rename shows the full current name with focus in the field
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Insurance policy.txt"
    When Anna opens the files page on a desktop screen
    And Anna opens the actions of the file "Insurance policy.txt"
    And Anna chooses Rename from the actions menu
    Then the rename dialog shows the name "Insurance policy.txt"
    And the name field of the rename dialog has focus

  Scenario: Anna renames a file and it keeps its place in the table
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Insurance policy.txt"
    And Anna has a personal-drive file "Zulu.txt"
    When Anna opens the files page on a desktop screen
    And Anna renames the file "Insurance policy.txt" to "Insurance 2026.txt"
    Then the rename dialog is closed
    And the table lists the file "Insurance 2026.txt"
    And the table no longer lists "Insurance policy.txt"
    And the table still lists "Zulu.txt"

  Scenario: Anna renames a folder
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive folder "Photos"
    When Anna opens the files page on a desktop screen
    And Anna renames the folder "Photos" from its actions menu to "Holiday photos"
    Then the rename dialog is closed
    And the table lists the folder "Holiday photos"
    And the table no longer lists "Photos"

  Scenario: Anna changes the extension of a file
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Notes.txt"
    When Anna opens the files page on a desktop screen
    And Anna renames the file "Notes.txt" to "Notes.md"
    Then the table lists the file "Notes.md"

  Scenario: A name that is already used in the folder is refused and the typed name is kept
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Insurance policy.txt"
    And Anna has a personal-drive file "Zulu.txt"
    When Anna opens the files page on a desktop screen
    And Anna opens the actions of the file "Insurance policy.txt"
    And Anna chooses Rename from the actions menu
    And Anna types "Zulu.txt" as the new name
    And Anna submits the rename
    Then the rename dialog shows the error "A file or folder with this name already exists here."
    And the rename dialog is still open
    And the name field of the rename dialog holds "Zulu.txt"

  Scenario Outline: A name that cannot be used is refused in the dialog
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Insurance policy.txt"
    When Anna opens the files page on a desktop screen
    And Anna opens the actions of the file "Insurance policy.txt"
    And Anna chooses Rename from the actions menu
    And Anna types "<name>" as the new name
    And Anna submits the rename
    Then the rename dialog shows the error "<message>"
    And the rename dialog is still open
    And the table still lists "Insurance policy.txt"

    Examples:
      | name            | message                                          |
      |                 | Enter a name.                                    |
      | a/b.txt         | A name can't contain slashes or be only dots.    |
      | ..              | A name can't contain slashes or be only dots.    |

  Scenario: A name longer than 255 characters is refused in the dialog
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Insurance policy.txt"
    When Anna opens the files page on a desktop screen
    And Anna opens the actions of the file "Insurance policy.txt"
    And Anna chooses Rename from the actions menu
    And Anna types a 256 character name as the new name
    And Anna submits the rename
    Then the rename dialog shows the error "Use 255 characters or fewer."
    And the rename dialog is still open

  Scenario: Submitting the unchanged name closes the dialog and sends no request
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Insurance policy.txt"
    When Anna opens the files page on a desktop screen
    And Anna opens the actions of the file "Insurance policy.txt"
    And Anna chooses Rename from the actions menu
    And Anna submits the rename
    Then the rename dialog is closed
    And the table lists the file "Insurance policy.txt"

  Scenario: Cancelling the rename changes nothing and returns focus to the actions button
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Insurance policy.txt"
    When Anna opens the files page on a desktop screen
    And Anna opens the actions of the file "Insurance policy.txt"
    And Anna chooses Rename from the actions menu
    And Anna types "Changed.txt" as the new name
    And Anna cancels the rename
    Then the rename dialog is closed
    And the table lists the file "Insurance policy.txt"
    And the actions button of "Insurance policy.txt" has focus

  Scenario: Pressing Escape closes the rename dialog without a request
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Insurance policy.txt"
    When Anna opens the files page on a desktop screen
    And Anna opens the actions of the file "Insurance policy.txt"
    And Anna chooses Rename from the actions menu
    And Anna presses Escape
    Then the rename dialog is closed

  Scenario: Renaming the selected file updates the details panel
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Insurance policy.txt"
    When Anna opens the files page on a desktop screen
    And Anna selects the table row "Insurance policy.txt"
    And Anna renames the file "Insurance policy.txt" to "Insurance 2026.txt"
    Then the file details panel shows the name "Insurance 2026.txt"

  @screen:files-phone-rename-dialog
  Scenario: Anna renames a file from the phone list
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Insurance policy.txt"
    When Anna opens her personal drive on a phone
    And Anna renames the file "Insurance policy.txt" to "Insurance 2026.txt" from its actions menu
    Then the phone list reads "Insurance 2026.txt"

  Scenario: Anna renames a file from a grid card
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Insurance policy.txt"
    When Anna opens the files page on a desktop screen
    And Anna switches the view to grid
    And Anna renames the file "Insurance policy.txt" to "Insurance 2026.txt" from its actions menu
    Then the grid still shows the card "Insurance 2026.txt"

  Scenario: A rename that finds the file moved to the trash elsewhere shows the error
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Insurance policy.txt"
    When Anna opens the files page on a desktop screen
    And Anna opens the actions of the file "Insurance policy.txt"
    And Anna chooses Rename from the actions menu
    And the file "Insurance policy.txt" is moved to the trash elsewhere
    And Anna types "Insurance 2026.txt" as the new name
    And Anna submits the rename
    Then the rename dialog shows the error "This file or folder is no longer available."
    And the rename dialog is still open

  @a11y
  Scenario: The open rename dialog has no serious accessibility violations
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Insurance policy.txt"
    When Anna opens the files page on a desktop screen
    And Anna opens the actions of the file "Insurance policy.txt"
    And Anna chooses Rename from the actions menu
    Then the page has no serious accessibility violations
