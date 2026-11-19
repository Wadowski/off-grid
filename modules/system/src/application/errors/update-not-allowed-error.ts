// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export class UpdateNotAllowedError extends Error {
  constructor() {
    super("The running version cannot update to the latest release");
    this.name = "UpdateNotAllowedError";
  }
}
