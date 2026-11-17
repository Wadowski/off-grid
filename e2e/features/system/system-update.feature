# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@wip @module:system
Feature: System update

  The admin keeps the server up to date. The admin can see which version runs
  and which version is available, and can start an update. The update takes a
  backup first and goes back to the previous version if the new one fails.
  Only the admin can check for or start an update.

  Scenario: Admin sees the current and the latest version
    Given I am the admin
    When I open the system update screen
    Then I can see the version that is running
    And I can see the latest version available

  Scenario: Admin starts an update
    Given I am the admin
    And a newer version is available
    When I start the update
    Then I can see the update in progress
    And I can see the new version running

  Scenario: Update does not start when the backup fails
    Given I am the admin
    And a newer version is available
    And the database backup fails
    When I start the update
    Then the update does not start
    And I can see that the backup failed

  Scenario: Update rolls back when the new version fails its health check
    Given I am the admin
    And a newer version is available
    And the new version fails its health check
    When I start the update
    Then the previous version is running again
    And I can see that the update was rolled back

  Scenario: Regular user cannot check for updates
    Given I am a regular user
    When I open the system update screen
    Then I see that only an admin can check for updates

  Scenario: Regular user cannot start an update
    Given I am a regular user
    And a newer version is available
    When I try to start the update
    Then I see that only an admin can start an update
    And the update does not start

  Scenario: Nightly automatic update is off by default
    Given I am the admin
    When I open the system update screen
    Then the nightly automatic update is turned off

  Scenario: Admin turns on the nightly automatic update
    Given I am the admin
    When I turn on the nightly automatic update
    Then the nightly automatic update is turned on
