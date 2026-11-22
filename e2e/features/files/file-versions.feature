# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:files
Feature: Keeping the earlier versions of a file

  A person uploads a new version of a file, and the earlier versions stay
  listed. The newest version is the one the file shows. A person can restore
  an earlier version, which makes it the current version again as a new
  version, and can delete an earlier version that is no longer needed. The
  current version cannot be deleted. A person who cannot see a file gets
  "not found" for its versions.

  Scenario: Anna uploads a new version of a file and the new version is current
    Given a new person Anna signs up
    And Anna has a file "Notes.txt" with the content "first draft" in her personal drive
    When Anna uploads a new version of "Notes.txt" with the content "second draft"
    Then Anna sees 2 versions of "Notes.txt" with the newest one current
    And Anna sees "Notes.txt" with a size of 12 bytes

  Scenario: Ben sees the versions of a file in the family drive
    Given a new person Anna signs up
    And a new family named "The Smiths" is created by Anna
    And a new person Ben signs up
    And Ben joins the family "The Smiths"
    And Anna has a file "Plan.txt" with the content "first draft" in the family drive of "The Smiths"
    And Anna uploads a new version of "Plan.txt" with the content "second draft"
    When Ben looks at the versions of "Plan.txt" in the family drive of "The Smiths"
    Then Ben sees 2 versions of "Plan.txt" with the newest one current

  Scenario: Anna restores an older version and it becomes the current version
    Given a new person Anna signs up
    And Anna has a file "Notes.txt" with the content "first draft" in her personal drive
    And Anna uploads a new version of "Notes.txt" with the content "second draft"
    When Anna restores version 1 of "Notes.txt"
    Then Anna sees 3 versions of "Notes.txt" with the newest one current
    And Anna sees "Notes.txt" with a size of 11 bytes

  Scenario: Anna deletes an older version and it disappears from the list
    Given a new person Anna signs up
    And Anna has a file "Notes.txt" with the content "first draft" in her personal drive
    And Anna uploads a new version of "Notes.txt" with the content "second draft"
    When Anna deletes version 1 of "Notes.txt"
    Then Anna sees 1 version of "Notes.txt"

  Scenario: Anna cannot delete the current version of a file
    Given a new person Anna signs up
    And Anna has a file "Notes.txt" with the content "first draft" in her personal drive
    And Anna uploads a new version of "Notes.txt" with the content "second draft"
    When Anna deletes the current version of "Notes.txt"
    Then Anna is told the current version of a file cannot be deleted
    And Anna sees 2 versions of "Notes.txt" with the newest one current

  Scenario: A person outside the family gets not found for the versions of a family file
    Given a new person Anna signs up
    And a new family named "The Smiths" is created by Anna
    And Anna has a file "Plan.txt" with the content "first draft" in the family drive of "The Smiths"
    And a new person Carol signs up
    When Carol looks at the versions of "Plan.txt" in the family drive of "The Smiths"
    Then Carol is told the file was not found

  Scenario: Anna cannot upload a new version larger than the allowed size
    Given a new person Anna signs up
    And Anna has a file "Notes.txt" with the content "first draft" in her personal drive
    When Anna uploads a new version of "Notes.txt" that is larger than the upload limit
    Then Anna is told the file is too large
    And Anna sees 1 version of "Notes.txt" with the newest one current

  Scenario: A folder has no versions
    Given a new person Anna signs up
    And Anna has a folder "Photos" in her personal drive
    When Anna looks at the versions of "Photos"
    Then Anna is told a folder has no versions
