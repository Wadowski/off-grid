# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:identity
Feature: Account and security screens

  A signed-in person looks after their own account from Settings: name,
  password, devices and recovery code. Destructive actions ask first.

  @ui
  Scenario: Opening settings
    Given I am signed in
    When I open Settings
    Then I see my name, email and role

  @ui
  Scenario: Renaming myself
    Given I am signed in
    When I change my display name and save
    Then the header and menu show the new name

  @ui
  Scenario: Changing my password
    Given I am signed in on a laptop and a phone
    When I give my current password and a valid new one
    Then the page says "Password changed"
    And my other devices are signed out

  @ui
  Scenario: Wrong current password
    Given I am signed in
    When I give a wrong current password
    Then I see an error and nothing changes

  @ui
  Scenario: Devices
    Given I am signed in on a laptop and a phone
    Then I see both and "This device" is marked
    When I choose "Sign out of all other devices" and confirm
    Then only this device stays signed in

  @ui
  Scenario: New recovery code
    Given I am signed in
    When I confirm my password and generate a new recovery code
    Then I see the code once and can copy or download it

  @ui
  Scenario: Signing out from settings
    Given I am signed in
    When I choose "Sign out" in Settings
    Then I am taken to the sign-in page
