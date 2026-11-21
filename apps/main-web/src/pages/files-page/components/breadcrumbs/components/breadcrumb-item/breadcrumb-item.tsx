// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, MaterialIcon, Text } from "@offgrid/ui";
import { Link } from "react-router-dom";
import { toFolderPath } from "../../../../../../files/to-folder-path.js";
import {
  breadcrumbItemStyle,
  breadcrumbLinkStyle,
  breadcrumbSeparatorStyle,
  breadcrumbTextStyle,
} from "./styles.js";
import type { BreadcrumbItemProps } from "./types.js";

export const BreadcrumbItem = ({ driveId, crumb, index, isCurrent }: BreadcrumbItemProps) => {
  const path = crumb.kind === "drive" ? toFolderPath(driveId) : toFolderPath(driveId, crumb.id);

  return (
    <li style={breadcrumbItemStyle} data-testid={`files-breadcrumb-${index}`}>
      {index > 0 ? (
        <span style={breadcrumbSeparatorStyle}>
          <MaterialIcon name="chevron_right" size="18px" color={cssVar("color-outline")} />
        </span>
      ) : null}
      {isCurrent ? (
        <Text
          variant="label"
          value={crumb.name}
          aria-current="page"
          data-testid="files-breadcrumb-current"
          style={breadcrumbTextStyle}
        />
      ) : (
        <Link to={path} className="og-focusable" style={breadcrumbLinkStyle}>
          <Text variant="link" value={crumb.name} style={breadcrumbTextStyle} />
        </Link>
      )}
    </li>
  );
};
