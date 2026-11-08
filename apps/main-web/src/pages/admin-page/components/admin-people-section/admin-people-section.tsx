// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { useState } from "react";
import { AdminPersonRow } from "../admin-person-row/admin-person-row.js";
import type { IssuedResetCode } from "../../types.js";
import { adminSectionStyle } from "../../styles.js";
import type { AdminPeopleSectionProps } from "./types.js";

export const AdminPeopleSection = ({ users, onChanged }: AdminPeopleSectionProps) => {
  const [issuedCode, setIssuedCode] = useState<IssuedResetCode>();
  const activeAdminCount = users.filter(
    (user) => user.instanceRole === "admin" && user.status === "active",
  ).length;

  return (
    <section style={adminSectionStyle}>
      <Text variant="subheading" textId="admin.peopleHeading" />
      {users.map((user) => (
        <AdminPersonRow
          key={user.id}
          user={user}
          isLastActiveAdmin={activeAdminCount <= 1}
          onChanged={onChanged}
          onResetCode={setIssuedCode}
        />
      ))}
      {issuedCode !== undefined && (
        <div data-testid="admin-reset-code">
          <Text variant="status" textId="admin.resetCodeIntro" />
          <Text variant="label" value={issuedCode.code} />
          <Text variant="caption" textId="admin.resetCodeInstruction" />
          <Text variant="caption" value={issuedCode.displayName} />
        </div>
      )}
    </section>
  );
};
