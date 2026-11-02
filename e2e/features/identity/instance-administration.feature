# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:identity
Feature: Instance administration

  The first person to register is the instance admin, the owner of the server.
  The admin decides who has an account, can help someone who is locked out and
  can close registration. The server owner can recover the admin from the host.

  @wip
  Scenario: Admin lists accounts
    Given I am the admin
    Then I can see every account with its role and status

  @wip
  Scenario: Regular user cannot administer
    Given I am a regular user
    When I open the admin user list
    Then I am refused

  @wip
  Scenario: Disabling an account
    When the admin disables Tom's account
    Then Tom's sessions end and he cannot sign in

  @wip
  Scenario: The last admin cannot be disabled
    Given only one active admin exists
    When that admin tries to disable their own account
    Then it is refused

  @wip
  Scenario: Helping someone who forgot their password
    When the admin starts a password reset for Tom
    Then a one-time code is shown to the admin
    And Tom can set a new password with it, once

  @wip
  Scenario: Closing registration
    When the admin closes registration
    Then new sign-ups are refused

  @wip
  Scenario: Locked-out admin
    Given no admin can sign in
    When the server owner runs the recovery command on the server
    Then the admin password is reset
