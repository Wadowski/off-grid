// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export class InvalidResetCodeError extends Error {
  constructor() {
    super("The reset code is invalid, expired or already used");
    this.name = "InvalidResetCodeError";
  }
}
