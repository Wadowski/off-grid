# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:calendar
Feature: Calendar data stays with its owner

  Calendars, events and locations belong either to one person or to one
  family. Nobody outside that owner can see them.

  @wip
  Scenario: A calendar of one family is hidden from another family
    Given Anna and Ben each belong to their own family
    And Anna's family has a calendar named "Kitchen"
    When Ben looks at the calendars
    Then Ben sees no calendars

  @wip
  Scenario: A personal calendar is hidden from other people
    Given Anna has a personal calendar named "Work"
    And Ben belongs to a family of his own
    When Ben looks at the calendars
    Then Ben sees no calendars
