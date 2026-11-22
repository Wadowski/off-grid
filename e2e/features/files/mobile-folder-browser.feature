# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:files @ui
Feature: Browsing folders on a phone

  On a phone a person sees the entries of a folder as one list, with the path
  to the folder above it. Folders open by tapping them, and Back goes up one
  level.

  @wip @screen:files-mobile-browser
  Scenario: The phone list shows the entries of a folder, folders first
    Given a new person Anna signs up
    And Anna has a personal-drive folder "Photos"
    And Anna has a personal-drive file "Insurance policy.txt"
    When Anna opens her personal drive on a phone
    Then the phone list reads "Photos" then "Insurance policy.txt"

  @wip
  Scenario: A folder row shows how many items it holds
    Given a new person Anna signs up
    And Anna has a personal-drive folder "Photos"
    And Anna has a personal-drive file "Summer.jpg" in the folder "Photos"
    And Anna has a personal-drive file "Winter.jpg" in the folder "Photos"
    And Anna has a personal-drive folder "Empty"
    When Anna opens her personal drive on a phone
    Then the folder row "Photos" shows "2 items"
    And the folder row "Empty" shows "0 items"

  @wip
  Scenario: Tapping a folder opens it
    Given a new person Anna signs up
    And Anna has a personal-drive folder "Photos"
    And Anna has a personal-drive file "Summer.jpg" in the folder "Photos"
    And Anna opens her personal drive on a phone
    When Anna taps the folder row "Photos"
    Then the folder path reads "Personal" and "Photos"
    And the phone list reads "Summer.jpg"

  @wip
  Scenario: Back goes up one level, and there is no Back control at the drive root
    Given a new person Anna signs up
    And Anna has the nested folders "Photos" and "Summer" in her personal drive
    And Anna opens the folder "Summer" in the browser on a phone
    When Anna taps the Back control
    Then "Photos" is the current folder in the folder path
    When Anna taps the Back control
    Then the Back control is not shown

  @wip
  Scenario: The folder path shows the way down and a step can be tapped
    Given a new person Anna signs up
    And Anna has the nested folders "Holiday" and "Beach" in her personal drive
    And Anna opens the folder "Beach" in the browser on a phone
    Then the folder path reads "Personal", "Holiday" and "Beach"
    When Anna uses the folder path item "Holiday"
    Then "Holiday" is the current folder in the folder path

  @wip
  Scenario: A long file name does not make the phone page scroll sideways
    Given a new person Anna signs up
    And Anna has a personal-drive file with a very long name
    When Anna opens her personal drive on a phone
    Then the phone page does not scroll sideways

  @wip @a11y
  Scenario: The phone file browser has no serious accessibility violations
    Given a new person Anna signs up
    And Anna has a personal-drive folder "Photos"
    And Anna has a personal-drive file "Insurance policy.txt"
    When Anna opens her personal drive on a phone
    Then the page has no serious accessibility violations
