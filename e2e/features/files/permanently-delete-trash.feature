# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:files @ui
Feature: Deleting trashed items for good from the trash view

  The trash view lets a person delete a trashed item for good, or empty the
  whole trash of a drive. Both actions ask for confirmation first, say that
  nothing can be undone, and mention that items in the trash are also removed
  automatically after 30 days. Cancelling keeps everything in the trash.

  @screen:files-trash-purge-confirm
  Scenario: Anna permanently deletes a trashed file after confirming
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a trashed personal-drive file "Old receipt.pdf"
    When Anna opens the trash of her personal drive on a desktop screen
    And Anna asks to delete "Old receipt.pdf" permanently
    Then the purge dialog names "Old receipt.pdf" and says it can't be undone
    And the purge dialog says items in the trash are removed automatically after 30 days
    When Anna confirms deleting permanently
    Then the trash view does not list "Old receipt.pdf"

  Scenario: Anna cancels permanently deleting a trashed file
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a trashed personal-drive file "Old receipt.pdf"
    When Anna opens the trash of her personal drive on a desktop screen
    And Anna asks to delete "Old receipt.pdf" permanently
    And Anna cancels deleting permanently
    Then the trash view lists "Old receipt.pdf" with a deleted date and a Restore button

  Scenario: Anna permanently deletes a trashed folder and is told everything inside goes too
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a trashed personal-drive folder "Holiday" holding a file "sunset.jpg"
    When Anna opens the trash of her personal drive on a desktop screen
    And Anna asks to delete "Holiday" permanently
    Then the purge dialog says everything inside "Holiday" is deleted too
    When Anna confirms deleting permanently
    Then the trash view says the trash is empty

  @screen:files-trash-empty-confirm
  Scenario: Anna empties the trash of her personal drive
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a trashed personal-drive file "Old receipt.pdf"
    And Anna has a trashed personal-drive folder "Holiday" holding a file "sunset.jpg"
    When Anna opens the trash of her personal drive on a desktop screen
    And Anna asks to empty the trash
    Then the empty trash dialog says everything in the trash of this drive will be deleted permanently
    When Anna confirms emptying the trash
    Then the trash view says the trash is empty

  Scenario: Anna cancels emptying the trash
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a trashed personal-drive file "Old receipt.pdf"
    When Anna opens the trash of her personal drive on a desktop screen
    And Anna asks to empty the trash
    And Anna cancels emptying the trash
    Then the trash view lists "Old receipt.pdf" with a deleted date and a Restore button

  Scenario: The empty trash action is not offered when the trash is empty
    Given I am signed in as "Anna Kowalska", a regular member
    When Anna opens the trash of her personal drive on a desktop screen
    Then the trash view does not offer to empty the trash

  @screen:files-trash-purge-phone
  Scenario: Anna permanently deletes a trashed file from the phone trash view
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a trashed personal-drive file "Old receipt.pdf"
    When Anna opens the Files page on a phone
    And Anna opens the trash from the phone top row
    And Anna asks to delete "Old receipt.pdf" permanently
    And Anna confirms deleting permanently
    Then the trash view does not list "Old receipt.pdf"

  Scenario: Deleting permanently an item that was already restored elsewhere shows an error
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a trashed personal-drive file "Old receipt.pdf"
    When Anna opens the trash of her personal drive on a desktop screen
    And Anna asks to delete "Old receipt.pdf" permanently
    And the file "Old receipt.pdf" is restored in another window
    And Anna confirms deleting permanently
    Then the purge dialog shows the error "This item isn't in the trash."
    When Anna cancels deleting permanently
    Then the trash view does not list "Old receipt.pdf"

  @a11y
  Scenario: The purge dialog is labelled and Escape closes it
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a trashed personal-drive file "Old receipt.pdf"
    When Anna opens the trash of her personal drive on a desktop screen
    And Anna asks to delete "Old receipt.pdf" permanently
    Then the purge dialog is labelled "Delete permanently?"
    When Anna presses Escape
    Then the trash view lists "Old receipt.pdf" with a deleted date and a Restore button
