// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CurrentUserRole, FamilyMember } from "../../../../types.js";

export type FamilyMemberRowProps = {
  readonly member: FamilyMember;
  readonly isSelf: boolean;
  readonly canManage: boolean;
  readonly onChangeRole: (role: CurrentUserRole) => void;
  readonly onRemove: () => void;
};
