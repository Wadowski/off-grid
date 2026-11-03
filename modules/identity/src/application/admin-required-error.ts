// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export class AdminRequiredError extends Error {
  constructor() {
    super("An active instance admin is required");
    this.name = "AdminRequiredError";
  }
}
