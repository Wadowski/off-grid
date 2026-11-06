// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export class RecoveryLockedError extends Error {
  constructor() {
    super("Too many failed recovery attempts. Try again later");
    this.name = "RecoveryLockedError";
  }
}
