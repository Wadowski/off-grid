# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@smoke @module:family
Feature: Create a family

  A family groups the people who share a household. A user who creates a
  family sees it in their own list, and nobody else can see it.

 
  Scenario: A user creates a family and sees it in their list
    Given I am a user without any family
    When I create a family named "The Smiths"
    Then "The Smiths" appears in my list of families

 
  Scenario: A family name that is empty is rejected with a clear message
    Given I am a user without any family
    When I try to create a family with an empty name
    Then I am told that the family name is required

 
  Scenario: A family name longer than 100 characters is rejected
    Given I am a user without any family
    When I try to create a family with a name that is 101 characters long
    Then I am told that the family name is too long

 
  Scenario: A newly created family appears in the list once the system has processed it
    Given I am a user without any family
    When I create a family named "The Joneses"
    Then "The Joneses" eventually appears in my list of families

 
  Scenario: A user cannot see a family they do not belong to
    Given another user has a family named "The Millers"
    And I am a user without any family
    When I ask for the family "The Millers" by its identifier
    Then I am told that the family was not found
