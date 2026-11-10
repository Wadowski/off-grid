# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:family
Feature: See the names of the people in my family

  A member of a family sees the display name of every other member of that
  family. A name is shared only with people who share a family with its
  owner, and it follows the owner when they change it.

  Scenario: A member sees the names of everyone in their family
    Given I am a user with a family named "The Smiths"
    And another user with the display name "Sam Smith" joins "The Smiths" as a member
    When I ask for the members of "The Smiths"
    Then I see the display names "Sam Smith" and my own display name in "The Smiths"

  Scenario: A changed display name shows its new value in the family
    Given I am a user with a family named "The Smiths"
    And another user with the display name "Sam Smith" joins "The Smiths" as a member
    When that user changes their display name to "Sam Jones"
    And I ask for the members of "The Smiths"
    Then I see the display name "Sam Jones" and not "Sam Smith" in "The Smiths"

  Scenario: A person who shares no family with me does not see my name
    Given I am a user with a family named "The Smiths"
    And another user with the display name "Ada Miller" has a family named "The Millers"
    When I ask for the members of "The Millers"
    Then I am told that the family was not found
    And I cannot see the display name "Ada Miller" anywhere in my families

  Scenario: A name stays hidden after the person leaves every shared family
    Given I am a user with a family named "The Smiths"
    And another user with the display name "Sam Smith" joins "The Smiths" as a member
    When that user leaves "The Smiths"
    And I ask for the members of "The Smiths"
    Then I do not see the display name "Sam Smith" in "The Smiths"
