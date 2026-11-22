// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { toFolderPath } from "../../../../../../files/to-folder-path.js";
import { DriveSwitcherRow } from "../drive-switcher-row/drive-switcher-row.js";
import { driveSwitcherGroupListStyle, driveSwitcherGroupStyle } from "./styles.js";
import type { DriveSwitcherGroupProps } from "./types.js";

export const DriveSwitcherGroup = ({
  captionTextId,
  drives,
  activeDriveId,
  emptyTextId,
}: DriveSwitcherGroupProps) => (
  <div style={driveSwitcherGroupStyle}>
    <Text variant="label" textId={captionTextId} />
    {drives.length === 0 && emptyTextId !== undefined ? (
      <Text variant="caption" textId={emptyTextId} />
    ) : (
      <ul style={driveSwitcherGroupListStyle}>
        {drives.map((drive) => (
          <li key={drive.id}>
            <DriveSwitcherRow
              name={drive.name}
              kind={drive.familyId === null ? "personal" : "family"}
              to={toFolderPath(drive.id)}
              active={drive.id === activeDriveId}
            />
          </li>
        ))}
      </ul>
    )}
  </div>
);
