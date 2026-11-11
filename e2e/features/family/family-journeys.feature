# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:family
Feature: Family management journeys

  The main family journeys run from start to finish: an admin invites someone,
  that person joins with the code, and the admin changes roles or removes them.
  Each journey is checked from the point of view of the person it affects.

  @ui
  Scenario: An admin invites a member who joins with the code and appears in the member list
    Given I am a user with a family named "The Smiths"
    When I open the family manager for "The Smiths"
    And I create an invitation
    And a new member named "Jo Joiner" joins with the invitation code from the invite dialog
    And I open the family manager for "The Smiths"
    Then the member "Jo Joiner" has the role "Member"

  @ui
  Scenario: An admin changes a member's role and the member sees the new role
    Given I am a user with a family named "The Smiths"
    And another user with the display name "Sam Smith" joins "The Smiths" as a member
    When I open the family manager for "The Smiths"
    And I start managing the members
    And I change the role of "Sam Smith" to "Admin"
    Then the member "Sam Smith" has the role "Admin"
    And "Sam Smith" sees their own role in "The Smiths" as "Admin"

  Scenario: An admin removes a member and the member loses access to the family
    Given I am a user with a family named "The Smiths"
    And another user with the display name "Sam Smith" joins "The Smiths" as a member
    When I open the family manager for "The Smiths"
    And I start managing the members
    And I remove "Sam Smith" from the family
    And "Sam Smith" asks for the members of "The Smiths"
    Then I am told that the family was not found

  @a11y @ui
  Scenario: The family manager has no serious accessibility violations
    Given I am a user with a family named "The Smiths"
    When I open the family manager for "The Smiths"
    Then the page has no serious accessibility violations

  @a11y @ui
  Scenario: The join family space screen has no serious accessibility violations
    Given I am a user without any family
    When I open the join family space screen
    Then the page has no serious accessibility violations
