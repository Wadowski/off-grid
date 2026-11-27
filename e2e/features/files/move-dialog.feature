# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:files @ui
Feature: Moving a file or folder with the move dialog

  A person moves a file or folder from its actions menu or from the details
  panel. The dialog names the entry and shows a folder tree of the drives the
  person may use. Only folders are shown in the tree, and the entry itself
  and everything inside it cannot be chosen. Moving to another owner's drive
  copies the entry there and removes the original, so that case asks for a
  second press first. A refused move keeps the dialog open with the reason.

  Scenario: Anna moves a file into a folder from the actions menu
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Insurance policy.txt"
    And Anna has a personal-drive folder "Documents"
    When Anna opens the files page on a desktop screen
    And Anna opens the actions of the file "Insurance policy.txt"
    And Anna chooses Move
    And Anna chooses the folder "Documents" in the move dialog
    And Anna confirms the move
    Then the move dialog is closed
    And the table no longer lists "Insurance policy.txt"
    And Anna is told "Insurance policy.txt" was moved to "Documents"

  Scenario: Anna moves a folder into a sibling folder
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive folder "Photos"
    And Anna has a personal-drive folder "Archive"
    When Anna opens the files page on a desktop screen
    And Anna opens the actions of the folder "Photos"
    And Anna chooses Move
    And Anna chooses the folder "Archive" in the move dialog
    And Anna confirms the move
    Then the table no longer lists "Photos"
    And Anna is told "Photos" was moved to "Archive"

  @screen:files-move-dialog-expanded
  Scenario: The folder picker loads subfolders only when a folder is expanded
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive folder "Documents"
    And Anna has a personal-drive folder "Taxes" in the folder "Documents"
    And Anna has a personal-drive file "Notes.txt" in the folder "Documents"
    When Anna opens the files page on a desktop screen
    And Anna opens the folder "Documents" from the table
    And Anna opens the actions of the file "Notes.txt"
    And Anna chooses Move
    Then the move dialog lists the drive "Personal" as a root
    And the move dialog does not list the folder "Taxes"
    When Anna expands the folder "Documents" in the move dialog
    Then the move dialog lists the folder "Taxes"
    And the move dialog does not list "Notes.txt"

  @screen:files-move-dialog
  Scenario: The moved folder and its subfolders cannot be chosen
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive folder "Photos"
    And Anna has a personal-drive folder "Summer" in the folder "Photos"
    When Anna opens the files page on a desktop screen
    And Anna opens the actions of the folder "Photos"
    And Anna chooses Move
    And Anna expands the drive "Personal" in the move dialog
    Then the folder "Photos" in the move dialog is disabled
    And the move dialog does not list the folder "Summer"
    And the move dialog Move button is disabled

  Scenario: The current location cannot be chosen as the target
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive folder "Documents"
    And Anna has a personal-drive file "Notes.txt" in the folder "Documents"
    When Anna opens the files page on a desktop screen
    And Anna opens the folder "Documents" from the table
    And Anna opens the actions of the file "Notes.txt"
    And Anna chooses Move
    Then the move dialog marks the folder "Documents" as the current location
    And the move dialog Move button is disabled

  @screen:files-move-dialog-error
  Scenario: A move the server refuses shows the reason and keeps the dialog open
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Insurance policy.txt"
    And Anna has a personal-drive folder "Documents"
    And Anna has a personal-drive file "Insurance policy.txt" in the folder "Documents"
    When Anna opens the files page on a desktop screen
    And Anna opens the actions of the file "Insurance policy.txt"
    And Anna chooses Move
    And Anna chooses the folder "Documents" in the move dialog
    And Anna confirms the move
    Then the move dialog shows the error "A file or folder with this name already exists here."
    And the move dialog is open

  Scenario: Anna moves a file to a family drive after confirming the copy
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Insurance policy.txt"
    And Anna has the folder "Recipes" in the family drive "Home"
    When Anna opens the files page on a desktop screen
    And Anna opens the actions of the file "Insurance policy.txt"
    And Anna chooses Move
    And Anna chooses the drive "Home" in the move dialog
    Then the move dialog captions "Home" as "Other owner"
    When Anna confirms the move
    Then the move dialog says "This copies it to the other drive and removes the original."
    When Anna confirms the move anyway
    Then the move dialog is closed
    And the table no longer lists "Insurance policy.txt"
    And Anna is told "Insurance policy.txt" was copied to "Home" and removed here

  Scenario: Anna cancels a copy to another owner's drive and the file stays
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Insurance policy.txt"
    And Anna has the folder "Recipes" in the family drive "Home"
    When Anna opens the files page on a desktop screen
    And Anna opens the actions of the file "Insurance policy.txt"
    And Anna chooses Move
    And Anna chooses the drive "Home" in the move dialog
    And Anna confirms the move
    And Anna cancels the move dialog
    Then the table still lists "Insurance policy.txt"
    And Anna sees "Insurance policy.txt" in her personal drive

  Scenario: Changing the target after the copy warning asks again
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Insurance policy.txt"
    And Anna has a personal-drive folder "Documents"
    And Anna has the folder "Recipes" in the family drive "Home"
    When Anna opens the files page on a desktop screen
    And Anna opens the actions of the file "Insurance policy.txt"
    And Anna chooses Move
    And Anna chooses the drive "Home" in the move dialog
    And Anna confirms the move
    And Anna chooses the folder "Documents" in the move dialog
    Then the move dialog does not say "This copies it to the other drive and removes the original."
    And the move dialog Move button is enabled

  Scenario: Anna moves the open file from the details panel
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Insurance policy.txt"
    And Anna has a personal-drive folder "Documents"
    When Anna opens the files page on a desktop screen
    And Anna selects the table row "Insurance policy.txt"
    And Anna chooses Move in the file details panel
    And Anna chooses the folder "Documents" in the move dialog
    And Anna confirms the move
    Then the file details panel is not shown
    And the table no longer lists "Insurance policy.txt"

  Scenario: Anna moves a file from the phone list
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Insurance policy.txt"
    And Anna has a personal-drive folder "Documents"
    When Anna opens her personal drive on a phone
    And Anna opens the actions of the file "Insurance policy.txt"
    And Anna chooses Move
    Then the move dialog is open on a phone
    When Anna chooses the folder "Documents" in the move dialog
    And Anna confirms the move
    Then the phone list no longer reads "Insurance policy.txt"

  @screen:files-phone-move-dialog
  Scenario: Anna opens the move dialog from the phone list
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Insurance policy.txt"
    And Anna has a personal-drive folder "Documents"
    When Anna opens her personal drive on a phone
    And Anna opens the actions of the file "Insurance policy.txt"
    And Anna chooses Move
    Then the move dialog is open on a phone

  @a11y
  Scenario: Anna moves a file with the keyboard and focus returns to the actions button
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Insurance policy.txt"
    And Anna has a personal-drive folder "Documents"
    When Anna opens the files page on a desktop screen
    And Anna opens the actions of the file "Insurance policy.txt" with the keyboard
    And Anna chooses Move with the keyboard
    And Anna moves through the move dialog tree with the arrow keys to "Documents"
    And Anna selects the tree item with Enter
    And Anna confirms the move with the keyboard
    Then the move dialog is closed
    And Anna is told "Insurance policy.txt" was moved to "Documents"

  @a11y
  Scenario: Escape closes the move dialog and returns focus to the actions button
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Insurance policy.txt"
    When Anna opens the files page on a desktop screen
    And Anna opens the actions of the file "Insurance policy.txt" with the keyboard
    And Anna chooses Move with the keyboard
    And Anna presses Escape
    Then the move dialog is closed
    And the actions button of "Insurance policy.txt" has focus

  @a11y
  Scenario: The open move dialog has no serious accessibility violations
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Insurance policy.txt"
    When Anna opens the files page on a desktop screen
    And Anna opens the actions of the file "Insurance policy.txt"
    And Anna chooses Move
    Then the page has no serious accessibility violations
