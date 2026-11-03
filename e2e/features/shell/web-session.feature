# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@a11y @module:shell @wip
Feature: Web session handling

  The web app knows who is signed in, keeps them signed in and sends people
  who are not signed in to the right place.

  Scenario: Protected page while signed out
    Given I am not signed in
    When I open "/"
    Then I am taken to the sign-in page
    And after signing in I land on "/"

  Scenario: Signed-in person on the sign-in page
    Given I am signed in
    When I open the sign-in page
    Then I am taken to the home page

  Scenario: Session renews silently
    Given my access has expired but my session is valid
    When I use the app
    Then I stay signed in without being asked for my password

  Scenario: Session can no longer be renewed
    Given my session was ended elsewhere
    When I use the app
    Then I am taken to sign-in with the message "You were signed out"

  Scenario: Fresh server
    Given the server has no accounts yet
    When I open the app
    Then I am taken to the set-up page that creates the first admin account

  Scenario: Sign out
    Given I am signed in
    When I choose "Sign out"
    Then I am taken to sign-in and protected pages are closed to me
