# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:identity @a11y
Feature: Accessibility of the authentication screens and the shell

  The screens a person meets while signing in and recovering a password
  have no serious accessibility violations.

  Scenario Outline: The <screen> screen has no serious accessibility violations
    When I open the "<screen>" screen
    Then the page has no serious accessibility violations

    Examples:
      | screen           |
      | sign-in          |
      | create account   |
      | forgot password  |
      | reset password   |

  # The signed-in screens fail the scan on the user menu trigger and on
  # the account settings colour contrast. They stay @wip until the design
  # decides the trigger's accessible name and the settings text colours.
  @wip
  Scenario: The account settings screen has no serious accessibility violations
    When I open the "account settings" screen
    Then the page has no serious accessibility violations

  @wip
  Scenario: The admin settings screen has no serious accessibility violations
    When I open the "admin settings" screen
    Then the page has no serious accessibility violations

  @wip
  Scenario: The app shell has no serious accessibility violations
    When I open the "app shell" screen
    Then the page has no serious accessibility violations
