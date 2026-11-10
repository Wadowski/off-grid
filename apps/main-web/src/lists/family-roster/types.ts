// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CurrentUserRole } from "../../types.js";

export type RosterStatus = "loading" | "ready" | "failed";

export type FamilyMemberView = {
  readonly userId: string;
  readonly displayName: string | null;
  readonly role: CurrentUserRole;
  readonly joinedAt: string;
};

export type FamilyRosterProps = {
  readonly familyId: string;
  readonly viewerUserId: string;
  readonly viewerRole: CurrentUserRole;
};
