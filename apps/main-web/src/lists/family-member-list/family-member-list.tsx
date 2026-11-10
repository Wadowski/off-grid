// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { FamilyMemberRow } from "./components/family-member-row/family-member-row.js";
import type { FamilyMemberListProps } from "./types.js";
import { familyMemberListStyle } from "./styles.js";

export const FamilyMemberList = ({
  members,
  selfUserId,
  canManage,
  onChangeRole,
  onRemove,
}: FamilyMemberListProps) => (
  <ul data-testid="family-member-list" style={familyMemberListStyle}>
    {members.map((member) => (
      <FamilyMemberRow
        key={member.userId}
        member={member}
        isSelf={member.userId === selfUserId}
        canManage={canManage}
        onChangeRole={(role) => onChangeRole(member.userId, role)}
        onRemove={() => onRemove(member.userId)}
      />
    ))}
  </ul>
);
