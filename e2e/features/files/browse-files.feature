# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:files
Feature: Browsing drives and folders

  A person sees the drives they may use and can open the folders and files
  inside them. Anything that belongs to another family or another person, or
  that was moved to the trash, is shown as not found.

  Scenario: Anna sees her personal drive and the family drive of her family
    Given a new person Anna signs up
    And a new family named "The Smiths" is created by Anna
    When Anna lists her drives
    Then Anna sees her personal drive named "Personal"
    And Anna sees the family drive named "The Smiths"

  Scenario: Ben cannot open the family drive of another family
    Given a new person Anna signs up
    And a new family named "The Smiths" is created by Anna
    And a new person Ben signs up
    When Ben opens the family drive of "The Smiths"
    Then Ben is told the drive was not found

  Scenario: Ben cannot open the personal drive of another person
    Given a new person Anna signs up
    And Anna has a personal drive
    And a new person Ben signs up
    When Ben opens the personal drive of Anna
    Then Ben is told the drive was not found

  # Blocked: needs folders and files created through the API, blocked on OG-113 and OG-114
  @wip
  Scenario: Ben cannot open a file in the family drive of another family
    Given a new person Anna signs up
    And a new family named "The Smiths" is created by Anna
    And Anna has a file "Insurance policy.pdf" in the family drive of "The Smiths"
    And a new person Ben signs up
    When Ben opens the file "Insurance policy.pdf"
    Then Ben is told the file was not found

  Scenario: Anna cannot open a folder that does not exist
    Given a new person Anna signs up
    When Anna opens a folder that does not exist
    Then Anna is told the folder was not found

  Scenario: Anna cannot open a file that does not exist
    Given a new person Anna signs up
    When Anna opens a file that does not exist
    Then Anna is told the file was not found

  @wip
  Scenario: Anna opens a folder and sees its entries, folders first
    Given a new person Anna signs up
    And Anna has a folder "Holiday" with a folder "Beach" and a file "notes.txt"
    When Anna opens the folder "Holiday"
    Then Anna sees the entries "Beach" and "notes.txt" in that order
    And the breadcrumbs of the folder are "Personal" then "Holiday"

  @wip
  Scenario: Anna opens a nested folder and sees the path from the drive
    Given a new person Anna signs up
    And Anna has the folders "Holiday" and "Beach" nested in her personal drive
    When Anna opens the folder "Beach"
    Then the breadcrumbs of the folder are "Personal", "Holiday" and "Beach"

  @wip
  Scenario: Anna opens a file and sees its details with the path to it
    Given a new person Anna signs up
    And Anna has a file "Insurance policy.pdf" in the folder "Documents"
    When Anna opens the file "Insurance policy.pdf"
    Then Anna sees the file "Insurance policy.pdf" with the breadcrumbs "Personal" and "Documents"

  @wip
  Scenario: A trashed file is not listed in its folder
    Given a new person Anna signs up
    And Anna has a folder "Documents" with a trashed file "Old receipt.pdf"
    When Anna opens the folder "Documents"
    Then Anna does not see "Old receipt.pdf"

  # Blocked: needs folders and files created through the API, blocked on OG-113 and OG-114
  @wip
  Scenario: Anna cannot open a trashed file
    Given a new person Anna signs up
    And Anna has a folder "Documents" with a trashed file "Old receipt.pdf"
    When Anna opens the file "Old receipt.pdf"
    Then Anna is told the file was not found

  # Blocked: needs folders and files created through the API, blocked on OG-113 and OG-114
  @wip
  Scenario: Anna cannot open a trashed folder
    Given a new person Anna signs up
    And Anna has a trashed folder "Old photos" in her personal drive
    When Anna opens the folder "Old photos"
    Then Anna is told the folder was not found

  # Blocked: needs folders and files created through the API, blocked on OG-113 and OG-114
  @wip
  Scenario: Ben cannot open a folder inside the family drive of another family
    Given a new person Anna signs up
    And a new family named "The Smiths" is created by Anna
    And Anna has a folder "Holiday" in the family drive of "The Smiths"
    And a new person Ben signs up
    When Ben opens the folder "Holiday"
    Then Ben is told the folder was not found

  @wip
  Scenario: A big folder is shown page by page
    Given a new person Anna signs up
    And Anna has a folder "Photos" holding 120 files
    When Anna opens the folder "Photos"
    Then Anna sees 50 entries with a way to get the next page
