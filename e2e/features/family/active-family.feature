# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:family
Feature: Choose the family you act in

  Someone who belongs to several families chooses which one they are acting
  in. The choice can only be a family they belong to.

  Scenario: Choosing a family you belong to
    Given Anna is signed in
    And Anna belongs to "Kowalski" and "Cabin Circle"
    When Anna chooses "Cabin Circle" as the family she is acting in
    Then the choice is confirmed for "Cabin Circle"

  Scenario: Choosing a family you do not belong to
    Given Anna is signed in
    And another person already has a family named "Cabin Circle"
    When Anna chooses "Cabin Circle" as the family she is acting in
    Then I am told that the family was not found
