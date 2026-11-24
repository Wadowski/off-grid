# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:files @ui
Feature: Downloading and previewing a file from its details

  From the details of a file, on a desktop screen or on a phone, a person can
  download the current version of the file under its name. For an image or a
  PDF the person can also preview the file in a dialog without leaving the
  page. A file of any other type offers the download only. The preview closes
  with its Close control or with Escape and leaves the details open.

  @wip @screen:files-desktop-file-actions
  Scenario: Anna downloads a file from the details panel
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Notes.txt" with the content "Remember the milk"
    When Anna opens the files page on a desktop screen
    And Anna selects the table row "Notes.txt"
    And Anna downloads the file from its details
    Then the browser saves the file "Notes.txt" with the content "Remember the milk"

  @wip @screen:files-desktop-file-preview-image
  Scenario: Anna previews an image from the details panel
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive image "Beach.png"
    When Anna opens the files page on a desktop screen
    And Anna selects the table row "Beach.png"
    And Anna previews the file from its details
    Then the preview dialog is titled "Beach.png"
    And the preview dialog shows the image "Beach.png"

  @wip @screen:files-desktop-file-preview-pdf
  Scenario: Anna previews a PDF from the details panel
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive PDF "Plan.pdf"
    When Anna opens the files page on a desktop screen
    And Anna selects the table row "Plan.pdf"
    And Anna previews the file from its details
    Then the preview dialog is titled "Plan.pdf"
    And the preview dialog shows the PDF "Plan.pdf"

  @wip
  Scenario: A web page can be downloaded but not previewed
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive web page "Page.html" with the content "<h1>Hello</h1>"
    When Anna opens the files page on a desktop screen
    And Anna selects the table row "Page.html"
    Then the file details offer Download and no Preview
    When Anna downloads the file from its details
    Then the browser saves the file "Page.html" with the content "<h1>Hello</h1>"

  @wip
  Scenario: Anna downloads a file from inside its preview
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive image "Beach.png"
    When Anna opens the files page on a desktop screen
    And Anna selects the table row "Beach.png"
    And Anna previews the file from its details
    And Anna downloads the file from the preview dialog
    Then the browser saves the file "Beach.png"

  @wip
  Scenario: Closing the preview with its Close control leaves the details open
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive image "Beach.png"
    When Anna opens the files page on a desktop screen
    And Anna selects the table row "Beach.png"
    And Anna previews the file from its details
    And Anna closes the preview with its Close control
    Then the preview dialog is not shown
    And the file details panel shows the name "Beach.png"
    And the Preview control in the file details has the keyboard focus

  @wip @a11y
  Scenario: The preview has no serious accessibility violations and Escape closes only the preview
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive image "Beach.png"
    When Anna opens the files page on a desktop screen
    And Anna selects the table row "Beach.png"
    And Anna previews the file from its details
    Then the page has no serious accessibility violations
    When Anna presses Escape in the preview dialog
    Then the preview dialog is not shown
    And the file details panel shows the name "Beach.png"
    And the Preview control in the file details has the keyboard focus

  @wip @screen:files-desktop-file-preview-error
  Scenario: A preview that cannot be loaded offers Try again
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive image "Beach.png"
    When Anna opens the files page on a desktop screen
    And Anna selects the table row "Beach.png"
    And the image "Beach.png" is moved to the trash
    And Anna previews the file from its details
    Then the preview dialog tells that the file could not be shown
    And the preview dialog offers Try again

  @wip @screen:files-mobile-file-preview-image
  Scenario: Anna previews an image on a phone
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive image "Beach.png"
    When Anna opens the details of "Beach.png" on a phone
    Then the file details offer Download and Preview
    When Anna previews the file from its details
    Then the preview dialog shows the image "Beach.png"
    When Anna closes the preview with its Close control
    Then the preview dialog is not shown
    And the Preview control in the file details has the keyboard focus

  @wip @screen:files-mobile-file-actions
  Scenario: Anna downloads a file on a phone
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Notes.txt" with the content "Remember the milk"
    When Anna opens the details of "Notes.txt" on a phone
    Then the file details offer Download and no Preview
    When Anna downloads the file from its details
    Then the browser saves the file "Notes.txt" with the content "Remember the milk"
