// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import {
  profileAvatarStyle,
  profileCardStyle,
  profileRoleChipStyle,
  profileTextStyle,
} from "./styles.js";
import type { SettingsProfileCardProps } from "./types.js";

export const SettingsProfileCard = ({
  initials,
  displayName,
  email,
  roleTextId,
}: SettingsProfileCardProps) => (
  <div style={profileCardStyle}>
    <span style={profileAvatarStyle} aria-hidden="true">
      {initials}
    </span>
    <div style={profileTextStyle}>
      <Text variant="label" value={displayName} />
      <Text variant="status" value={email} />
      <span style={profileRoleChipStyle}>
        <Text variant="caption" textId={roleTextId} />
      </span>
    </div>
  </div>
);
