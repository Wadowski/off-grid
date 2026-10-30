# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@infra @wip
Feature: Scenario isolation

  Each scenario creates the data it needs, so scenarios can run in parallel
  without sharing state.

  Scenario: Each scenario gets its own family
    Given a family is created through the API
    And a family is created through the API
    Then the two families have different identifiers
