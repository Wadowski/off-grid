# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@a11y @module:family @wip
Feature: Families screen accessibility

  The Families screen can be used by everyone, including people who rely on
  assistive technology.

  Scenario: The Families screen has no serious accessibility violations
    Given I am a user without any family
    When I open the Families screen
    Then the Families screen has no serious accessibility violations
