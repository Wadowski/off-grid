# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:family
Feature: Manage family members

  Every member of a family can see who is in it. A family always keeps at
  least one admin, so the only admin cannot demote or remove themselves.

  Scenario: The creator of a family sees themselves as its only admin
    Given I am a user without any family
    And I create a family named "The Smiths"
    When I ask for the members of "The Smiths"
    Then I see 1 member, who is an admin

  Scenario: A user who is not in a family cannot see its members
    Given another user has a family named "The Millers"
    And I am a user without any family
    When I ask for the members of "The Millers"
    Then I am told that the family was not found

  Scenario: The only admin cannot demote themselves
    Given I am a user without any family
    And I create a family named "The Smiths"
    When I try to change my own role to "member" in "The Smiths"
    Then I am told that a family must keep at least one admin

  Scenario: The only admin cannot remove themselves
    Given I am a user without any family
    And I create a family named "The Smiths"
    When I try to remove myself from "The Smiths"
    Then I am told that a family must keep at least one admin
