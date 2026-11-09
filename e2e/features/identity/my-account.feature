# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:identity
Feature: My account

  A signed-in person can see and manage their own account and security.
  Nobody can read or change another person's account, sessions or codes.

  Scenario: Viewing my profile
    Given Anna is signed in and belongs to two families
    When she opens her profile
    Then she sees her name, email, role and both families

  Scenario: Changing my display name
    Given Anna is signed in
    When she changes her display name to Anna Kowalska
    Then her profile shows Anna Kowalska

  Scenario: Refusing an empty display name
    Given Anna is signed in
    When she changes her display name to an empty name
    Then it is refused with "VALIDATION_FAILED"
    And her display name is unchanged

  Scenario: Changing my password
    Given Anna is signed in on a laptop and a phone
    When Anna changes her password giving the right current password
    Then the new password works for sign-in
    And her other sessions are signed out
    And her current session stays valid

  Scenario: Refusing a new password that breaks the rules
    Given Anna is signed in
    When Anna tries to change her password to one that breaks the password rules
    Then it is refused with "PASSWORD_TOO_SHORT"
    And her password is unchanged

  Scenario: Wrong current password
    Given Anna is signed in
    When Anna tries to change her password with a wrong current password
    Then it is refused with "CURRENT_PASSWORD_INCORRECT"
    And her password is unchanged

  Scenario: Seeing my devices
    Given Anna is signed in on a laptop and a phone
    Then she sees both sessions and the current one is marked

  Scenario: Ending one of my other sessions
    Given Anna is signed in on a laptop and a phone
    When she ends the session on the phone
    Then the phone session no longer works
    And her current session stays valid

  Scenario: Signing out everywhere else
    Given Anna is signed in on a laptop and a phone
    When Anna chooses to sign out of all other sessions
    Then only the current session stays valid

  Scenario: Another person's session cannot be ended
    Given Anna is signed in
    And Ben is signed in on his own laptop
    When Anna tries to end Ben's session
    Then it is refused with "NOT_FOUND"
    And Ben's session still works

  Scenario: New recovery code
    Given Anna is signed in
    When Anna regenerates her recovery code with her password
    Then she sees the new code once
    And the old code no longer works

  Scenario: Regenerating the recovery code needs the password
    Given Anna is signed in
    When Anna tries to regenerate her recovery code with a wrong password
    Then it is refused with "PASSWORD_INCORRECT"
    And her recovery code is unchanged
