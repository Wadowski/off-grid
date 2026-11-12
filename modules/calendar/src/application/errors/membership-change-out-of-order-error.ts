// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export class MembershipChangeOutOfOrderError extends Error {
  constructor() {
    super("membership change arrived before an earlier change");
    this.name = "MembershipChangeOutOfOrderError";
  }
}
