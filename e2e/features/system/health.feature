# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@smoke @infra
Feature: Server health

  The server reports that it is running, so operators and the end-to-end suite can check it.

  Scenario: Running server reports it is healthy
    When the health of the server is checked
    Then the server reports that it is up
