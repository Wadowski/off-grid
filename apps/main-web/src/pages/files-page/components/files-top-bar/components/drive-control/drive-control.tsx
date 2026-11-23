// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, cssVar, MaterialIcon, Text } from "@offgrid/ui";
import { Link } from "react-router-dom";
import { toDriveControlText } from "./to-drive-control-text.js";
import { driveControlNameStyle, driveControlTextStyle } from "./styles.js";
import type { DriveControlProps } from "./types.js";

export const DriveControl = ({ status, activeDriveName }: DriveControlProps) => {
  const text = toDriveControlText(status, activeDriveName);

  return (
    <Button
      as={Link}
      to="/files/drives"
      variant="ghost"
      align="start"
      fullWidth
      data-testid="files-top-bar-drive-control"
    >
      <span style={driveControlTextStyle}>
        {text.kind === "name" ? (
          <Text
            variant="subheading"
            element="span"
            value={text.name}
            style={driveControlNameStyle}
            data-testid="files-top-bar-drive-name"
          />
        ) : (
          <Text variant="body" element="span" textId={text.textId} />
        )}
      </span>
      <MaterialIcon name="expand_more" size="20px" color={cssVar("color-primary")} />
    </Button>
  );
};
