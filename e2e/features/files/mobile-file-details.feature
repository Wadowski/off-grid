# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:files @ui @wip
Feature: File details on a phone

  On a phone a person taps a file to see its details: what it is, where it
  sits, when it changed, who can see it and what happened to it. Back returns
  to the folder that holds the file.

  @screen:files-mobile-file-details
  Scenario: Tapping a file opens its details
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Insurance policy.txt"
    And Anna opens her personal drive on a phone
    When Anna taps the file row "Insurance policy.txt"
    Then Anna sees the details of "Insurance policy.txt" with type, size, location, modified, created and version

  Scenario: The details of a file in a nested folder show the folder path as its location
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has the nested folders "Photos" and "Summer" in her personal drive
    And Anna has a personal-drive file "Beach.jpg" in the folder "Summer"
    And Anna opens the folder "Summer" in the browser on a phone
    When Anna taps the file row "Beach.jpg"
    Then the details location reads "Personal", "Photos" and "Summer"

  Scenario: Back from the details returns to the folder that holds the file
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive folder "Photos"
    And Anna has a personal-drive file "Summer.jpg" in the folder "Photos"
    And Anna opens the folder "Photos" in the browser on a phone
    And Anna taps the file row "Summer.jpg"
    When Anna taps the details Back control
    Then the phone list reads "Summer.jpg"

  Scenario: Back from the details of a file at the drive root returns to the drive root
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Insurance policy.txt"
    And Anna opens her personal drive on a phone
    And Anna taps the file row "Insurance policy.txt"
    When Anna taps the details Back control
    Then the phone folder path reads "Personal"

  Scenario: A member opens the details of a file in a family drive
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna is a member of the family "Kowalski" with a family drive
    And a family member has uploaded the file "Holiday plan.pdf" to the family drive
    When Anna opens the details of "Holiday plan.pdf" in the family drive on a phone
    Then Anna sees the details of "Holiday plan.pdf" with type, size, location, modified, created and version

  Scenario: A file that was trashed shows File not found with a link to Files
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Old notes.txt"
    And Anna has trashed the file "Old notes.txt"
    When Anna opens the details of "Old notes.txt" on a phone
    Then Anna sees the file not found view with a link to Files

  Scenario: An unknown file id shows File not found with a link to Files
    Given I am signed in as "Anna Kowalska", a regular member
    When Anna opens a file link that does not exist on a phone
    Then Anna sees the file not found view with a link to Files

  Scenario: A folder id in the details link opens the folder
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive folder "Photos"
    When Anna opens the details link of the folder "Photos" on a phone
    Then the folder path reads "Personal" and "Photos"

  Scenario: A very long file name does not make the details page scroll sideways
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file with a very long name
    When Anna opens the details of the file with a very long name on a phone
    Then the phone page does not scroll sideways

  @a11y
  Scenario: The file details screen has no serious accessibility violations
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Insurance policy.txt"
    When Anna opens the details of "Insurance policy.txt" on a phone
    Then the page has no serious accessibility violations

  Scenario: A file in a family drive lists every family member under Who has access
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna is a member of the family "Kowalski" with a family drive
    And a family member has uploaded the file "Holiday plan.pdf" to the family drive
    When Anna opens the details of "Holiday plan.pdf" in the family drive on a phone
    Then "Who has access" lists every family member with their role and "Can edit"

  Scenario: A file in the personal drive lists only its owner under Who has access
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Insurance policy.txt"
    When Anna opens the details of "Insurance policy.txt" on a phone
    Then "Who has access" lists only "Anna Kowalska" as "Owner"

  Scenario: Modified shows who saved the current version
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna is a member of the family "Kowalski" with a family drive
    And Ben has uploaded the file "Holiday plan.pdf" to the family drive
    And Ben has saved a new version of "Holiday plan.pdf"
    When Anna opens the details of "Holiday plan.pdf" in the family drive on a phone
    Then Modified shows "by Ben"

  Scenario: The Activity tab lists the versions, newest first, with who saved each
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna is a member of the family "Kowalski" with a family drive
    And Ben has uploaded the file "Holiday plan.pdf" to the family drive
    And Ben has saved a new version of "Holiday plan.pdf"
    When Anna opens the details of "Holiday plan.pdf" in the family drive on a phone
    And Anna opens the Activity tab
    Then the Activity list reads "Ben saved version 2" then "Ben added the file"

  Scenario: The details screen shows no sections for links, tags, notes, encryption or sharing
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Insurance policy.txt"
    When Anna opens the details of "Insurance policy.txt" on a phone
    Then the details screen has no Linked entities, Tags and notes, Encrypted or Share section
