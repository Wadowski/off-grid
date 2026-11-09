# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:identity
Feature: Password recovery

  A person who forgot their password can get back in without anyone reading
  their data. Recovery uses the recovery code saved at sign-up or, when the
  owner has set up email, a one-time code sent by email. Every recovery leaves
  the person with a fresh recovery code.

  @smoke
  Scenario: Reset with the recovery code
    Given Anna has an account
    When she resets her password with email, recovery code and a new password
    Then she can sign in with the new password
    And she receives a new recovery code

 
  Scenario: Recovery code works once
    Given Anna has already reset her password with her recovery code
    When someone uses that recovery code again
    Then the reset is refused and the password does not change

 
  Scenario: Wrong code is limited
    Given Anna has an account
    When someone tries five wrong recovery codes for her email
    Then further attempts are temporarily refused

 
  Scenario: Emailed code is sent
    Given email is configured on the server
    And Anna has an account
    When Anna asks for an emailed code
    Then a code is emailed to her valid for 10 minutes

 
  Scenario: Emailed code resets the password once
    Given email is configured on the server
    And Anna has an account
    And Anna has asked for an emailed code
    When she resets her password with that emailed code and a new password
    Then she can sign in with the new password

 
  Scenario: Email not configured
    Given email is not configured
    Then the "Email me a code" option is not offered

 
  Scenario: Unknown email
    Given Anna has an account
    When someone asks for an emailed code for an email without an account
    Then the response looks the same as for an existing account

 
  Scenario: Sessions end after recovery
    Given Anna has an account
    And Anna is signed in on another device
    When she resets her password with email, recovery code and a new password
    Then the other device is signed out

 
  Scenario: Security notification after a reset
    Given Anna has an account
    When she resets her password with email, recovery code and a new password
    Then she gets a security notification in her inbox
