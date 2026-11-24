# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:files @ui
Feature: Actions for a file or folder from its menu

  Each file and folder has an actions menu, opened from its own button in the
  table, the phone list or the grid. The menu offers opening the entry and
  moving it to the trash. Moving to the trash asks first, names the entry,
  and removes it from the list when confirmed.

  @wip @screen:files-actions-menu
  Scenario: The actions of a file offer Open and Delete only
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Insurance policy.txt"
    When Anna opens the files page on a desktop screen
    And Anna opens the actions of the file "Insurance policy.txt"
    Then the actions menu lists "Open" and "Delete"
    And the actions menu does not list "Rename", "Move" or "Download"

  @wip @screen:files-delete-confirm
  Scenario: Anna moves a file to the trash from the table
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Insurance policy.txt"
    And Anna has a personal-drive file "Zulu.txt"
    When Anna opens the files page on a desktop screen
    And Anna deletes the file "Insurance policy.txt" from its actions menu
    Then the confirmation names the file "Insurance policy.txt"
    When Anna confirms moving it to the trash
    Then the table no longer lists "Insurance policy.txt"
    And the table still lists "Zulu.txt"
    And Anna is told "Insurance policy.txt" was moved to the trash

  @wip
  Scenario: Anna cancels moving a file to the trash
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Insurance policy.txt"
    When Anna opens the files page on a desktop screen
    And Anna deletes the file "Insurance policy.txt" from its actions menu
    And Anna cancels the confirmation
    Then the table still lists "Insurance policy.txt"
    And Anna sees "Insurance policy.txt" in her personal drive

  @wip
  Scenario: Anna moves a folder to the trash and the confirmation says what is inside goes too
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive folder "Photos"
    And Anna has a personal-drive file "Summer.jpg" in the folder "Photos"
    When Anna opens the files page on a desktop screen
    And Anna deletes the folder "Photos" from its actions menu
    Then the confirmation says the folder "Photos" and everything in it moves to the trash
    When Anna confirms moving it to the trash
    Then the table no longer lists "Photos"

  @wip
  Scenario: Deleting the selected file clears the details panel
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Insurance policy.txt"
    When Anna opens the files page on a desktop screen
    And Anna selects the table row "Insurance policy.txt"
    And Anna deletes the file "Insurance policy.txt" from its actions menu
    And Anna confirms moving it to the trash
    Then the file details panel is not shown

  @wip
  Scenario: Anna moves a file to the trash from the phone list
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Insurance policy.txt"
    When Anna opens her personal drive on a phone
    And Anna deletes the file "Insurance policy.txt" from its actions menu
    And Anna confirms moving it to the trash
    Then the phone list no longer reads "Insurance policy.txt"

  @wip
  Scenario: Anna moves a file to the trash from the grid
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Insurance policy.txt"
    And Anna has a personal-drive file "Zulu.txt"
    When Anna opens the files page on a desktop screen
    And Anna switches the view to grid
    And Anna deletes the file "Insurance policy.txt" from its actions menu
    And Anna confirms moving it to the trash
    Then the grid no longer shows the card "Insurance policy.txt"
    And the grid still shows the card "Zulu.txt"

  @wip @a11y
  Scenario: Anna opens the actions menu with the keyboard and closes it with Escape
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Insurance policy.txt"
    When Anna opens the files page on a desktop screen
    And Anna opens the actions of the file "Insurance policy.txt" with the keyboard
    And Anna moves through the actions menu with the arrow keys
    And Anna presses Escape
    Then the actions menu is closed
    And the actions button of "Insurance policy.txt" has focus

  @wip @a11y
  Scenario: The open actions menu and the confirmation have no serious accessibility violations
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Insurance policy.txt"
    When Anna opens the files page on a desktop screen
    And Anna deletes the file "Insurance policy.txt" from its actions menu
    Then the page has no serious accessibility violations

  @wip
  Scenario: A move to the trash that fails keeps the confirmation open with the error
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Insurance policy.txt"
    When Anna opens the files page on a desktop screen
    And Anna deletes the file "Insurance policy.txt" from its actions menu
    And the file "Insurance policy.txt" is moved to the trash elsewhere
    And Anna confirms moving it to the trash
    Then the confirmation shows the error "This file or folder is no longer available."
    And the confirmation is still open
