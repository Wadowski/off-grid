# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:files
Feature: Uploading files into a drive

  A person uploads a file into a drive they can use, at the root or inside a
  folder. The file keeps its name, and the other members of the family see it
  in the family drive. An upload that uses a taken name, or that goes where
  the person cannot see, is refused, and nothing is kept.

  Scenario: Anna uploads a file to her personal drive and sees it there
    Given a new person Anna signs up
    When Anna uploads the file "Holiday.txt" to her personal drive
    Then Anna sees the file "Holiday.txt" in her personal drive

  Scenario: Ben sees a file that Anna uploads to the family drive
    Given a new person Anna signs up
    And a new family named "The Smiths" is created by Anna
    And a new person Ben signs up
    And Ben joins the family "The Smiths"
    When Anna uploads the file "Insurance policy.pdf" to the family drive of "The Smiths"
    Then Ben sees the file "Insurance policy.pdf" in the family drive of "The Smiths"

  Scenario: Anna uploads a file into a folder
    Given a new person Anna signs up
    And Anna has a folder "Photos" in her personal drive
    When Anna uploads the file "Beach.jpg" into the folder "Photos"
    Then Anna sees the file "Beach.jpg" in the folder "Photos"

  Scenario: Anna cannot upload a file with the name of a file in the same folder
    Given a new person Anna signs up
    And Anna has a file "Holiday.txt" in her personal drive
    When Anna uploads the file "Holiday.txt" to her personal drive
    Then Anna is told a file with this name already exists

  Scenario: Anna cannot upload a file larger than the allowed size
    Given a new person Anna signs up
    When Anna uploads the file "Huge.txt" that is larger than the upload limit to her personal drive
    Then Anna is told the file is too large and nothing is kept in her personal drive

  Scenario: A person outside the family cannot upload into the family drive
    Given a new person Anna signs up
    And a new family named "The Smiths" is created by Anna
    And a new person Ben signs up
    When Ben uploads the file "Secret.txt" to the family drive of "The Smiths"
    Then Ben is told the drive was not found
