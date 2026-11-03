// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export class SessionEndedError extends Error {
  constructor() {
    super("The session has ended, please sign in again");
    this.name = "SessionEndedError";
  }
}
