// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { changeFamilyMemberRole } from "../../families/family-members.js";
import { FamilyRosterRow } from "./components/family-roster-row/family-roster-row.js";
import { useFamilyMembers } from "./use-family-members.js";
import type { FamilyRosterProps } from "./types.js";
import { rosterGroupStyle, rosterHeaderStyle, rosterSectionStyle } from "./styles.js";

export const FamilyRoster = ({ familyId, viewerUserId, viewerRole }: FamilyRosterProps) => {
  const { t } = useTranslation();
  const { members, status, reload } = useFamilyMembers(familyId);
  const [failed, setFailed] = useState(false);

  const changeRole = async (userId: string, role: "admin" | "member") => {
    setFailed(false);
    try {
      await changeFamilyMemberRole(familyId, userId, role);
      await reload();
    } catch {
      setFailed(true);
    }
  };

  return (
    <section style={rosterSectionStyle} aria-labelledby="family-roster-heading">
      <div style={rosterHeaderStyle}>
        <Text variant="label" id="family-roster-heading" textId="families.rosterHeading" />
        {status === "ready" && (
          <Text variant="caption" value={t("families.rosterCount", { count: members.length })} />
        )}
      </div>
      {status === "loading" && <Text variant="status" textId="families.loading" />}
      {status === "failed" && (
        <div role="alert">
          <Text variant="error" textId="families.rosterFailed" />
        </div>
      )}
      {status === "ready" && (
        <ul data-testid="family-roster" style={rosterGroupStyle}>
          {members.map((member, index) => (
            <FamilyRosterRow
              key={member.userId}
              member={member}
              isViewer={member.userId === viewerUserId}
              canChangeRole={viewerRole === "admin" && member.userId !== viewerUserId}
              divided={index > 0}
              onRoleChange={(role) => void changeRole(member.userId, role)}
            />
          ))}
        </ul>
      )}
      {failed && (
        <div role="alert">
          <Text variant="error" textId="families.roleChangeFailed" />
        </div>
      )}
    </section>
  );
};
