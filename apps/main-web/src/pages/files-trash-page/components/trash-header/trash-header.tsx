// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { toFolderPath } from "../../../../files/to-folder-path.js";
import { BackLink } from "../../../files-page/components/back-link/back-link.js";
import type { TrashHeaderProps } from "./types.js";

export const TrashHeader = ({ driveId, driveName }: TrashHeaderProps) => (
  <header>
    {driveName === null ? null : <BackLink to={toFolderPath(driveId)} parentName={driveName} />}
    <Text variant="heading" textId="files.trash.heading" />
  </header>
);
