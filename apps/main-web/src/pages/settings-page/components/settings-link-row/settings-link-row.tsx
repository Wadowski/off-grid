// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { Link } from "react-router-dom";
import { MaterialIcon } from "../../../../icons/material-icon/material-icon.js";
import { iconTileStyle, linkRowIcon, linkRowStyle, linkTextStyle } from "./styles.js";
import type { SettingsLinkRowProps } from "./types.js";

export const SettingsLinkRow = ({ link, isFirst }: SettingsLinkRowProps) => (
  <Link to={link.path} style={linkRowStyle(isFirst)}>
    <span style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: 0 }}>
      <span style={iconTileStyle(link.tone)} aria-hidden="true">
        <MaterialIcon name={link.iconName} size="19px" color="currentColor" />
      </span>
      <span style={linkTextStyle}>
        <Text variant="label" textId={link.labelTextId} />
        <Text variant="status" textId={link.descriptionTextId} />
      </span>
    </span>
    <MaterialIcon name="chevron_right" size="19px" color={linkRowIcon.chevron} />
  </Link>
);
