# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:identity @wip
Feature: Authenticated requests

  Every protected request carries a real, trusted identity and family
  context. A request without a valid session is refused, and a family can
  only be acted in by a current member.

  Scenario: No session
    When a request without a session reaches a protected endpoint
    Then it is refused with "unauthorized"

  Scenario: Public endpoints stay public
    When anyone calls the health endpoint
    Then it responds without a session

  Scenario: Family created by the signed-in user
    Given Anna is signed in
    When she creates the family "Kowalski"
    Then Anna is its first member

  Scenario: Acting in a family you belong to
    Given Anna belongs to "Kowalski" and "Cabin Circle"
    When she opens "Cabin Circle" data while acting in that family
    Then the request succeeds with that family's context

  Scenario: Acting in a family you do not belong to
    When Anna sends a request acting in a family she is not a member of
    Then it is refused with "forbidden"

  Scenario: Removed member loses access immediately
    Given Anna was removed from "Kowalski"
    When she sends a request acting in "Kowalski"
    Then it is refused even though her session is still valid
