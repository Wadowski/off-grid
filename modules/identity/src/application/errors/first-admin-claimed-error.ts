// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export class FirstAdminClaimedError extends Error {
  constructor() {
    super("The first account on this instance was created at the same time");
    this.name = "FirstAdminClaimedError";
  }
}
