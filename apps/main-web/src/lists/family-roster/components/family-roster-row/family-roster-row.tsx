// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { IconTile, Text, cssVar } from "@offgrid/ui";
import { useTranslation } from "react-i18next";
import type { CurrentUserRole } from "../../../../types.js";
import type { FamilyMemberView } from "../../types.js";
import {
  rosterIdentityStyle,
  rosterNameLineStyle,
  rosterNameStyle,
  rosterRowStyle,
  rosterSelectStyle,
} from "./styles.js";

export type FamilyRosterRowProps = {
  readonly member: FamilyMemberView;
  readonly isViewer: boolean;
  readonly canChangeRole: boolean;
  readonly divided: boolean;
  readonly onRoleChange: (role: CurrentUserRole) => void;
};

const initialsOf = (name: string | null): string => {
  if (name === null) {
    return "?";
  }
  return name
    .split(" ")
    .filter((part) => part.length > 0)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
};

export const FamilyRosterRow = ({
  member,
  isViewer,
  canChangeRole,
  divided,
  onRoleChange,
}: FamilyRosterRowProps) => {
  const { t } = useTranslation();
  const name = member.displayName ?? t("families.rosterUnnamed");

  return (
    <li style={rosterRowStyle(divided)} data-testid="family-roster-row">
      <div style={rosterIdentityStyle}>
        <IconTile
          size="2.5rem"
          shape="circle"
          background={cssVar("color-accent-soft")}
          color={cssVar("color-accent")}
        >
          <Text variant="label" value={initialsOf(member.displayName)} />
        </IconTile>
        <div style={rosterNameStyle}>
          <div style={rosterNameLineStyle}>
            <Text variant="label" value={name} />
            {isViewer && <Text variant="caption" textId="families.rosterYou" />}
          </div>
        </div>
      </div>
      {canChangeRole ? (
        <select
          aria-label={t("families.rosterRoleOf", { name })}
          value={member.role}
          style={rosterSelectStyle}
          onChange={(event) => onRoleChange(event.target.value as CurrentUserRole)}
        >
          <option value="admin">{t("userMenu.roleAdmin")}</option>
          <option value="member">{t("userMenu.roleMember")}</option>
        </select>
      ) : (
        <Text
          variant="caption"
          textId={member.role === "admin" ? "userMenu.roleAdmin" : "userMenu.roleMember"}
        />
      )}
    </li>
  );
};
