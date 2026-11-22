// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, IconTile, MaterialIcon, Text } from "@offgrid/ui";
import { Link } from "react-router-dom";
import { ACTIVE_DRIVE_GLYPH, DRIVE_KIND_GLYPHS } from "./constants.js";
import {
  driveSwitcherRowActiveTextStyle,
  driveSwitcherRowNameStyle,
  driveSwitcherRowStyle,
  driveSwitcherRowTextStyle,
} from "./styles.js";
import type { DriveSwitcherRowProps } from "./types.js";

export const DriveSwitcherRow = ({ name, kind, to, active }: DriveSwitcherRowProps) => (
  <Link
    to={to}
    className="og-focusable"
    style={driveSwitcherRowStyle(active)}
    aria-current={active ? "page" : undefined}
    title={name}
    data-testid="drive-switcher-row"
    data-drive-kind={kind}
  >
    <IconTile
      size="2.25rem"
      background={active ? cssVar("color-primary") : cssVar("color-surface")}
      color={active ? cssVar("color-accent-fg") : cssVar("color-primary")}
    >
      <MaterialIcon name={DRIVE_KIND_GLYPHS[kind]} size="1.125rem" color="currentColor" filled />
    </IconTile>
    <span style={driveSwitcherRowTextStyle}>
      <Text
        variant="body"
        element="span"
        value={name}
        style={driveSwitcherRowNameStyle}
        data-testid="drive-switcher-row-name"
      />
      {active ? (
        <Text
          variant="label"
          element="span"
          textId="files.drives.active"
          style={driveSwitcherRowActiveTextStyle}
          aria-hidden="true"
        />
      ) : null}
    </span>
    {active ? (
      <MaterialIcon
        name={ACTIVE_DRIVE_GLYPH}
        size="1.25rem"
        color={cssVar("color-primary")}
        filled
      />
    ) : null}
  </Link>
);
