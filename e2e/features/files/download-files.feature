# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:files
Feature: Downloading a file and its earlier versions

  A person downloads the bytes of a file they can see, either its current
  version or an earlier one. A download is an attachment unless the person
  asks to show an image or a PDF inline. A person who cannot see a file gets
  "not found" for its content.

  Scenario: Anna downloads a file she uploaded and gets the same content
    Given a new person Anna signs up
    And Anna has a file "Notes.txt" with the content "first draft" in her personal drive
    When Anna downloads the content of "Notes.txt"
    Then Anna gets the content "first draft" as a download of "Notes.txt"

  Scenario: Ben downloads a file from the family drive
    Given a new person Anna signs up
    And a new family named "The Smiths" is created by Anna
    And a new person Ben signs up
    And Ben joins the family "The Smiths"
    And Anna has a file "Plan.txt" with the content "family plan" in the family drive of "The Smiths"
    When Ben downloads the content of "Plan.txt" from the family drive of "The Smiths"
    Then Ben gets the content "family plan" as a download of "Plan.txt"

  Scenario: Carl cannot download a file from a family he is not in
    Given a new person Anna signs up
    And a new family named "The Smiths" is created by Anna
    And Anna has a file "Plan.txt" with the content "family plan" in the family drive of "The Smiths"
    And a new person Carl signs up
    When Carl downloads the content of "Plan.txt" from the family drive of "The Smiths"
    Then Carl sees that the file is not found

  Scenario: Anna downloads an earlier version of a file and gets the earlier content
    Given a new person Anna signs up
    And Anna has a file "Notes.txt" with the content "first draft" in her personal drive
    And Anna uploads a new version of "Notes.txt" with the content "second draft"
    When Anna downloads version 1 of "Notes.txt"
    Then Anna gets the content "first draft" as a download of "Notes.txt"

  Scenario: Anna downloads part of a file with a byte range and gets only those bytes
    Given a new person Anna signs up
    And Anna has a file "Notes.txt" with the content "first draft" in her personal drive
    When Anna downloads bytes 2 to 5 of "Notes.txt"
    Then Anna gets the content "rst " for the range of "Notes.txt"

  Scenario: Anna asks for a byte range past the end of the file and is refused
    Given a new person Anna signs up
    And Anna has a file "Notes.txt" with the content "first draft" in her personal drive
    When Anna downloads bytes 50 to 60 of "Notes.txt"
    Then Anna is told the range cannot be satisfied for "Notes.txt" of 11 bytes

  Scenario: An HTML file is always a download, even when Anna asks to show it inline
    Given a new person Anna signs up
    And Anna has an HTML page "page.html" with the content "<p>hi</p>" in her personal drive
    When Anna asks to show "page.html" inline
    Then Anna gets "page.html" as an attachment with the type application/octet-stream

  Scenario: Anna shows an image inline when she asks for it
    Given a new person Anna signs up
    And Anna has a PNG image "photo.png" in her personal drive
    When Anna asks to show "photo.png" inline
    Then Anna gets "photo.png" to show inline as image/png

  Scenario: A folder cannot be downloaded
    Given a new person Anna signs up
    And Anna has a folder "Photos" in her personal drive
    When Anna downloads the content of "Photos"
    Then Anna is told that a folder has no content to download
