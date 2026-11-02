// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export class LastAdminError extends Error {
  constructor() {
    super("The last active admin cannot be disabled");
    this.name = "LastAdminError";
  }
}
