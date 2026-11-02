# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:identity
Feature: Account registration

  Anyone on the local network can create an account. The first account on a
  fresh server becomes the admin, and later accounts are regular users.

  @wip
  Scenario: The first account becomes the admin
    Given a fresh Offgrid server with no accounts
    When someone registers with a valid name, email and password
    Then the account is created with the admin role
    And a recovery code is shown once

  @wip
  Scenario: Later accounts are regular users
    Given an admin account exists and registration is open
    When another person registers
    Then the account is created with the user role

  @wip
  Scenario: Registration is closed
    Given an admin account exists and registration is closed
    When someone tries to register
    Then registration is refused with a "registration closed" message

  Scenario: Weak password
    When someone registers with a password shorter than 12 characters
    Then the account is not created and the reason is explained

  Scenario: Email already used
    Given an account with email "anna@example.com" exists
    When someone registers with "Anna@Example.com"
    Then the account is not created

  Scenario: A new user is signed in right after registering
    Given Offgrid is running
    When someone registers with a valid name, email and password
    Then the new user has an active session

  @wip
  Scenario: The web app can learn whether this is a fresh server
    Given a fresh Offgrid server with no accounts
    When the web app asks for the registration status
    Then it is told that the server is fresh and registration is open
