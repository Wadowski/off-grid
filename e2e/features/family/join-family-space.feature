# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:family @ui
Feature: Join a family space with an invitation code

  A signed-in person enters an invitation code and sees the family it is for
  before deciding. Looking at the family does not join it, and accepting makes
  it the space they act in. A wrong, spent or expired code gets one generic
  answer, so codes cannot be probed.

  Scenario: A person sees the family and who invited them before joining
    Given I am a user without any family
    And another user has a family named "The Smiths"
    And that user has invited me with a code to "The Smiths"
    When I enter the invitation code on the join family space screen
    Then I see the family name "The Smiths"
    And I see that the invitation came from that user
    And I am not a member of "The Smiths" yet

  Scenario: Accepting the invitation joins the family and shows it in my spaces
    Given I am a user without any family
    And another user has a family named "The Smiths"
    And that user has invited me with a code to "The Smiths"
    When I enter the invitation code on the join family space screen
    And I accept the invitation
    Then "The Smiths" appears in my family and spaces settings with the role "member"
    And "The Smiths" is my active family

  Scenario: Declining returns to the code step without joining
    Given I am a user without any family
    And another user has a family named "The Smiths"
    And that user has invited me with a code to "The Smiths"
    When I enter the invitation code on the join family space screen
    And I decline the invitation
    Then I am back at the code step
    And I am not a member of "The Smiths" yet

  Scenario: The code step asks for a code before continuing
    Given I am a user without any family
    When I continue on the join family space screen without a code
    Then I see the message "Enter an invitation code."

  Scenario: A code that was never issued gets the generic message
    Given I am a user without any family
    When I enter the invitation code "not-a-real-code" on the join family space screen
    Then I see the message "That code isn't valid. Check it and try again."

  Scenario: Too many wrong codes ask the person to wait
    Given I am a user without any family
    When I enter a wrong invitation code 5 times on the join family space screen
    And I try one more code on the join family space screen
    Then I see the message "Too many attempts. Wait a few minutes and try again."
