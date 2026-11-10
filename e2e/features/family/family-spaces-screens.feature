# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:family @ui
Feature: Create a family space and see the spaces I belong to

  A signed-in person can create another family space from its own screen,
  see every space they belong to with their role, switch the space they act
  in, and leave a space. Creating a space never asks for a plan or payment.

  Scenario: A person creates another family space and sees it in their spaces
    Given I am a user with a family named "The Smiths"
    When I create a family space named "Cabin Circle" from the create family space screen
    Then "Cabin Circle" appears in my family and spaces settings with the role "admin"

  Scenario: Creating a family space does not ask for a plan or payment
    Given I am a user with a family named "The Smiths"
    When I open the create family space screen
    Then I am not asked for a plan or payment

  Scenario: The create family space screen asks for a name
    Given I am a user with a family named "The Smiths"
    When I try to create a family space with an empty name
    Then I see the message "Enter a family name."

  Scenario: A person picks an accent colour and a space purpose on the create screen
    Given I am a user with a family named "The Smiths"
    When I open the create family space screen
    And I choose the "sage" accent colour and the "Getaway" space purpose
    Then the "sage" accent colour and the "Getaway" space purpose are selected

  Scenario: A person sees every space they belong to with their role
    Given I am a user with a family named "The Smiths"
    And another user adds me to a family named "Cabin Circle" as a member
    When I open family and spaces settings
    Then I see "The Smiths" with the role "admin"
    And I see "Cabin Circle" with the role "member"

  Scenario: A person switches the space they act in from settings
    Given I am a user with a family named "The Smiths"
    And another user adds me to a family named "Cabin Circle" as a member
    When I open family and spaces settings
    Then "Cabin Circle" is the family I act in
    When I switch to "The Smiths"
    Then "The Smiths" is the family I act in

  Scenario: A member leaves a space and it disappears from their spaces
    Given I am a user with a family named "The Smiths"
    And another user adds me to a family named "Cabin Circle" as a member
    When I open family and spaces settings
    And I leave "Cabin Circle"
    Then "Cabin Circle" no longer appears in my family and spaces settings

  Scenario: The only admin of a space cannot leave it
    Given I am a user with a family named "The Smiths"
    When I open family and spaces settings
    And I try to leave "The Smiths"
    Then I see the message "You are the only admin of this space. Make another person an admin before you leave."

  Scenario: A family space keeps the accent and purpose chosen when it was created
    Given I am a user with a family named "The Smiths"
    When I create a family space named "Lake House" choosing the "sage" accent colour and the "Getaway" space purpose
    Then "Lake House" is saved with the "sage" accent colour and the "Getaway" space purpose
