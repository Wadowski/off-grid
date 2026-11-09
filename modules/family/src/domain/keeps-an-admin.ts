// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FamilyRole } from "@offgrid/access-control";

export const keepsAnAdmin = (change: {
  readonly currentRole: FamilyRole;
  readonly nextRole: FamilyRole | null;
  readonly adminCount: number;
}): boolean =>
  change.currentRole !== "admin" || change.nextRole === "admin" || change.adminCount > 1;
