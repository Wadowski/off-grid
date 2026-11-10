// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Text, cssVar } from "@offgrid/ui";
import { MaterialIcon } from "../../../../icons/material-icon/material-icon.js";
import type { FamilySpaceRowProps } from "./types.js";
import {
  familySpaceActionsStyle,
  familySpaceIconStyle,
  familySpaceIdentityStyle,
  familySpaceRowStyle,
} from "./styles.js";

export const FamilySpaceRow = ({ space, isActive, onSwitch, onLeave }: FamilySpaceRowProps) => (
  <li style={familySpaceRowStyle} data-testid="family-space-row">
    <div style={familySpaceIdentityStyle}>
      <div style={familySpaceIconStyle}>
        <MaterialIcon name="home" size="20px" color={cssVar("color-accent")} />
      </div>
      <div>
        <Text variant="label" value={space.name} />
        <Text
          variant="status"
          textId={space.role === "admin" ? "families.roleAdmin" : "families.roleMember"}
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
