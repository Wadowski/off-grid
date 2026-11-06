# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:family
Feature: First family

  A person who has just signed up, or signs in, without a family is guided to
  create one instead of landing on an empty app. People who already belong to
  a family go straight to the home page.

  @ui
  Scenario: New account without a family
    Given I just created my account and have no family
    Then I am asked to create my family

  @ui
  Scenario: Creating the family
    Given I just created my account and have no family
    When I enter the family name "Kowalski" and continue
    Then I land on the home page
    And I am a member of "Kowalski"

  @ui
  Scenario: Existing members skip onboarding
    Given I belong to a family named "Nowak"
    When I sign in
    Then I go straight to the home page

  @ui
  Scenario: Invited people
    Given I just created my account and have no family
    Then I see a note to ask my family organizer for an invitation

  @ui
  Scenario: Reloading
    Given I just created my account and have no family
    And I am on the create-family step
    When I reload the page
    Then I am still on the create-family step

  @ui
  Scenario: Signing out from the create-family step
    Given I just created my account and have no family
    When I sign out from the create-family step
    Then I see the sign in page
