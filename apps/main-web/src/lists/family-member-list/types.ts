// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CurrentUserRole, FamilyMember } from "../../types.js";

export type FamilyMemberListProps = {
  readonly members: readonly FamilyMember[];
  readonly selfUserId: string;
  readonly canManage: boolean;
  readonly onChangeRole: (userId: string, role: CurrentUserRole) => void;
  readonly onRemove: (userId: string) => void;
};
