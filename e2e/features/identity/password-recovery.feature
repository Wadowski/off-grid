# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:identity @wip
Feature: Password recovery

  A person who forgot their password can get back in without anyone reading
  their data. Recovery uses the recovery code saved at sign-up or, when the
  owner has set up email, a one-time code sent by email. Every recovery leaves
  the person with a fresh recovery code.

  Scenario: Reset with the recovery code
    Given Anna saved her recovery code at sign-up
    When she resets her password with email, recovery code and a new password
    Then she can sign in with the new password
    And she receives a new recovery code
    And her old recovery code no longer works

  Scenario: Recovery code works once
    Given Anna has already used her recovery code to reset her password
    When someone uses that recovery code again
    Then the reset is refused

  Scenario: Wrong code is limited
    When someone tries wrong recovery codes repeatedly
    Then further attempts are temporarily refused

  Scenario: Emailed code
    Given email is configured
    When Anna asks for a code by email
    Then a code is emailed to her valid for 15 minutes
    And she can reset her password with it once

  Scenario: Email not configured
    Given email is not configured
    Then asking for an emailed code is not offered

  Scenario: Unknown email
    When someone asks for an emailed code for an email without an account
    Then the response looks the same as for an existing account

  Scenario: Sessions end after recovery
    Given Anna is signed in on another device
    When Anna resets her password
    Then the other device is signed out

  Scenario: Security notification after a reset
    When Anna resets her password
    Then she gets a security notification in her inbox
