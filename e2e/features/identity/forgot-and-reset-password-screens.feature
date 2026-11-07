# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:identity @wip
Feature: Forgot and reset password screens

  Someone who forgot their password can get back in using their recovery code,
  or an emailed code when the owner has set up email. Messages never reveal
  whether an email has an account.

  @ui
  Scenario: Reset with recovery code
    Given I have my recovery code
    When I open "Forgot password?", choose "Use my recovery code" and set a new password
    Then I see a new recovery code
    And I can sign in with the new password

  @ui
  Scenario: Emailed code
    Given email is configured on the server
    When I choose "Email me a code" and enter the code I received
    Then I can set a new password

  @ui
  Scenario: Email option hidden
    Given email is not configured
    Then I do not see "Email me a code"

  @ui
  Scenario: Same message for every email
    When I ask for an emailed code for any email address
    Then I see "If this email has an account, we sent a code"

  @ui
  Scenario: Wrong or expired code
    When I enter a wrong or expired code
    Then I see a clear message and can try again or go back

  @ui
  Scenario: New password rules
    When my new password is too weak or the confirmation differs
    Then I see what to fix and nothing is sent

  @ui
  Scenario: Cancel
    When I press "Cancel and return to sign in"
    Then I am on the sign-in page
