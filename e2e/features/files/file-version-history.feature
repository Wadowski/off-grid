# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:files @ui
Feature: Version history in the file details

  Selecting a file shows its versions newest first, with the current version
  marked. A person can upload a new version, restore an earlier version,
  download an earlier version and delete an earlier version. The current
  version cannot be deleted. The same versions are listed on the phone details
  screen.

  @screen:files-desktop-file-versions
  Scenario: Selecting a file lists its versions newest first with the newest marked current
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Notes.txt" with the content "first draft"
    And Anna uploads a new version of "Notes.txt" with the content "second draft"
    When Anna opens the files page on a desktop screen
    And Anna selects the table row "Notes.txt"
    Then the versions section lists 2 versions with version 2 first
    And the version 2 row is marked as current
    And the version 2 row shows the author "Anna Kowalska" and a size

  Scenario: Uploading a new version with the picker makes it the current version
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Notes.txt" with the content "first draft"
    When Anna opens the files page on a desktop screen
    And Anna selects the table row "Notes.txt"
    And Anna uploads a new version of "Notes.txt" from the versions section with the content "second draft"
    Then the versions section lists 2 versions with version 2 first
    And the file details panel shows the size of "Notes.txt" as 12 bytes

  Scenario: Restoring an earlier version adds a new current version
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Notes.txt" with the content "first draft"
    And Anna uploads a new version of "Notes.txt" with the content "second draft"
    When Anna opens the files page on a desktop screen
    And Anna selects the table row "Notes.txt"
    And Anna restores version 1 from the versions section
    Then the versions section lists 3 versions with version 3 first
    And the version 3 row is marked as current
    And the file details panel shows the size of "Notes.txt" as 11 bytes

  Scenario: Deleting an earlier version after confirmation removes it
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Notes.txt" with the content "first draft"
    And Anna uploads a new version of "Notes.txt" with the content "second draft"
    When Anna opens the files page on a desktop screen
    And Anna selects the table row "Notes.txt"
    And Anna deletes version 1 from the versions section and confirms
    Then the versions section lists 1 version with version 2 first

  Scenario: Cancelling the delete confirmation keeps the version
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Notes.txt" with the content "first draft"
    And Anna uploads a new version of "Notes.txt" with the content "second draft"
    When Anna opens the files page on a desktop screen
    And Anna selects the table row "Notes.txt"
    And Anna deletes version 1 from the versions section and cancels
    Then the versions section lists 2 versions with version 2 first

  Scenario: The current version offers no delete action
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Notes.txt" with the content "first draft"
    When Anna opens the files page on a desktop screen
    And Anna selects the table row "Notes.txt"
    Then the version 1 row offers no delete action

  Scenario: Downloading an earlier version saves its content
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Notes.txt" with the content "first draft"
    And Anna uploads a new version of "Notes.txt" with the content "second draft"
    When Anna opens the files page on a desktop screen
    And Anna selects the table row "Notes.txt"
    And Anna downloads version 1 from the versions section
    Then the download is the content "first draft" named "Notes.txt"

  @screen:files-mobile-file-versions
  Scenario: The phone details screen lists the versions with the author of a family file
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a family "Home" with a file "Plan.txt" with the content "first draft"
    And Anna uploads a new version of "Plan.txt" in the family drive with the content "second draft"
    When Anna opens the details of "Plan.txt" in the family drive of "Home" on a phone
    Then the phone versions section lists 2 versions with version 2 first

  Scenario: A version can be restored from the phone details screen
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Notes.txt" with the content "first draft"
    And Anna uploads a new version of "Notes.txt" with the content "second draft"
    When Anna opens the details of "Notes.txt" on a phone
    And Anna restores version 1 from the phone versions section
    Then the phone versions section lists 3 versions with version 3 first

  @a11y
  Scenario: The versions section has no serious accessibility violations and Escape closes only the delete dialog
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Notes.txt" with the content "first draft"
    And Anna uploads a new version of "Notes.txt" with the content "second draft"
    When Anna opens the files page on a desktop screen
    And Anna selects the table row "Notes.txt"
    Then the page has no serious accessibility violations
    When Anna opens the delete confirmation for version 1 from the versions section
    And Anna presses Escape in the delete confirmation
    Then the delete confirmation is not shown
    And the file details panel is shown
