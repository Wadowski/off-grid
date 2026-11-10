# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:family @ui
Feature: Manage the members of a family from the family manager screen

  A family admin sees everyone in the family, changes roles, removes members
  and invites new people from one screen. A member sees the same list but no
  admin actions. Every control works at phone width and in both themes.

  Scenario: An admin sees each member with their display name and role
    Given I am a user with a family named "The Smiths"
    And another user with the display name "Sam Smith" joins "The Smiths" as a member
    When I open the family manager for "The Smiths"
    Then the member "Sam Smith" has the role "Member"
    And I see my own display name with the role "Admin"

  Scenario: An admin changes a member's role from the screen
    Given I am a user with a family named "The Smiths"
    And another user with the display name "Sam Smith" joins "The Smiths" as a member
    When I open the family manager for "The Smiths"
    And I change the role of "Sam Smith" to "Admin"
    Then the member "Sam Smith" has the role "Admin"

  Scenario: An admin removes a member from the screen
    Given I am a user with a family named "The Smiths"
    And another user with the display name "Sam Smith" joins "The Smiths" as a member
    When I open the family manager for "The Smiths"
    And I remove "Sam Smith" from the family
    Then I do not see "Sam Smith" in the members

  Scenario: The only admin is told they cannot be demoted
    Given I am a user with a family named "The Smiths"
    When I open the family manager for "The Smiths"
    And I change my own role to "Member"
    Then I see the message "A family must keep at least one admin."

  Scenario: An admin creates an invitation and sees its code once
    Given I am a user with a family named "The Smiths"
    When I open the family manager for "The Smiths"
    And I create an invitation
    Then I see an invitation code
    And the invitation code is shown only in the invite dialog

  Scenario: An admin revokes an invitation from the invite dialog
    Given I am a user with a family named "The Smiths"
    When I open the family manager for "The Smiths"
    And I create an invitation
    And I revoke the invitation from the invite dialog
    Then the invitation code no longer works

  Scenario: A member sees the members but no admin actions
    Given I am a user with a family named "The Smiths"
    And another user adds me to a family named "Cabin Circle" as a member
    When I open the family manager for "Cabin Circle"
    Then I see the members of the family
    And I do not see any admin actions

  Scenario: The family manager works on a phone-sized screen
    Given I am a user with a family named "The Smiths"
    When I open the family manager for "The Smiths" on a phone-sized screen
    Then I can change a role, remove a member and create an invitation
