# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@a11y @module:shell @wip
Feature: App shell

  The app frame shows who is signed in and gives access to the places that
  person can use: the family screen, account settings and, for admins, admin
  settings.

  Scenario: Header shows who I am
    Given I am signed in as "Anna Kowalska", a regular member
    Then the header shows my initials
    When I open the user menu
    Then I see my name, my email and the badge "Member"

  Scenario: Admin sees admin settings
    Given I am signed in as the admin
    When I open the user menu
    Then I see "Admin settings"

  Scenario: Regular user does not see admin settings
    Given I am signed in as a regular member
    When I open the user menu
    Then I do not see "Admin settings"

  Scenario: Navigation on a phone
    Given a 390 px wide screen
    Then the bottom navigation shows "Family" and "Settings"

  @wip
  Scenario: Navigation on a desktop
    Given a 1280 px wide screen
    Then the sidebar shows "Family" and "Settings"
    And the sidebar shows my name and the families I belong to
    And the header shows the title of the page I am on

  Scenario: Keyboard use
    When I use only the keyboard
    Then I can reach the navigation and the user menu and close the menu with Escape

  Scenario: Sign out from the menu
    When I choose "Sign out" in the user menu
    Then I am signed out
