# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@wip @module:family
Feature: Family invitations

  An admin invites a person to a family with a code. The code works once, can
  be revoked, and stops working after seven days. A wrong or spent code gets
  the same answer, so codes cannot be probed.

  Scenario: An admin invites someone who joins the family as a member
    Given I am a user without any family
    And I create a family named "The Smiths"
    When I create an invitation to "The Smiths"
    And a new user redeems the invitation code
    Then the new user is a member of "The Smiths"
    And the new user is listed as a member, not an admin

  Scenario: An invitation code can be used only once
    Given I am a user without any family
    And I create a family named "The Smiths"
    And I create an invitation to "The Smiths"
    And a new user redeems the invitation code
    When another new user tries to redeem the same invitation code
    Then I am told that the invitation code is not valid

  Scenario: A revoked invitation code is rejected
    Given I am a user without any family
    And I create a family named "The Smiths"
    And I create an invitation to "The Smiths"
    When I revoke the invitation
    And a new user tries to redeem the invitation code
    Then I am told that the invitation code is not valid

  Scenario: A code that was never issued is rejected with the same answer
    When a new user tries to redeem the code "not-a-real-code"
    Then I am told that the invitation code is not valid

  Scenario: Too many wrong codes block further attempts for a while
    When a new user tries to redeem a wrong invitation code 5 times
    Then the next redemption attempt is refused because of too many attempts

  Scenario: A member cannot create an invitation
    Given I am a user without any family
    And I create a family named "The Smiths"
    And a new user has joined "The Smiths" with an invitation
    When the new user tries to create an invitation to "The Smiths"
    Then I am told that I am not allowed to do that
