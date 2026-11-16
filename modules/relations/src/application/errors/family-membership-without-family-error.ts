// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export class FamilyMembershipWithoutFamilyError extends Error {
  constructor() {
    super("A family membership change has no family.");
    this.name = "FamilyMembershipWithoutFamilyError";
  }
}
