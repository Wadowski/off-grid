# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:identity
Feature: Sign in and sessions

  A registered person signs in with email and password, stays signed in
  safely, and signs out. Repeated wrong attempts are slowed down.

  @wip
  Scenario: Successful sign-in
    Given an account for "anna@example.com"
    When Anna signs in with the right password
    Then she receives a session and can call protected endpoints

  @wip
  Scenario: Wrong password
    Given an account for "anna@example.com"
    When Anna signs in with a wrong password
    Then sign-in fails with a generic "email or password is incorrect" message

  @wip
  Scenario: Unknown email looks the same
    When someone signs in with an email that has no account
    Then the response is the same as for a wrong password

  @wip
  Scenario: Lockout after repeated failures
    Given an account for "anna@example.com"
    When Anna enters a wrong password 5 times in a row
    Then further attempts are refused for a short time
    And after that time she can try again

  @wip
  Scenario: Remember me
    Given an account for "anna@example.com"
    When Anna signs in with "remember me"
    Then her session stays valid for 30 days instead of the default

  @wip
  Scenario: Renewing a session
    Given Anna is signed in
    When the app renews her session
    Then Anna gets new credentials and the old renewal credential no longer works

  @wip
  Scenario: Signing out
    Given Anna is signed in
    When Anna signs out
    Then that session can no longer be used or renewed

  @wip
  Scenario: Disabled account
    Given an admin disabled Anna's account
    When Anna tries to sign in
    Then she is refused
