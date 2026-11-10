// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Avatar, Button, Select, Tag, Text } from "@offgrid/ui";
import type { ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import { initialsOf } from "../../../../session/initials-of.js";
import type { CurrentUserRole } from "../../../../types.js";
import type { FamilyMemberRowProps } from "./types.js";
import {
  familyMemberActionsStyle,
  familyMemberIdentityStyle,
  familyMemberNameLineStyle,
  familyMemberNameStyle,
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
  const roleOptions = (["admin", "member"] as const).map((role) => ({
    value: role,
    label: t(role === "admin" ? "familyManager.roleAdmin" : "familyManager.roleMember"),
  }));
  const roleTextId =
    member.role === "admin" ? "familyManager.roleAdmin" : "familyManager.roleMember";
  const changeRole = (event: ChangeEvent<HTMLSelectElement>) =>
    onChangeRole(event.target.value as CurrentUserRole);

  return (
    <li style={familyMemberRowStyle} data-testid="family-member-row">
      <div style={familyMemberIdentityStyle}>
        <Avatar initials={member.displayName === null ? "?" : initialsOf(member.displayName)} />
        <div style={familyMemberNameStyle}>
          <div style={familyMemberNameLineStyle}>
            <Text variant="label" value={member.displayName ?? t("familyManager.unnamed")} />
            {isSelf && (
              <Tag tone="accent">
                <Text variant="caption" textId="familyManager.you" />
              </Tag>
            )}
          </div>
        </div>
      </div>
      {canManage ? (
        <div style={familyMemberActionsStyle}>
          <label>
            <Text variant="caption" textId="familyManager.roleLabel" />{" "}
            <Select
              value={member.role}
              options={roleOptions}
              onChange={changeRole}
              data-testid="family-member-role"
            />
          </label>
          <Button variant="ghost" data-testid="family-member-remove" onClick={onRemove}>
            <Text variant="error" textId="familyManager.remove" />
          </Button>
        </div>
      ) : (
        <Tag tone={member.role === "admin" ? "accent" : "neutral"}>
          <Text variant="caption" textId={roleTextId} />
        </Tag>
      )}
    </li>
  );
};
