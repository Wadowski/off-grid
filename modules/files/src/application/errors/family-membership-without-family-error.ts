// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export class FamilyMembershipWithoutFamilyError extends Error {
  constructor() {
    super("family membership event has no family");
    this.name = "FamilyMembershipWithoutFamilyError";
  }
}
