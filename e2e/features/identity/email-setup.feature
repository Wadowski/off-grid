# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:identity
Feature: Email setup

  The admin connects an outgoing mail account once. Offgrid then uses it to email people.
  Email is optional: the rest of the app works without it.

  Scenario: Choosing a provider fills in its server details
    Given I am the admin
    When I choose Gmail and enter my email and app password
    Then the server details are filled in for me

  @wip
  Scenario: Sending a test email
    Given I am the admin
    And a mail catcher is the mail server
    When I send a test email to myself
    Then the test email arrives in the catcher

  @wip
  Scenario: Wrong app password
    Given I am the admin
    And a mail catcher is the mail server
    When I send a test email with a wrong app password
    Then I see "The email provider did not accept this password"

  Scenario: Secret never shown again
    Given I am the admin
    And email is configured
    When I open the mail settings
    Then the saved password is not shown

  Scenario: Only the admin can change mail settings
    Given I am a regular user
    When I open the mail settings
    Then I am refused

  @wip
  Scenario: Email not configured
    Given no mail is configured
    Then the app reports that email is unavailable
    And no part of the app depends on it

  @wip
  Scenario: Mail server is down
    Given email is configured
    And the provider is unreachable
    When a notification should be emailed
    Then the action that caused it still succeeds
    And delivery is retried later
