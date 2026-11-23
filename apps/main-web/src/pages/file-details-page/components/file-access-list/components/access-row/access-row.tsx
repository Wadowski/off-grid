// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Avatar, Text } from "@offgrid/ui";
import { useTranslation } from "react-i18next";
import { initialsOf } from "../../../../../../session/initials-of.js";
import { ACCESS_ROLE_TEXT_IDS } from "./constants.js";
import { accessCanEditStyle, accessRowStyle, accessRowTextStyle } from "./styles.js";
import type { AccessRowProps } from "./types.js";

export const AccessRow = ({ name, role, isFirst }: AccessRowProps) => {
  const { t } = useTranslation();
  return (
    <li style={accessRowStyle(isFirst)} data-testid="file-access-row">
      <Avatar initials={initialsOf(name ?? t("files.details.access.unnamed"))} />
      <div style={accessRowTextStyle}>
        {name === null ? (
          <Text variant="body" textId="files.details.access.unnamed" />
        ) : (
          <Text variant="body" value={name} />
        )}
        <Text variant="caption" textId={ACCESS_ROLE_TEXT_IDS[role]} />
      </div>
      <Text variant="caption" textId="files.details.access.canEdit" style={accessCanEditStyle} />
    </li>
  );
};
