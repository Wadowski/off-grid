# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:identity
Feature: Create account screen

  Anyone on the local network can create an account in the web app. The first
  person on a fresh server sets it up as admin, and every new person is guided
  to save a recovery code before they continue.

  @wip
  Scenario: First person sets up the server
    Given a fresh Offgrid server with no accounts
    When I open the create account page
    Then I see "Set up your Offgrid"
    And after creating my account I am the admin

  @wip
  Scenario: Creating a regular account
    Given an admin account exists and registration is open
    When I fill in my name, email, password and confirmation and press "Create account"
    Then I see my recovery code

  @wip
  Scenario: Password strength
    Given I am on the create account page
    When I type a short password
    Then the strength meter shows that it is too weak and says why

  @wip
  Scenario: Passwords differ
    Given I am on the create account page
    When the confirmation does not match the password
    Then I see "Passwords do not match" and no account is created

  @wip
  Scenario: Email already used
    Given an account for "anna@example.com"
    When I create an account with "anna@example.com"
    Then I am told the email is already in use

  @wip
  Scenario: Saving the recovery code
    Given I see my recovery code
    Then "Continue" is disabled until I tick "I saved my recovery code"
    And I can copy the code or download it as a text file

  @wip
  Scenario: Registration closed
    Given an admin account exists and registration is closed
    When I open the create account page
    Then I see that new accounts are not accepted and a link to sign in
