// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { Link } from "react-router-dom";
import { MaterialIcon } from "../../../../icons/material-icon/material-icon.js";
import {
  appsListRowChevronColor,
  appsListRowChevronStyle,
  appsListRowDisabledStyle,
  appsListRowStyle,
  appsListRowTileStyle,
} from "./styles.js";
import type { AppsListRowProps } from "./types.js";

export const AppsListRow = ({ item }: AppsListRowProps) => {
  const content = (
    <>
      <span style={appsListRowTileStyle(item.id)}>
        <MaterialIcon name={item.iconName} size="22px" color="currentColor" />
      </span>
      <Text variant="label" textId={item.labelTextId} />
      <span style={appsListRowChevronStyle}>
        <MaterialIcon name="chevron_right" size="18px" color={appsListRowChevronColor} />
      </span>
    </>
  );

  if (item.path === undefined) {
    return (
      <span style={appsListRowDisabledStyle} aria-disabled="true">
        {content}
      </span>
    );
  }

  return (
    <Link
      to={item.path}
      style={appsListRowStyle}
      className="og-focusable"
      data-testid="apps-list-row"
    >
      {content}
    </Link>
  );
};
