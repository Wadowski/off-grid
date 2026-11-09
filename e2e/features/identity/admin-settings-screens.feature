# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:identity
Feature: Admin settings screens

  The admin of the server manages who can join, helps people who are locked out
  and connects an outgoing mail account, all from the web app. Everyone else is
  told they have no access.

  @ui
  Scenario: Only admins see Admin settings
    Given I am a regular member signed in to the web app
    Then the user menu has no "Admin settings"
    When I open the admin settings page
    Then the page says "You do not have access"

  @ui
  Scenario: Disabling an account
    Given I am the admin signed in to the web app
    And Tom has an active account
    When I disable Tom's account and confirm
    Then Tom is shown as disabled

  @ui
  Scenario: The last active admin cannot be disabled
    Given I am the admin signed in to the web app
    And I am the only active admin
    Then my own account cannot be disabled and the screen explains why

  @ui
  Scenario: Helping someone reset their password
    Given I am the admin signed in to the web app
    And Tom has an active account
    When I choose "Reset password" for Tom
    Then I see a one-time code and what to tell Tom

  @ui
  Scenario: Closing registration
    Given I am the admin signed in to the web app
    When I turn off "Allow people on this network to create an account"
    Then the sign-in page no longer offers "Create an account"

  @ui
  Scenario: Gmail asks only for an email address and an app password
    Given I am the admin signed in to the web app
    When I open the email setup page
    And I choose Gmail
    Then only the email address and app password are asked

  @ui
  Scenario: Sending a test email through the mail server
    Given I am the admin signed in to the web app
    When I open the email setup page
    And I choose Other and fill in the mail catcher server
    And I press "Send test email"
    Then the page says "Test email sent"
    And the test email arrives in the catcher

  @ui
  Scenario: A test email to a server that does not answer explains why
    Given I am the admin signed in to the web app
    When I open the email setup page
    And I choose Other and enter a server that does not answer
    And I press "Send test email"
    Then the page says "The mail server could not be reached. Check the server address and port."

  @ui
  Scenario: Password never shown
    Given I am the admin signed in to the web app
    And email is connected
    When I open the email setup page
    Then the saved password is not visible anywhere on the page
