# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:files
Feature: Drives are created automatically for a person and a family

  Every person gets one personal drive and every family gets one family
  drive as soon as they exist. Only the owner sees a personal drive, and
  only the members of a family see its family drive.

  Scenario: A new person gets a personal drive named "Personal"
    Given a new person Anna signs up
    When her personal drive is created
    Then Anna has exactly one personal drive named "Personal"

  Scenario: A new family gets a family drive named after the family
    Given a new family named "The Smiths" is created by Anna
    When the family drive is created
    Then "The Smiths" has exactly one family drive named "The Smiths"

  Scenario: Only the owner sees a personal drive
    Given Anna has a personal drive
    And Ben is another person
    When Ben lists the drives he can see
    Then Ben sees no personal drive of Anna

  Scenario: Only the members of a family see its family drive
    Given "The Smiths" has a family drive
    And Anna is a member of "The Smiths"
    And Ben is not a member of "The Smiths"
    When Anna and Ben list the drives they can see
    Then Anna sees the family drive of "The Smiths"
    And Ben sees no family drive of "The Smiths"

  Scenario: The same creation event delivered twice still gives one drive
    Given a new person Anna signs up
    When her personal drive is created twice
    Then Anna has exactly one personal drive named "Personal"
