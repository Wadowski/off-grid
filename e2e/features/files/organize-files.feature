# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:files
Feature: Organising folders

  A person creates folders, renames them and moves them between drives they
  may use. A name is never shared by two live entries in the same folder, and
  a folder never moves into itself. Anything the person may not see is shown
  as not found.

  @wip
  Scenario: Anna creates a folder in her personal drive
    Given a new person Anna signs up
    When Anna creates the folder "Holiday" in her personal drive
    Then Anna sees the folder "Holiday" in her personal drive

  @wip
  Scenario: Anna creates a folder inside a folder
    Given a new person Anna signs up
    And Anna has a folder "Holiday" in her personal drive
    When Anna creates the folder "Beach" inside "Holiday"
    Then Anna sees the folder "Beach" inside "Holiday"

  @wip
  Scenario: Anna cannot create a second folder with the same name in the same folder
    Given a new person Anna signs up
    And Anna has a folder "Holiday" in her personal drive
    When Anna creates the folder "holiday" in her personal drive
    Then Anna is told the name is taken

  @wip
  Scenario: Anna renames a folder
    Given a new person Anna signs up
    And Anna has a folder "Holiday" in her personal drive
    When Anna renames the folder "Holiday" to "Summer"
    Then Anna sees the folder "Summer" in her personal drive
    And Anna does not see the folder "Holiday" in her personal drive

  @wip
  Scenario: Anna cannot rename a folder to the name of a sibling
    Given a new person Anna signs up
    And Anna has a folder "Holiday" in her personal drive
    And Anna has a folder "Work" in her personal drive
    When Anna renames the folder "Work" to "holiday"
    Then Anna is told the name is taken

  @wip
  Scenario: Anna moves a folder into another folder
    Given a new person Anna signs up
    And Anna has a folder "Holiday" in her personal drive
    And Anna has a folder "Photos" in her personal drive
    When Anna moves the folder "Holiday" into "Photos"
    Then Anna sees the folder "Holiday" inside "Photos"

  @wip
  Scenario: Anna cannot move a folder into itself
    Given a new person Anna signs up
    And Anna has a folder "Holiday" in her personal drive
    When Anna moves the folder "Holiday" into "Holiday"
    Then Anna is told the move is not allowed

  @wip
  Scenario: Anna cannot move a folder into one of its subfolders
    Given a new person Anna signs up
    And Anna has the folders "Holiday" and "Beach" nested in her personal drive
    When Anna moves the folder "Holiday" into "Beach"
    Then Anna is told the move is not allowed

  @wip
  Scenario: Anna cannot move a folder into a folder that already has its name
    Given a new person Anna signs up
    And Anna has a folder "Holiday" in her personal drive
    And Anna has a folder "Photos" with a folder "Holiday" inside it
    When Anna moves the folder "Holiday" into "Photos"
    Then Anna is told the name is taken

  @wip
  Scenario: Anna moves a folder from her personal drive to the family drive
    Given a new person Anna signs up
    And a new family named "The Smiths" is created by Anna
    And Anna has a folder "Holiday" in her personal drive
    When Anna moves the folder "Holiday" to the family drive of "The Smiths"
    Then Anna is told the folder was moved to another owner

  @wip
  Scenario: A moved folder keeps its subfolders in the family drive
    Given a new person Anna signs up
    And a new family named "The Smiths" is created by Anna
    And Anna has the folders "Holiday" and "Beach" nested in her personal drive
    When Anna moves the folder "Holiday" to the family drive of "The Smiths"
    Then Anna sees the folder "Beach" inside "Holiday" in the family drive of "The Smiths"

  @wip
  Scenario: A moved folder leaves her personal drive
    Given a new person Anna signs up
    And a new family named "The Smiths" is created by Anna
    And Anna has a folder "Holiday" in her personal drive
    When Anna moves the folder "Holiday" to the family drive of "The Smiths"
    Then Anna does not see the folder "Holiday" in her personal drive

  @wip
  Scenario: Anna cannot move a folder to a drive she cannot see
    Given a new person Anna signs up
    And a new family named "The Smiths" is created by Anna
    And a new person Ben signs up
    And Ben has a folder "Work" in his personal drive
    And Anna has a folder "Holiday" in her personal drive
    When Anna moves the folder "Holiday" to the personal drive of Ben
    Then Anna is told the folder was not found

  @wip
  Scenario: A family member creates a folder in the family drive
    Given a new person Anna signs up
    And a new family named "The Smiths" is created by Anna
    And a new person Ben signs up
    And Ben joins the family "The Smiths"
    When Ben creates the folder "Holiday" in the family drive of "The Smiths"
    Then Anna sees the folder "Holiday" in the family drive of "The Smiths"

  @wip
  Scenario: Ben cannot create a folder in the family drive of another family
    Given a new person Anna signs up
    And a new family named "The Smiths" is created by Anna
    And a new person Ben signs up
    When Ben creates the folder "Holiday" in the family drive of "The Smiths"
    Then Ben is told the drive was not found

  @wip
  Scenario: Ben cannot rename a folder in the family drive of another family
    Given a new person Anna signs up
    And a new family named "The Smiths" is created by Anna
    And Anna has a folder "Holiday" in the family drive of "The Smiths"
    And a new person Ben signs up
    When Ben renames the folder "Holiday" in the family drive of "The Smiths" to "Summer"
    Then Ben is told the folder was not found

  @wip
  Scenario: Ben cannot move a folder out of the family drive of another family
    Given a new person Anna signs up
    And a new family named "The Smiths" is created by Anna
    And Anna has a folder "Holiday" in the family drive of "The Smiths"
    And a new person Ben signs up
    When Ben moves the folder "Holiday" from the family drive of "The Smiths" to his personal drive
    Then Ben is told the folder was not found
