// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export class CurrentPasswordIncorrectError extends Error {
  constructor() {
    super("The current password is incorrect");
    this.name = "CurrentPasswordIncorrectError";
  }
}
