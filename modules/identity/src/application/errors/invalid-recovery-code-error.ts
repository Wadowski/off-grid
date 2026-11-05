// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export class InvalidRecoveryCodeError extends Error {
  constructor() {
    super("The recovery code is invalid or has already been used");
    this.name = "InvalidRecoveryCodeError";
  }
}
