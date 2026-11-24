# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:files @ui
Feature: Uploading files from the Files page with a visible queue

  Anna picks files with the Upload button. Each file is sent on its own, one
  after another, and the upload queue shows the progress and the result of
  every file. The queue stays available while Anna uses other pages, and a
  file that cannot be uploaded shows why without stopping the other files.

  @screen:files-upload-done
  Scenario: Anna uploads a file with the Upload button and sees it in the folder
    Given I am signed in as "Anna Kowalska", a regular member
    When Anna opens her personal drive in the browser
    And Anna uploads the files "Holiday.txt" with the Upload button
    Then the upload queue shows "Holiday.txt" as uploaded
    And the folder lists the file "Holiday.txt"

  Scenario: Anna uploads several files and each one reaches uploaded
    Given I am signed in as "Anna Kowalska", a regular member
    When Anna opens her personal drive in the browser
    And Anna uploads the files "Holiday.txt" and "Receipt.txt" with the Upload button
    Then the upload queue shows "Holiday.txt" as uploaded
    And the upload queue shows "Receipt.txt" as uploaded
    And the folder lists the file "Receipt.txt"

  Scenario: Anna uploads a file into the folder she has open
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive folder "Photos"
    When Anna opens the folder "Photos" in the browser
    And Anna uploads the files "Beach.txt" with the Upload button
    Then the folder lists the file "Beach.txt"

  @screen:files-upload-too-large
  Scenario: A file above the upload limit shows a clear message and the other files still upload
    Given I am signed in as "Anna Kowalska", a regular member
    When Anna opens her personal drive in the browser
    And Anna uploads an oversized file "Beach.jpg" together with "Notes.txt" with the Upload button
    Then the upload queue shows "Beach.jpg" as failed with "This file is too large to upload."
    And the upload queue shows "Notes.txt" as uploaded
    And the folder does not list the file "Beach.jpg"

  Scenario: A file with a name that is already taken shows the name-taken message
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Holiday.txt"
    When Anna opens her personal drive in the browser
    And Anna uploads the files "Holiday.txt" and "Receipt.txt" with the Upload button
    Then the upload queue shows "Holiday.txt" as failed with "A file or folder with this name already exists here."
    And the upload queue shows "Receipt.txt" as uploaded

  @screen:files-upload-mobile
  Scenario: Anna uploads from the phone top row
    Given I am signed in as "Anna Kowalska", a regular member
    When Anna opens her personal drive on a phone
    And Anna uploads the files "Holiday.txt" from the phone top row
    Then the upload queue shows "Holiday.txt" as uploaded

  Scenario: The upload keeps going after Anna leaves the Files page
    Given I am signed in as "Anna Kowalska", a regular member
    When Anna opens her personal drive in the browser
    And Anna uploads the files "Holiday.txt" with the Upload button
    And Anna opens the Calendar page
    Then the floating upload panel shows "Holiday.txt" as uploaded
    When Anna opens her personal drive in the browser
    Then the folder lists the file "Holiday.txt"

  @screen:files-upload-panel-desktop
  Scenario: The floating upload panel stays visible on another page on the desktop
    Given I am signed in as "Anna Kowalska", a regular member
    When Anna opens her personal drive in the browser
    And Anna uploads the files "Holiday.txt" with the Upload button
    And Anna opens the Calendar page
    Then the floating upload panel is shown

  @screen:files-upload-sheet-mobile
  Scenario: On the phone the upload sheet can be minimized with the Escape key
    Given I am signed in as "Anna Kowalska", a regular member
    When Anna opens her personal drive on a phone
    And Anna uploads the files "Holiday.txt" from the phone top row
    And Anna expands the upload sheet
    And Anna presses Escape in the upload sheet
    Then the upload sheet is minimized
    And focus returns to the upload sheet toggle

  Scenario: Clear finished removes finished uploads and is not offered while an upload runs
    Given I am signed in as "Anna Kowalska", a regular member
    When Anna opens her personal drive in the browser
    And Anna uploads the files "Holiday.txt" with the Upload button while the upload is slow
    Then the clear finished action is not offered
    When the upload finishes
    And Anna clears the finished uploads
    Then the upload queue is not shown
    And the floating upload panel is not shown

  @a11y
  Scenario: The Files page with finished and failed uploads has no serious accessibility violations
    Given I am signed in as "Anna Kowalska", a regular member
    When Anna opens her personal drive in the browser
    And Anna uploads the files "Holiday.txt" and "Receipt.txt" with the Upload button
    Then the page has no serious accessibility violations

  Scenario: Anna opens the file chooser with the keyboard
    Given I am signed in as "Anna Kowalska", a regular member
    When Anna opens her personal drive in the browser
    And Anna reaches the Upload button with the keyboard and presses Enter
    Then the file chooser is opened
