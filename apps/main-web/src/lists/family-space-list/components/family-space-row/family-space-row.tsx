// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, IconTile, Text } from "@offgrid/ui";
import { MaterialIcon } from "../../../../icons/material-icon/material-icon.js";
import {
  FAMILY_ACCENT_COLORS,
  FAMILY_PURPOSE_ICON_NAMES,
} from "../../../../families/family-appearance.js";
import type { FamilySpaceRowProps } from "./types.js";
import {
  familySpaceActionsStyle,
  familySpaceIdentityStyle,
  familySpaceRowStyle,
} from "./styles.js";

export const FamilySpaceRow = ({
  space,
  isActive,
  divided,
  onSwitch,
  onLeave,
}: FamilySpaceRowProps) => (
  <li style={familySpaceRowStyle(isActive, divided)} data-testid="family-space-row">
    <div style={familySpaceIdentityStyle}>
      <IconTile size="2.5rem" {...FAMILY_ACCENT_COLORS[space.accent]}>
        <MaterialIcon
          name={FAMILY_PURPOSE_ICON_NAMES[space.purpose]}
          size="20px"
          color="currentColor"
        />
      </IconTile>
      <div>
        <Text variant="label" value={space.name} />
        <Text
          variant="status"
          textId={space.role === "admin" ? "userMenu.roleAdmin" : "userMenu.roleMember"}
        />
      </div>
    </div>
    <div style={familySpaceActionsStyle}>
      {isActive ? (
        <Text variant="status" textId="families.activeSpace" />
      ) : (
        <Button variant="secondary" data-testid="family-space-switch" onClick={onSwitch}>
          <Text variant="action" textId="families.switch" />
        </Button>
      )}
      <Button variant="ghost" data-testid="family-space-leave" onClick={onLeave}>
        <Text variant="error" textId="families.leave" />
      </Button>
    </div>
  </li>
);
