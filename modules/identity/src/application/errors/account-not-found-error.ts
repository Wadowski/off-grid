// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export class AccountNotFoundError extends Error {
  constructor() {
    super("No account matches the request");
    this.name = "AccountNotFoundError";
  }
}
