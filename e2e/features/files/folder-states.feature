# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:files @ui
Feature: Empty, loading and failed states of a folder

  While the entries of a folder load, the folder shows a loading placeholder.
  A folder with no entries says so and points to the Upload button. When the
  entries or the folder cannot be loaded, the folder says so and offers to try
  again. A folder the person may not see looks the same as a folder that does
  not exist.

  @screen:files-desktop-empty-folder
  Scenario: An empty folder says so and points to the Upload button
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive folder "Empty"
    When Anna opens the folder "Empty" in the browser
    Then the folder shows the empty message

  Scenario: An empty folder in grid view says so too
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive folder "Empty"
    When Anna opens her personal drive in the browser
    And Anna switches the view to grid
    And Anna opens the folder "Empty" from the grid
    Then the folder shows the empty message

  @screen:files-desktop-loading
  Scenario: A slow folder shows a loading placeholder and then its entries
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive folder "Photos"
    And Anna has a personal-drive file "Insurance policy.txt" in the folder "Photos"
    And the folder list of Anna loads slowly
    When Anna opens the folder "Photos" in the browser
    Then a loading placeholder is shown for the folder
    And the folder lists "Insurance policy.txt" once it has loaded

  @screen:files-desktop-error
  Scenario: A folder whose entries fail to load says so and Try again loads them
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive folder "Photos"
    And Anna has a personal-drive file "Insurance policy.txt" in the folder "Photos"
    And the next folder list of Anna fails to load
    When Anna opens the folder "Photos" in the browser
    Then the folder says it could not be loaded and offers to try again
    When Anna chooses Try again
    Then the folder lists "Insurance policy.txt" once it has loaded

  Scenario: A folder whose details fail to load says so and Try again loads it
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive folder "Photos"
    And the next folder details of Anna fail to load
    When Anna opens the folder "Photos" in the browser
    Then the folder says it could not be loaded and offers to try again
    When Anna chooses Try again
    Then the folder path reads "Personal" and "Photos"

  Scenario: A folder of another family looks the same as a folder that does not exist
    Given I am signed in as "Anna Kowalska", a regular member
    And another family named "Garden Club" has a folder "Plans" in its family drive
    When Anna opens a folder link that does not exist in the browser
    Then Anna sees the folder not found view
    When Anna opens the folder "Plans" of "Garden Club" in the browser
    Then Anna sees the folder not found view with the same text as for a folder that does not exist

  @a11y
  Scenario: The empty state of a folder has no serious accessibility violations
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive folder "Empty"
    When Anna opens the folder "Empty" in the browser
    Then the page has no serious accessibility violations

  @a11y
  Scenario: The failed state of a folder has no serious accessibility violations
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive folder "Photos"
    And the next folder list of Anna fails to load
    When Anna opens the folder "Photos" in the browser
    Then the folder says it could not be loaded and offers to try again
    And the page has no serious accessibility violations
