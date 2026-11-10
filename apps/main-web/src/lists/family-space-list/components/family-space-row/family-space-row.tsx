// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, IconTile, Text } from "@offgrid/ui";
import { MaterialIcon } from "../../../../icons/material-icon/material-icon.js";
import {
  FAMILY_ACCENT_COLORS,
  FAMILY_PURPOSE_ICON_NAMES,
  FAMILY_PURPOSE_LABEL_TEXT_IDS,
} from "../../../../families/family-appearance.js";
import type { FamilySpaceRowProps } from "./types.js";
import {
  familySpaceCardStyle,
  familySpaceFooterStyle,
  familySpaceHeaderStyle,
  familySpaceIdentityStyle,
  familySpaceNameStyle,
  familySpaceRolePillStyle,
} from "./styles.js";

export const FamilySpaceRow = ({ space, isActive, onSwitch, onLeave }: FamilySpaceRowProps) => (
  <li
    style={familySpaceCardStyle(FAMILY_ACCENT_COLORS[space.accent].background, isActive)}
    data-testid="family-space-row"
  >
    <div style={familySpaceHeaderStyle}>
      <div style={familySpaceIdentityStyle}>
        <IconTile size="2.5rem" {...FAMILY_ACCENT_COLORS[space.accent]}>
          <MaterialIcon
            name={FAMILY_PURPOSE_ICON_NAMES[space.purpose]}
            size="20px"
            color="currentColor"
          />
        </IconTile>
        <div style={familySpaceNameStyle}>
          <Text variant="label" value={space.name} />
          <Text variant="caption" textId={FAMILY_PURPOSE_LABEL_TEXT_IDS[space.purpose]} />
        </div>
      </div>
      <span style={familySpaceRolePillStyle}>
        <Text
          variant="caption"
          textId={space.role === "admin" ? "userMenu.roleAdmin" : "userMenu.roleMember"}
        />
      </span>
    </div>
    <div style={familySpaceFooterStyle}>
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
