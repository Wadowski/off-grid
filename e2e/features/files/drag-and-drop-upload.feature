# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:files @ui
Feature: Dropping files onto the Files page to upload them

  Anna drops files from her computer onto the file area of the Files page.
  The files go into the folder she has open, exactly like the Upload button.
  Files above the upload limit are not sent, and a failed upload can be retried
  or dismissed from the upload queue.

  @screen:files-drop-uploaded
  Scenario: Anna drops several files on the Files page and each reaches uploaded
    Given I am signed in as "Anna Kowalska", a regular member
    When Anna opens her personal drive in the browser
    And Anna drops the files "Holiday.txt" and "Receipt.txt" on the Files page
    Then the upload queue shows "Holiday.txt" as uploaded
    And the upload queue shows "Receipt.txt" as uploaded
    And the folder lists the file "Receipt.txt"

  @screen:files-drop-zone-active
  Scenario: The drop zone is shown while files are dragged over the Files page
    Given I am signed in as "Anna Kowalska", a regular member
    When Anna opens her personal drive in the browser
    And Anna drags the files "Holiday.txt" over the Files page
    Then the drop zone is shown on the Files page
    When Anna cancels the drag over the Files page
    Then the drop zone is hidden

  Scenario: A file dropped into an open folder lands in that folder
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive folder "Photos"
    When Anna opens the folder "Photos" in the browser
    And Anna drops the files "Beach.txt" on the Files page
    Then the folder lists the file "Beach.txt"

  @screen:files-drop-too-large
  Scenario: A dropped file above the upload limit is not sent and the other dropped file uploads
    Given I am signed in as "Anna Kowalska", a regular member
    When Anna opens her personal drive in the browser
    And Anna drops an oversized file "Beach.jpg" together with "Notes.txt" on the Files page
    Then the upload queue shows "Beach.jpg" as failed with "This file is too large to upload."
    And the upload queue shows "Notes.txt" as uploaded
    And the oversized file was not sent to the server

  Scenario: Dropped text without files is ignored
    Given I am signed in as "Anna Kowalska", a regular member
    When Anna opens her personal drive in the browser
    And Anna drags plain text over the Files page
    Then the drop zone is hidden

  @screen:files-upload-failed-retry
  Scenario: A failed upload can be retried and then reaches uploaded
    Given I am signed in as "Anna Kowalska", a regular member
    When Anna opens her personal drive in the browser
    And Anna uploads the files "Holiday.txt" with the Upload button and the first upload fails
    Then the upload queue shows "Holiday.txt" as failed with "Something went wrong. Try again."
    When Anna retries the upload of "Holiday.txt"
    Then the upload queue shows "Holiday.txt" as uploaded
    And the folder lists the file "Holiday.txt"

  Scenario: A failed upload can be dismissed and disappears from the queue
    Given I am signed in as "Anna Kowalska", a regular member
    When Anna opens her personal drive in the browser
    And Anna uploads the files "Holiday.txt" with the Upload button and the first upload fails
    And Anna dismisses the upload of "Holiday.txt"
    Then the upload queue no longer shows "Holiday.txt"

  Scenario: A file that is too large offers Dismiss but not Retry
    Given I am signed in as "Anna Kowalska", a regular member
    When Anna opens her personal drive in the browser
    And Anna drops an oversized file "Beach.jpg" together with "Notes.txt" on the Files page
    Then the upload queue offers Dismiss but not Retry for "Beach.jpg"

  Scenario: Anna retries and dismisses a failed upload with the keyboard
    Given I am signed in as "Anna Kowalska", a regular member
    When Anna opens her personal drive in the browser
    And Anna uploads the files "Holiday.txt" with the Upload button and the first upload fails
    And Anna reaches the Retry button of "Holiday.txt" with the keyboard
    Then the Retry button of "Holiday.txt" is focused
    And the Dismiss button of "Holiday.txt" can be reached with the keyboard

  @a11y
  Scenario: The Files page with a failed upload in the queue has no serious accessibility violations
    Given I am signed in as "Anna Kowalska", a regular member
    When Anna opens her personal drive in the browser
    And Anna uploads the files "Holiday.txt" with the Upload button and the first upload fails
    Then the page has no serious accessibility violations
