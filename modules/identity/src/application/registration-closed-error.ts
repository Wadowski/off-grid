// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export class RegistrationClosedError extends Error {
  constructor() {
    super("Registration is closed on this instance");
    this.name = "RegistrationClosedError";
  }
}
