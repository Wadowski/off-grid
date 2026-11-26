// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, IconTile, MaterialIcon, Text } from "@offgrid/ui";
import { Link } from "react-router-dom";
import { driveSwitcherRowStyle, driveSwitcherRowTextStyle } from "../drive-switcher-row/styles.js";
import type { DriveSwitcherTrashLinkProps } from "./types.js";

export const DriveSwitcherTrashLink = ({ to, active }: DriveSwitcherTrashLinkProps) => (
  <Link
    to={to}
    className="og-focusable"
    style={driveSwitcherRowStyle(active)}
    aria-current={active ? "page" : undefined}
    data-testid="drive-switcher-trash"
  >
    <IconTile
      size="2.25rem"
      background={active ? cssVar("color-primary") : cssVar("color-surface")}
      color={active ? cssVar("color-accent-fg") : cssVar("color-primary")}
    >
      <MaterialIcon name="delete" size="1.125rem" color="currentColor" filled />
    </IconTile>
    <span style={driveSwitcherRowTextStyle}>
      <Text variant="body" element="span" textId="files.drives.trash" />
    </span>
  </Link>
);
