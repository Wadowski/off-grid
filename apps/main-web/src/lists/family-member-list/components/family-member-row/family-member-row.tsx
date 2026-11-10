// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Select, Text } from "@offgrid/ui";
import type { ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import type { CurrentUserRole } from "../../../../types.js";
import type { FamilyMemberRowProps } from "./types.js";
import {
  familyMemberActionsStyle,
  familyMemberIdentityStyle,
  familyMemberRowStyle,
} from "./styles.js";

export const FamilyMemberRow = ({
  member,
  isSelf,
  canManage,
  onChangeRole,
  onRemove,
}: FamilyMemberRowProps) => {
  const { t } = useTranslation();
  const roleOptions: readonly CurrentUserRole[] = ["admin", "member"];
  const changeRole = (event: ChangeEvent<HTMLSelectElement>) =>
    onChangeRole(event.target.value as CurrentUserRole);

  return (
    <li style={familyMemberRowStyle} data-testid="family-member-row">
      <div style={familyMemberIdentityStyle}>
        <Text variant="label" value={member.displayName ?? t("familyManager.unnamed")} />
        {isSelf && <Text variant="caption" textId="familyManager.you" />}
      </div>
      {canManage ? (
        <div style={familyMemberActionsStyle}>
          <label>
            <Text variant="caption" textId="familyManager.roleLabel" />{" "}
            <Select value={member.role} onChange={changeRole} data-testid="family-member-role">
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {t(role === "admin" ? "familyManager.roleAdmin" : "familyManager.roleMember")}
                </option>
              ))}
            </Select>
          </label>
          <Button variant="ghost" data-testid="family-member-remove" onClick={onRemove}>
            <Text variant="error" textId="familyManager.remove" />
          </Button>
        </div>
      ) : (
        <Text
          variant="caption"
          textId={member.role === "admin" ? "familyManager.roleAdmin" : "familyManager.roleMember"}
        />
      )}
    </li>
  );
};
