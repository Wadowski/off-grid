// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export class AdminRequiredError extends Error {
  constructor() {
    super("Only an instance admin can manage updates");
    this.name = "AdminRequiredError";
  }
}
