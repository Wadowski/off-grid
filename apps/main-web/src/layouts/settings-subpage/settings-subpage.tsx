// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { Link } from "react-router-dom";
import { MaterialIcon } from "../../icons/material-icon/material-icon.js";
import {
  settingsBackLinkStyle,
  settingsSubpageCenteredStyle,
  settingsSubpageContentStyle,
  settingsSubpageStyle,
} from "./styles.js";
import type { SettingsSubpageProps } from "./types.js";

export const SettingsSubpage = ({
  titleTextId,
  centered = false,
  children,
}: SettingsSubpageProps) => (
  <div
    style={
      centered ? { ...settingsSubpageStyle, ...settingsSubpageCenteredStyle } : settingsSubpageStyle
    }
  >
    <Link to="/settings" style={settingsBackLinkStyle}>
      <MaterialIcon name="arrow_back" size="18px" color="currentColor" />
      <Text variant="action" textId="settings.back" />
    </Link>
    <Text variant="heading" textId={titleTextId} />
    <div style={settingsSubpageContentStyle}>{children}</div>
  </div>
);
