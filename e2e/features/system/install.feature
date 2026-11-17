# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@wip @infra @module:system
Feature: Installation

  The owner installs Offgrid on a Linux host with one script. The script
  prepares the host and starts the app. Running the script again must not
  lose the owner's data or secrets.

  Scenario: Fresh Linux host with Docker runs the app
    Given a fresh Linux host with Docker installed
    When the owner runs the install script
    Then the app answers on its port

  Scenario: Missing Docker is installed on Linux
    Given a fresh Linux host without Docker
    When the owner runs the install script
    Then Docker is installed
    And the app answers on its port

  Scenario: Install script stops on a system it does not support
    Given a host that is not Linux
    When the owner runs the install script
    Then the install script stops
    And the owner sees a message that this system is not supported

  Scenario: Running the install script again keeps data and secrets
    Given Offgrid is installed on a host with some family data
    When the owner runs the install script again
    Then the app answers on its port
    And the family data is still there
    And the secrets are unchanged
