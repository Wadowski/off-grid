// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { useState } from "react";
import {
  sectionCardStyle,
  sectionHeaderStyle,
  sectionStyle,
} from "../../../settings-page/components/settings-section/styles.js";
import { AdminPersonRow } from "../admin-person-row/admin-person-row.js";
import type { IssuedResetCode } from "../../types.js";
import { adminResetCodeStyle } from "../../styles.js";
import type { AdminPeopleSectionProps } from "./types.js";

export const AdminPeopleSection = ({ users, onChanged }: AdminPeopleSectionProps) => {
  const [issuedCode, setIssuedCode] = useState<IssuedResetCode>();
  const activeAdminCount = users.filter(
    (user) => user.instanceRole === "admin" && user.status === "active",
  ).length;

  return (
    <section style={sectionStyle}>
      <div style={sectionHeaderStyle}>
        <Text variant="caption" textId="admin.peopleHeading" />
      </div>
      <div style={sectionCardStyle}>
        {users.map((user, index) => (
          <AdminPersonRow
            key={user.id}
            user={user}
            isFirst={index === 0}
            isLastActiveAdmin={activeAdminCount <= 1}
            onChanged={onChanged}
            onResetCode={setIssuedCode}
          />
        ))}
        {issuedCode !== undefined && (
          <div data-testid="admin-reset-code" style={adminResetCodeStyle}>
            <Text variant="status" textId="admin.resetCodeIntro" />
            <Text variant="subheading" value={issuedCode.code} />
            <Text variant="caption" textId="admin.resetCodeInstruction" />
            <Text variant="label" textId="admin.resetCodeFor" />
            <Text variant="body" value={issuedCode.displayName} />
          </div>
        )}
      </div>
    </section>
  );
};
