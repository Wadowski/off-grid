// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export class AdminAlreadyActiveError extends Error {
  constructor() {
    super("An active instance admin already exists");
    this.name = "AdminAlreadyActiveError";
  }
}
