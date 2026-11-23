# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:files @wip
Feature: Moving files to the trash, restoring them and deleting them for good

  A person can move a file or folder to the trash. It disappears from the
  places it was shown, stays in the trash until it is restored or deleted,
  and can be deleted for good. Members of a family can do the same with the
  family drive. Others are told the entry was not found.

  Scenario: Anna moves a file to the trash and no longer sees it in her drive
    Given a new person Anna signs up
    And Anna has a file "Old receipt.pdf" in her personal drive
    When Anna moves the file "Old receipt.pdf" to the trash
    Then Anna does not see "Old receipt.pdf" in her personal drive
    And Anna sees "Old receipt.pdf" in the trash of her personal drive

  Scenario: Anna moves a folder to the trash and cannot open what is inside
    Given a new person Anna signs up
    And Anna has a folder "Holiday" with a file "sunset.jpg"
    When Anna moves the folder "Holiday" to the trash
    Then Anna cannot open the folder "Holiday"
    And Anna cannot open the file "sunset.jpg"

  Scenario: Anna restores a folder and sees it again with its file
    Given a new person Anna signs up
    And Anna has a folder "Holiday" with a file "sunset.jpg" in the trash
    When Anna restores the folder "Holiday"
    Then Anna sees the folder "Holiday" in her personal drive
    And Anna sees the file "sunset.jpg" inside the folder "Holiday"

  Scenario: Anna restores a file whose folder is in the trash and finds it at the root of her drive
    Given a new person Anna signs up
    And Anna has a file "sunset.jpg" in a folder "Holiday" that is in the trash
    When Anna restores the file "sunset.jpg"
    Then Anna sees the file "sunset.jpg" at the root of her personal drive

  Scenario: Anna restores a file whose name is now used and gets a numbered name
    Given a new person Anna signs up
    And Anna has a file "Report.pdf" in the trash
    And Anna has a file "Report.pdf" in her personal drive
    When Anna restores the file "Report.pdf" from the trash
    Then Anna sees the file "Report (2).pdf" in her personal drive

  Scenario: Anna permanently deletes one trashed file
    Given a new person Anna signs up
    And Anna has a file "Old receipt.pdf" in the trash
    When Anna permanently deletes the file "Old receipt.pdf"
    Then Anna does not see "Old receipt.pdf" in the trash
    And Anna cannot download the file "Old receipt.pdf"

  Scenario: Anna empties her trash
    Given a new person Anna signs up
    And Anna has a file "Old receipt.pdf" in the trash
    When Anna empties the trash of her personal drive
    Then the trash of her personal drive is empty

  Scenario: Ben, a family member, moves a family file to the trash and restores it
    Given a new family named "The Smiths" is created by Anna
    And a new person Ben signs up
    And Ben is a member of "The Smiths"
    And Anna has a file "Insurance policy.pdf" in the family drive of "The Smiths"
    When Ben moves the file "Insurance policy.pdf" to the trash
    Then Ben sees "Insurance policy.pdf" in the trash of the family drive of "The Smiths"
    When Ben restores the file "Insurance policy.pdf"
    Then Ben sees "Insurance policy.pdf" in the family drive of "The Smiths"

  Scenario: Chris, who is not a member, is told the file is not found when he trashes it
    Given a new family named "The Smiths" is created by Anna
    And Anna has a file "Insurance policy.pdf" in the family drive of "The Smiths"
    And a new person Chris signs up
    When Chris moves the file "Insurance policy.pdf" to the trash
    Then Chris is told the file was not found

  Scenario: Anna cannot permanently delete a file that is not in the trash
    Given a new person Anna signs up
    And Anna has a file "Holiday.jpg" in her personal drive
    When Anna permanently deletes the file "Holiday.jpg"
    Then Anna is told the file is not in the trash
