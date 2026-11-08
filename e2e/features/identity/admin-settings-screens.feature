# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:identity
Feature: Admin settings screens

  The admin of the server manages who can join, helps people who are locked
  out and connects an outgoing mail account, all from the web app. Everyone
  else is told they have no access.

  @ui @wip
  Scenario: Only admins see Admin settings
    Given I am a regular member
    Then the user menu has no "Admin settings"
    And opening the admin settings address shows "You do not have access"

  @ui @wip
  Scenario: Disabling an account
    Given I am the admin
    When I disable Tom's account and confirm
    Then Tom is shown as disabled

  @ui @wip
  Scenario: The last active admin cannot be disabled
    Given I am the only active admin
    When I try to disable my own account
    Then the screen explains that the last admin cannot be disabled

  @ui @wip
  Scenario: Helping someone reset their password
    Given I am the admin
    When I choose "Reset password" for Tom
    Then I see a one-time code and what to tell Tom

  @ui @wip
  Scenario: Closing registration
    Given I am the admin
    When I turn off "Allow people on this network to create an account"
    Then the sign-in page no longer offers "Create an account"

  @ui @wip
  Scenario: Connecting Gmail
    Given I am the admin
    When I choose Gmail and enter my email and app password
    And I press "Send test email"
    Then I see "Test email sent"

  @ui @wip
  Scenario: Wrong app password
    Given I am the admin
    When the email provider rejects the password
    Then I see a plain explanation and a link to the help for creating an app password

  @ui @wip
  Scenario: Password never shown
    Given I am the admin
    And email is connected
    Then the saved password is not visible anywhere on the page
