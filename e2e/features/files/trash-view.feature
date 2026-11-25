# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:files @ui
Feature: Viewing and restoring trashed items in the trash view

  The trash view lists the items in the trash of a drive, with the day each
  one was deleted. Restoring an item takes it out of the trash and puts it
  back in its place. The trash view lists only the items that are not inside
  another trashed item, and a notice names what was restored.

  @wip @screen:files-trash
  Scenario: Anna sees her deleted file in the trash view
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Old receipt.pdf" in the trash
    When Anna opens the trash of her personal drive on a desktop screen
    Then the trash view lists "Old receipt.pdf" with a deleted date and a Restore button

  @wip
  Scenario: Anna restores a file and opens the folder it returns to
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive folder "Holiday"
    And Anna has a file "sunset.jpg" in the folder "Holiday" in the trash
    When Anna opens the trash of her personal drive on a desktop screen
    And Anna restores "sunset.jpg" from the trash view
    Then the trash view notice says "sunset.jpg" was restored
    When Anna follows the link in the trash view notice
    Then the table lists the file "sunset.jpg"

  @wip @screen:files-trash-empty
  Scenario: Anna restores a folder and the trash view becomes empty
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a trashed personal-drive folder "Holiday" holding a file "sunset.jpg"
    When Anna opens the trash of her personal drive on a desktop screen
    And Anna restores "Holiday" from the trash view
    Then the trash view notice says "Holiday" was restored
    And the trash view says the trash is empty

  @wip
  Scenario: A file trashed inside a trashed folder appears once its folder is restored
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a trashed personal-drive folder "Holiday" holding a trashed file "sunset.jpg"
    When Anna opens the trash of her personal drive on a desktop screen
    Then the trash view lists "Holiday"
    And the trash view does not list "sunset.jpg"
    When Anna restores "Holiday" from the trash view
    Then the trash view lists "sunset.jpg"

  @wip
  Scenario: Anna restores a file whose name is taken and is told the numbered name
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Report.pdf" in the trash
    And Anna has a personal-drive file "Report.pdf"
    When Anna opens the trash of her personal drive on a desktop screen
    And Anna restores "Report.pdf" from the trash view
    Then the trash view notice says "Report (2).pdf" was restored

  @wip
  Scenario: An empty trash says it is empty
    Given I am signed in as "Anna Kowalska", a regular member
    When Anna opens the trash of her personal drive on a desktop screen
    Then the trash view says the trash is empty

  @wip
  Scenario: Anna restores a file from the trash of a family drive
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has the folder "Plans" in the family drive "Home"
    And Anna has a file "Insurance policy.pdf" in the trash of the family drive "Home"
    When Anna opens the trash of the family drive "Home" on a desktop screen
    And Anna restores "Insurance policy.pdf" from the trash view
    Then the trash view notice says "Insurance policy.pdf" was restored

  @wip @screen:files-trash-phone
  Scenario: Anna opens the trash from the phone top row and restores a file
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Old receipt.pdf" in the trash
    When Anna opens the Files page on a phone
    And Anna opens the trash from the phone top row
    Then the trash view lists "Old receipt.pdf" with a deleted date and a Restore button
    When Anna restores "Old receipt.pdf" from the trash view
    Then the trash view does not list "Old receipt.pdf"

  @wip
  Scenario: Restoring an item that was already restored shows an error and keeps the page usable
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Old receipt.pdf" in the trash
    When Anna opens the trash of her personal drive on a desktop screen
    And the file "Old receipt.pdf" is restored in another window
    And Anna restores "Old receipt.pdf" from the trash view
    Then the trash view shows the error "This item isn't in the trash."
    And the trash view does not list "Old receipt.pdf"

  @wip @a11y
  Scenario: The sidebar Trash entry is the current page on the trash view
    Given I am signed in as "Anna Kowalska", a regular member
    When Anna opens the trash of her personal drive on a desktop screen
    Then the sidebar Trash entry is the current page
