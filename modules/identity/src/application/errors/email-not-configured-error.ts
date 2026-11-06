// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export class EmailNotConfiguredError extends Error {
  constructor() {
    super("Email is not configured on this server");
    this.name = "EmailNotConfiguredError";
  }
}
