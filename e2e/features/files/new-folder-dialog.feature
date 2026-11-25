# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:files @ui
Feature: Creating a folder from the Files page

  A person creates a folder in the folder they have open, from a dialog with
  one name field. The folder appears in the list without a reload. A name that
  is empty, that uses a character a folder name may not hold, or that is
  already used in the same folder is refused in the dialog, and the dialog
  stays open with the typed name. Closing the dialog creates nothing.

  @screen:files-new-folder-dialog
  Scenario: Anna opens the New folder dialog from the desktop header
    Given I am signed in as "Anna Kowalska", a regular member
    When Anna opens the files page on a desktop screen
    And Anna chooses New folder
    Then the New folder dialog is open
    And the New folder dialog has its name field focused

  Scenario: Anna creates a folder in her personal drive from the dialog
    Given I am signed in as "Anna Kowalska", a regular member
    When Anna opens the files page on a desktop screen
    And Anna chooses New folder
    And Anna creates the folder "Holiday" from the New folder dialog
    Then the New folder dialog is closed
    And the table lists the folder "Holiday"

  Scenario: Anna creates a folder inside the folder she has open
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive folder "Photos"
    When Anna opens the files page on a desktop screen
    And Anna opens the folder "Photos" from the table
    And Anna chooses New folder
    And Anna creates the folder "Beach" from the New folder dialog
    Then the table lists the folder "Beach"

  Scenario: Anna creates a folder in the family drive from the dialog
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has the folder "Recipes" in the family drive "Home"
    When Anna opens the files page on a desktop screen
    And Anna chooses the drive "Home" in the sidebar
    And Anna chooses New folder
    And Anna creates the folder "Lunch plans" from the New folder dialog
    Then the table lists the folder "Lunch plans"

  Scenario: A name already used in the folder is refused and the dialog stays open
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive folder "Holiday"
    When Anna opens the files page on a desktop screen
    And Anna chooses New folder
    And Anna submits the New folder dialog with the name "holiday"
    Then the New folder dialog shows "A file or folder with this name already exists here."
    And the New folder dialog is open

  Scenario: An empty name is refused before anything is created
    Given I am signed in as "Anna Kowalska", a regular member
    When Anna opens the files page on a desktop screen
    And Anna chooses New folder
    And Anna submits the New folder dialog with the name ""
    Then the New folder dialog shows "Enter a name for the folder."
    And the New folder dialog is open

  Scenario: A name with a slash is refused
    Given I am signed in as "Anna Kowalska", a regular member
    When Anna opens the files page on a desktop screen
    And Anna chooses New folder
    And Anna submits the New folder dialog with the name "Work/2026"
    Then the New folder dialog shows "A name can't contain slashes or be only dots."

  Scenario: Cancel closes the dialog without creating a folder
    Given I am signed in as "Anna Kowalska", a regular member
    When Anna opens the files page on a desktop screen
    And Anna chooses New folder
    And Anna types "Draft" in the New folder dialog
    And Anna chooses Cancel in the New folder dialog
    Then the New folder dialog is closed
    And the table does not list the folder "Draft"

  Scenario: Escape closes the dialog without creating a folder
    Given I am signed in as "Anna Kowalska", a regular member
    When Anna opens the files page on a desktop screen
    And Anna chooses New folder
    And Anna types "Draft" in the New folder dialog
    And Anna presses Escape in the New folder dialog
    Then the New folder dialog is closed
    And the table does not list the folder "Draft"

  Scenario: Anna creates a folder from the New folder action on the phone
    Given I am signed in as "Anna Kowalska", a regular member
    When Anna opens her personal drive on a phone
    And Anna chooses New folder
    And Anna creates the folder "Trip" from the New folder dialog
    Then the New folder dialog is closed
    And the phone list shows the folder "Trip"

  @a11y
  Scenario: The open New folder dialog has no serious accessibility violations
    Given I am signed in as "Anna Kowalska", a regular member
    When Anna opens the files page on a desktop screen
    And Anna chooses New folder
    Then the page has no serious accessibility violations
