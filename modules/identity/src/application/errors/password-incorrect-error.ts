// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export class PasswordIncorrectError extends Error {
  constructor() {
    super("The password is incorrect");
    this.name = "PasswordIncorrectError";
  }
}
