# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:files @ui
Feature: Files without a drive open explains how to upload

  Anna opens Files from the sidebar without a drive open. Upload and New folder
  stay disabled, a short caption tells her to choose a drive first, and nothing
  is sent to the server until a drive is open.

  @screen:files-no-drive
  Scenario: Anna is told to choose a drive when she opens Files from the sidebar
    Given I am signed in as "Anna Kowalska", a regular member
    When Anna opens Files from the sidebar without a drive
    Then Anna sees the no-drive caption "Select a drive in the panel to upload files."
    And the Files Upload button is disabled without a drive
    And the caption describes the Upload button
    And no upload request is made
