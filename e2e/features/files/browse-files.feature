# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:files
Feature: Browsing drives and folders

  A person sees the drives they may use and can open the folders and files
  inside them. Anything that belongs to another family or another person, or
  that was moved to the trash, is shown as not found.

  Scenario: Anna sees her personal drive and the family drive of her family
    Given a new person Anna signs up
    And Anna creates a family named "The Smiths"
    When Anna lists her drives
    Then Anna sees her personal drive named "Personal"
    And Anna sees the family drive named "The Smiths"

  Scenario: Ben cannot open the family drive of another family
    Given a new person Anna signs up
    And Anna creates a family named "The Smiths"
    And a new person Ben signs up
    When Ben opens the family drive of "The Smiths"
    Then Ben gets not found

  Scenario: Anna cannot open a folder or a file that does not exist
    Given a new person Anna signs up
    When Anna opens a folder that does not exist
    Then Anna gets not found
    When Anna opens a file that does not exist
    Then Anna gets not found

  @wip
  Scenario: Anna opens a folder and sees its entries, folders first
    Given Anna has a folder "Holiday" with a folder "Beach" and a file "notes.txt"
    When Anna opens the folder "Holiday"
    Then Anna sees the entries "Beach" and "notes.txt" in that order
    And the breadcrumbs of the folder are "Personal" then "Holiday"

  @wip
  Scenario: Anna opens a nested folder and sees the path from the drive
    Given Anna has the folders "Holiday" and "Beach" nested in her personal drive
    When Anna opens the folder "Beach"
    Then the breadcrumbs of the folder are "Personal", "Holiday" and "Beach"

  @wip
  Scenario: Anna opens a file and sees its details with the path to it
    Given Anna has a file "Insurance policy.pdf" in the folder "Documents"
    When Anna opens the file "Insurance policy.pdf"
    Then Anna sees the file "Insurance policy.pdf" with the breadcrumbs "Personal" and "Documents"

  @wip
  Scenario: A trashed file is not listed in its folder
    Given Anna has a folder "Documents" with a trashed file "Old receipt.pdf"
    When Anna opens the folder "Documents"
    Then Anna does not see "Old receipt.pdf"

  @wip
  Scenario: A big folder is shown page by page
    Given Anna has a folder "Photos" holding 120 files
    When Anna opens the folder "Photos"
    Then Anna sees 50 entries with a way to get the next page
