# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:identity
Feature: Sign in screen

  A person signs in to their Offgrid server from a clear, friendly screen.
  Wrong details and a closed registration each get a plain explanation.

  @ui
  Scenario: Signing in
    Given I have an account
    When I open the sign in page
    And I enter my email and password and press "Sign in"
    Then I am taken to the home page

  @ui
  Scenario: Wrong password
    Given I have an account
    When I open the sign in page
    And I enter my email and a wrong password and press "Sign in"
    Then I see "Email or password is incorrect" and my email stays filled in

  @ui
  Scenario: Show password
    When I open the sign in page
    And I type a password
    And I press the show password button
    Then my password is shown, and pressing the button again hides it

  @ui
  Scenario: Caps lock
    When I open the sign in page
    And Caps Lock is on while I type my password
    Then I see a caps-lock warning

  @ui
  Scenario: Registration closed
    Given an admin account exists and registration is closed
    When I open the sign in page
    Then I do not see the create account link

  @ui
  Scenario: Remember me
    Given I have an account
    When I open the sign in page
    And I tick "Remember me for 30 days" and sign in with my email and password
    Then I stay signed in after closing the browser

  @ui
  Scenario: Pressing Enter submits
    Given I have an account
    When I open the sign in page
    And I enter my email and password and press Enter
    Then I am taken to the home page

  @ui
  Scenario: Double submission is prevented
    Given I have an account
    When I open the sign in page
    And I enter my email and password and press "Sign in" twice quickly
    Then the sign in request is sent once

  @ui
  Scenario: Server not reachable
    Given the server cannot be reached
    When I open the sign in page
    And I enter my email and password and press "Sign in"
    Then I see that the server cannot be reached and can try again
