// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export class InvalidCredentialsError extends Error {
  constructor() {
    super("Email or password is incorrect");
    this.name = "InvalidCredentialsError";
  }
}
