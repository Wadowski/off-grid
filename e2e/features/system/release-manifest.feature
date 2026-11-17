# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@infra
Feature: Release manifest

  Each release names the exact images it ships, so that an installation can
  tell which images belong to a version and which versions it may update from.

  Scenario: A release manifest names both images by digest
    Given a release "1.2.3" has been built with its server and web images
    When the release manifest is generated
    Then the manifest belongs to version "1.2.3"
    And the manifest names the server and web images by digest

  Scenario: A release manifest states the oldest version that can update to it
    Given a release "1.2.3" has been built with its server and web images
    When the release manifest is generated
    Then the manifest states the oldest version that can update to it

  Scenario: A release manifest with a missing image digest is refused
    Given a release "1.2.3" has been built with its server image but no web image digest
    When the release manifest is generated
    Then the release manifest is refused
