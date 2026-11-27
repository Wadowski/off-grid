# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:files @ui
Feature: Files without a drive open explains how to upload

  Anna opens Files from the sidebar without a drive open. Upload and New folder
  stay disabled and a short caption tells her to select a drive first. Nothing
  is sent to the server until a drive is open.

  @screen:files-no-drive
  Scenario: Anna is told to select a drive when she opens Files from the sidebar
    Given I am signed in as "Anna Kowalska", a regular member
    When Anna opens Files from the sidebar without a drive
    Then Anna sees the no-drive caption "Select a drive in the panel to upload files."
    And the Files Upload button is disabled without a drive
    And the Files New folder button is disabled without a drive
    And the Files Upload button explains why it is unavailable

  Scenario: Files without a drive sends no upload request
    Given I am signed in as "Anna Kowalska", a regular member
    When Anna opens Files from the sidebar without a drive
    Then no upload request is made from Files without a drive
