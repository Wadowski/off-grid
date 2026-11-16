// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export class FamilyMembershipOutOfOrderError extends Error {
  constructor() {
    super("A family membership change arrived before an earlier change it depends on.");
    this.name = "FamilyMembershipOutOfOrderError";
  }
}
